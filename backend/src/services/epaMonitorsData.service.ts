import axios from "axios";
import {EpaMonitorsData, HistoricalEpaMonitorsDataResponse} from "../types/epaMonitorsData.types";
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

// Fetch historical EPA Monitors Data for a location over the past year
export const fetchHistoricalEpaMonitorsDataForLocation = async (location: number, currentDate: string): Promise<EpaMonitorsData[]> => {
    try {
        // Calculate the date one year ago from the current date
        const currentDateObj = new Date(currentDate);
        const oneYearAgo = new Date(currentDateObj);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        // Format the date to YYYY-MM-DD format
        const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
        const currentDateStr = currentDateObj.toISOString().split('T')[0];
        
        logger.info(`Fetching historical EPA Monitors data for location ${location} from ${oneYearAgoStr} to ${currentDateStr}`);
        
        // Query MongoDB for historical data using report_date instead of datatime
        const historicalData = await EpaMonitorsDataModel.find({
            location: location,
            // Use report_date field instead of datatime
            report_date: {
                $gte: oneYearAgoStr,
                $lte: currentDateStr
            }
        }).sort({ report_date: 1, report_time: 1 }).lean();
        
        logger.info(`Found ${historicalData.length} historical records for location ${location}`);
        
        return historicalData as EpaMonitorsData[];
    } catch (error) {
        logger.error(`Failed to fetch historical data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        throw new Error(`Database query failed for historical data for location ${location}`);
    }
};

// Fetch historical EPA Monitors Data for a location organized by time periods
export const fetchHistoricalEpaMonitorsDataByPeriods = async (location: number, currentDate: string): Promise<HistoricalEpaMonitorsDataResponse> => {
    try {
        const currentDateObj = new Date(currentDate);
        
        // Calculate dates for different time periods
        const oneDayAgo = new Date(currentDateObj);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const oneWeekAgo = new Date(currentDateObj);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const oneMonthAgo = new Date(currentDateObj);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const threeMonthsAgo = new Date(currentDateObj);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const sixMonthsAgo = new Date(currentDateObj);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const oneYearAgo = new Date(currentDateObj);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        // Format dates to YYYY-MM-DD format
        const oneDayAgoStr = oneDayAgo.toISOString().split('T')[0];
        const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
        const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
        const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
        const currentDateStr = currentDateObj.toISOString().split('T')[0];
        
        logger.info(`Fetching historical EPA Monitors data for location ${location} for multiple time periods`);
        
        // Query MongoDB for all historical data within the past year
        const allHistoricalData = await EpaMonitorsDataModel.find({
            location: location,
            report_date: {
                $gte: oneYearAgoStr,
                $lte: currentDateStr
            }
        }).sort({ report_date: 1, report_time: 1 }).lean() as EpaMonitorsData[];
        
        logger.info(`Found ${allHistoricalData.length} total historical records for location ${location}`);
        
        // Filter data for each time period
        const oneDayData = allHistoricalData.filter(data => 
            data.report_date >= oneDayAgoStr && data.report_date <= currentDateStr
        );
        
        const oneWeekData = allHistoricalData.filter(data => 
            data.report_date >= oneWeekAgoStr && data.report_date <= currentDateStr
        );
        
        const oneMonthData = allHistoricalData.filter(data => 
            data.report_date >= oneMonthAgoStr && data.report_date <= currentDateStr
        );
        
        const threeMonthsData = allHistoricalData.filter(data => 
            data.report_date >= threeMonthsAgoStr && data.report_date <= currentDateStr
        );
        
        const sixMonthsData = allHistoricalData.filter(data => 
            data.report_date >= sixMonthsAgoStr && data.report_date <= currentDateStr
        );
        
        // One year data is the complete dataset
        const oneYearData = allHistoricalData;
        
        logger.info(`Filtered historical data by time periods for location ${location}:`);
        logger.info(`- One day: ${oneDayData.length} records`);
        logger.info(`- One week: ${oneWeekData.length} records`);
        logger.info(`- One month: ${oneMonthData.length} records`);
        logger.info(`- Three months: ${threeMonthsData.length} records`);
        logger.info(`- Six months: ${sixMonthsData.length} records`);
        logger.info(`- One year: ${oneYearData.length} records`);
        
        return {
            oneDay: oneDayData,
            oneWeek: oneWeekData,
            oneMonth: oneMonthData,
            threeMonths: threeMonthsData,
            sixMonths: sixMonthsData,
            oneYear: oneYearData
        };
    } catch (error) {
        logger.error(`Failed to fetch historical data by periods for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        throw new Error(`Database query failed for historical data by periods for location ${location}`);
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

