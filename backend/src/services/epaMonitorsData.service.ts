import axios from "axios";
import {EpaMonitorsData, HistoricalEpaMonitorsDataResponse, PollutantSummaryData} from "../types/epaMonitorsData.types";
import logger from "../utils/logger";
import {shouldAlertUsersInLocation} from "./forecastingModelService";
import EpaMonitorsDataModel from "../models/epaMonitorsData.model";
import {alertUsersInLocations} from "./notificationService";

const BASE_URL = "http://34.132.171.41:8000/api/aqms_data/";

// Poll EPA Monitors Data Every 5 Minutes
export const pollEpaMonitorsData = async () => {
    try {
        const locations = Array.from({length: 21}, (_, i) => i + 1);

        // Fetch data for all locations concurrently
        const results = await Promise.allSettled(locations.map(fetchCurrentEpaMonitorsDataForLocation));

        // Extract fulfilled results and filter out rejected ones
        const aqmsData = results
            .filter(result => result.status === "fulfilled")
            .map(result => (result as PromiseFulfilledResult<EpaMonitorsData>).value);

        // Collect locations that need alerts based on the forecasting model
        const locationsNeedingAlerts: EpaMonitorsData[] = [];

        for (const data of aqmsData) { 
            // Determine if this location needs an alert using the forecasting model
            if (shouldAlertUsersInLocation(data.location, data)) {
                locationsNeedingAlerts.push(data);
            }
            // Store Data in MongoDB
            await storeEpaMonitorsData(data);
        }

        // Log locations that require an alert
        const alertLocationIds = locationsNeedingAlerts.map(data => data.location);
        logger.info(`Locations that require an alert based on forecasting model: ${alertLocationIds.join(", ") || "None"}`);
        
        // Send notifications to users in alert locations (only once, after the loop)
        if (locationsNeedingAlerts.length > 0) {
            await alertUsersInLocations(locationsNeedingAlerts);
            logger.info(`Push notifications sent to users in locations: ${alertLocationIds.join(", ")}`);
        }
    } catch (error) {
        logger.error(`Error polling EPA Monitors data: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
};

// Fetch latest EPA Monitors Data for a Single Location
export const fetchCurrentEpaMonitorsDataForLocation = async (location: number): Promise<EpaMonitorsData> => {
    try {
        const API_URL = `${BASE_URL}?location=${location}&date=&time=`;
        const response = await axios.get(API_URL);

        if (response.data.result !== 200 || !response.data.aqms) {
            throw new Error(`Invalid response structure for location ${location}`);
        }

        const aqms = response.data.aqms;
        
        // Create a Date object from report_date and report_time
        const reportDate = aqms["report_date"];
        const reportTime = aqms["report_time"];
        const reportDateTimeStr = `${reportDate}T${reportTime}`;
        const reportDateTime = new Date(reportDateTimeStr);

        return {
            id: aqms["id"],
            location: aqms["mn"],
            datatime: aqms["datatime"],
            report_date_time: reportDateTime,

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
            report_date_time: data.report_date_time,
        });

        if (!existingRecord) {
            await EpaMonitorsDataModel.create(data);
            logger.info(`✅ Stored EPA Monitors data for location ${data.location} at ${data.report_date_time}`);
        } else {
            logger.info(`⚠️ Duplicate data skipped for location ${data.location} at ${data.report_date_time}`);
        }
    } catch (error) {
        logger.error(`Error storing EPA Monitors data: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
};

export const getEpaMonitorsDataFor24HoursForLocation = async (location: number, currentDateTime: Date): Promise<EpaMonitorsData[]> => {
    try {
        // Calculate the date 24 hours ago from the current date
        const twentyFourHoursAgo = new Date(currentDateTime);
        twentyFourHoursAgo.setHours(currentDateTime.getHours() - 24);
        
        // Query the database for records within the last 24 hours for the specified location
        const data = await EpaMonitorsDataModel.find({
            location: location,
            report_date_time: {
                $gte: twentyFourHoursAgo,
                $lte: currentDateTime
            }
        }).sort({ report_date_time: 1 }); // Sort by date in ascending order
        
        logger.info(`Retrieved ${data.length} records for location ${location} in the last 24 hours`);

        console.log(data);
        return data;
    } catch (error) {
        logger.error(`Error retrieving 24-hour data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};