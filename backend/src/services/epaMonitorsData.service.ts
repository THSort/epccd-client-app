import axios from "axios";
import {EpaMonitorsData} from "../types/epaMonitorsData.types";
import logger from "../utils/logger";
import {shouldAlertUsersInLocation} from "./forecastingModelService";
import EpaMonitorsDataModel from "../models/epaMonitorsData.model";

const BASE_URL = "http://34.132.171.41:8000/api/aqms_data/";

// Poll EPA Monitors Data Every 5 Minutes
export const pollEpaMonitorsData = async () => {
    try {
        const locations = Array.from({length: 21}, (_, i) => i + 1);

        // Fetch data for all locations concurrently
        const results = await Promise.allSettled(locations.map(fetchEpaMonitorsDataForLocation));

        // Extract fulfilled results and filter out rejected ones
        const aqmsData = results
            .filter(result => result.status === "fulfilled")
            .map(result => (result as PromiseFulfilledResult<EpaMonitorsData>).value);

        const alertedLocations: number[] = [];

        for (const data of aqmsData) {
            if (shouldAlertUsersInLocation(data.location, data)) {
                alertedLocations.push(data.location);
            }
            // 🟢 Store Data in MongoDB
            await storeEpaMonitorsData(data);
        }

        logger.info(`Locations that require an alert: ${alertedLocations.join(", ")}`);
    } catch (error) {
        logger.error(`Error polling EPA Monitors data: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
};

// Fetch EPA Monitors Data for a Single Location
export const fetchEpaMonitorsDataForLocation = async (location: number): Promise<EpaMonitorsData> => {
    try {
        const API_URL = `${BASE_URL}?location=${location}&date=&time=`;
        const response = await axios.get(API_URL);

        if (response.data.result !== 200 || !response.data.aqms) {
            throw new Error(`Invalid response structure for location ${location}`);
        }

        const aqms = response.data.aqms;

        return {
            id: aqms["id"],
            location: aqms["mn"],
            datatime: aqms["datatime"],
            report_date: aqms["report_date"],
            report_time: aqms["report_time"],

            // Air Quality
            o3_ppb: parseFloat(aqms["o3_ppb_field"]),
            co_ppm: parseFloat(aqms["co_ppm_field"]),
            so2_ppb: parseFloat(aqms["so2_ppb_field"]),
            no_ppb: aqms["no_ppb_field"],
            no2_ppb: parseFloat(aqms["no2_ppb_field"]),
            nox_ppb: aqms["nox_ppb_field"],
            pm10_ug_m3: parseFloat(aqms["pm10_ug_m3_field"]),
            pm2_5_ug_m3: parseFloat(aqms["pm2_5_ug_m3_field"]),

            // Weather
            temperature: parseFloat(aqms["temperature_field"]),
            humidity: parseFloat(aqms["humidity_field"]),
            atmospheric_pressure_kpa: parseFloat(aqms["atmospheric_pressure_kpa_field"]),
            wind_speed_m_s: parseFloat(aqms["wind_speed_m_s_field"]),
            wind_direction: aqms["wind_direction_field"],
            rainfall_mm: aqms["rainfall_mm_field"],
            total_solar_radiation_w_m2: parseFloat(aqms["total_solar_radiation_w_m2_field"]),

            // AQI
            PM2_5_AQI: parseFloat(aqms["PM2.5_AQI"]),
            PM10_AQI: parseFloat(aqms["PM10_AQI"]),
            SO2_AQI: parseFloat(aqms["SO2_AQI"]),
            NO2_AQI: parseFloat(aqms["NO2_AQI"]),
            O3_AQI: parseFloat(aqms["O3_AQI"]),
            CO_AQI: parseFloat(aqms["CO_AQI"]),
        };
    } catch (error) {
        logger.error(`Failed to fetch data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        throw new Error(`API request failed for location ${location}`);
    }
};

// 🟢 Store EPA Monitors Data in MongoDB
const storeEpaMonitorsData = async (data: EpaMonitorsData) => {
    try {
        const existingRecord = await EpaMonitorsDataModel.findOne({
            location: data.location,
            report_date: data.report_date,
            report_time: data.report_time,
        });

        if (!existingRecord) {
            await EpaMonitorsDataModel.create(data);
            logger.info(`✅ Stored EPA Monitors data for location ${data.location} at ${data.report_date} and ${data.report_time}`);
        } else {
            logger.info(`⚠️ Duplicate data skipped for location ${data.location} at ${data.report_date} and ${data.report_time}`);
        }
    } catch (error) {
        logger.error(`Error storing EPA Monitors data: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
};

