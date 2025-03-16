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

// Fetch EPA Monitors Data Summary (Current, 24h Avg, Weekly Avg) for a location
export const fetchPollutantSummaryForLocation = async (location: number): Promise<PollutantSummaryData> => {
    try {
        // Get current date and time
        const currentDate = new Date();
        const currentDateStr = currentDate.toISOString().split('T')[0];
        const currentHour = currentDate.getHours();
        const currentMinute = currentDate.getMinutes();
        const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Calculate dates for different time periods
        const oneDayAgo = new Date(currentDate);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const oneDayAgoStr = oneDayAgo.toISOString().split('T')[0];
        
        // Always get data for the past 7 days (including today)
        const oneWeekAgo = new Date(currentDate);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 6); // 6 days ago + today = 7 days
        // Set time to 00:00:00 to include the entire day
        oneWeekAgo.setHours(0, 0, 0, 0);
        const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
        
        logger.info(`Fetching pollutant summary data for location ${location} up to ${currentDateStr} ${currentTimeStr}`);
        logger.info(`Weekly average will be calculated from ${oneWeekAgoStr} (past 7 days) to ${currentDateStr}`);
        
        // Fetch current data
        const currentData = await fetchCurrentEpaMonitorsDataForLocation(location);
        
        // Query MongoDB for historical data for the past day and week
        const historicalData = await EpaMonitorsDataModel.find({
            location: location,
            report_date: {
                $gte: oneWeekAgoStr,
                $lte: currentDateStr
            }
        }).sort({ report_date: 1, report_time: 1 }).lean() as EpaMonitorsData[];
        
        logger.info(`Found ${historicalData.length} historical records for location ${location} for summary calculation`);
        
        // Filter data to only include data up to the current time
        const filterByDateAndTime = (data: EpaMonitorsData[], startDate: string) => {
            return data.filter(item => {
                // Include all data from previous days
                if (item.report_date < currentDateStr && item.report_date >= startDate) {
                    return true;
                }
                
                // For the current day, only include data up to the current time
                if (item.report_date === currentDateStr) {
                    const itemTimeParts = item.report_time.split(':');
                    const itemHour = parseInt(itemTimeParts[0], 10);
                    const itemMinute = parseInt(itemTimeParts[1], 10);
                    
                    // Compare hours first, then minutes if hours are equal
                    if (itemHour < currentHour) {
                        return true;
                    } else if (itemHour === currentHour && itemMinute <= currentMinute) {
                        return true;
                    }
                }
                
                return false;
            });
        };
        
        // Filter data for each time period
        const oneDayData = filterByDateAndTime(historicalData, oneDayAgoStr);
        const oneWeekData = filterByDateAndTime(historicalData, oneWeekAgoStr);
        
        logger.info(`Filtered summary data by time periods for location ${location}:`);
        logger.info(`- One day: ${oneDayData.length} records`);
        logger.info(`- One week: ${oneWeekData.length} records`);
        
        // Calculate 24-hour averages
        const dailyAvg = calculateAverages(oneDayData);
        
        // Calculate weekly averages
        const weeklyAvg = calculateAverages(oneWeekData);
        
        // Construct the summary response
        const summary: PollutantSummaryData = {
            current: {
                o3_ppb: currentData.o3_ppb,
                co_ppm: currentData.co_ppm,
                so2_ppb: currentData.so2_ppb,
                no_ppb: currentData.no_ppb,
                no2_ppb: currentData.no2_ppb,
                nox_ppb: currentData.nox_ppb,
                pm10_ug_m3: currentData.pm10_ug_m3,
                pm2_5_ug_m3: currentData.pm2_5_ug_m3,
                PM2_5_AQI: currentData.PM2_5_AQI,
                PM10_AQI: currentData.PM10_AQI,
                SO2_AQI: currentData.SO2_AQI,
                NO2_AQI: currentData.NO2_AQI,
                O3_AQI: currentData.O3_AQI,
                CO_AQI: currentData.CO_AQI,
                timestamp: `${currentData.report_date} ${currentData.report_time}`
            },
            daily_avg: dailyAvg,
            weekly_avg: weeklyAvg
        };
        
        return summary;
    } catch (error) {
        logger.error(`Failed to fetch pollutant summary for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        throw new Error(`Failed to fetch pollutant summary for location ${location}`);
    }
};

// Helper function to calculate averages from a dataset
const calculateAverages = (data: EpaMonitorsData[]) => {
    // Initialize accumulators
    let totalO3Ppb = 0;
    let totalCoPpm = 0;
    let totalSo2Ppb = 0;
    let totalNoPpb = 0;
    let totalNo2Ppb = 0;
    let totalNoxPpb = 0;
    let totalPm10UgM3 = 0;
    let totalPm25UgM3 = 0;
    let totalPm25Aqi = 0;
    let totalPm10Aqi = 0;
    let totalSo2Aqi = 0;
    let totalNo2Aqi = 0;
    let totalO3Aqi = 0;
    let totalCoAqi = 0;
    
    // Count valid data points for each field
    let countO3Ppb = 0;
    let countCoPpm = 0;
    let countSo2Ppb = 0;
    let countNoPpb = 0;
    let countNo2Ppb = 0;
    let countNoxPpb = 0;
    let countPm10UgM3 = 0;
    let countPm25UgM3 = 0;
    let countPm25Aqi = 0;
    let countPm10Aqi = 0;
    let countSo2Aqi = 0;
    let countNo2Aqi = 0;
    let countO3Aqi = 0;
    let countCoAqi = 0;
    
    // Sum up all values
    data.forEach(item => {
        if (item.o3_ppb !== undefined && !isNaN(item.o3_ppb)) {
            totalO3Ppb += item.o3_ppb;
            countO3Ppb++;
        }
        if (item.co_ppm !== undefined && !isNaN(item.co_ppm)) {
            totalCoPpm += item.co_ppm;
            countCoPpm++;
        }
        if (item.so2_ppb !== undefined && !isNaN(item.so2_ppb)) {
            totalSo2Ppb += item.so2_ppb;
            countSo2Ppb++;
        }
        if (item.no_ppb !== undefined && !isNaN(item.no_ppb)) {
            totalNoPpb += item.no_ppb;
            countNoPpb++;
        }
        if (item.no2_ppb !== undefined && !isNaN(item.no2_ppb)) {
            totalNo2Ppb += item.no2_ppb;
            countNo2Ppb++;
        }
        if (item.nox_ppb !== undefined && !isNaN(item.nox_ppb)) {
            totalNoxPpb += item.nox_ppb;
            countNoxPpb++;
        }
        if (item.pm10_ug_m3 !== undefined && !isNaN(item.pm10_ug_m3)) {
            totalPm10UgM3 += item.pm10_ug_m3;
            countPm10UgM3++;
        }
        if (item.pm2_5_ug_m3 !== undefined && !isNaN(item.pm2_5_ug_m3)) {
            totalPm25UgM3 += item.pm2_5_ug_m3;
            countPm25UgM3++;
        }
        if (item.PM2_5_AQI !== undefined && !isNaN(item.PM2_5_AQI)) {
            totalPm25Aqi += item.PM2_5_AQI;
            countPm25Aqi++;
        }
        if (item.PM10_AQI !== undefined && !isNaN(item.PM10_AQI)) {
            totalPm10Aqi += item.PM10_AQI;
            countPm10Aqi++;
        }
        if (item.SO2_AQI !== undefined && !isNaN(item.SO2_AQI)) {
            totalSo2Aqi += item.SO2_AQI;
            countSo2Aqi++;
        }
        if (item.NO2_AQI !== undefined && !isNaN(item.NO2_AQI)) {
            totalNo2Aqi += item.NO2_AQI;
            countNo2Aqi++;
        }
        if (item.O3_AQI !== undefined && !isNaN(item.O3_AQI)) {
            totalO3Aqi += item.O3_AQI;
            countO3Aqi++;
        }
        if (item.CO_AQI !== undefined && !isNaN(item.CO_AQI)) {
            totalCoAqi += item.CO_AQI;
            countCoAqi++;
        }
    });
    
    // Calculate averages
    return {
        o3_ppb: countO3Ppb > 0 ? totalO3Ppb / countO3Ppb : 0,
        co_ppm: countCoPpm > 0 ? totalCoPpm / countCoPpm : 0,
        so2_ppb: countSo2Ppb > 0 ? totalSo2Ppb / countSo2Ppb : 0,
        no_ppb: countNoPpb > 0 ? totalNoPpb / countNoPpb : 0,
        no2_ppb: countNo2Ppb > 0 ? totalNo2Ppb / countNo2Ppb : 0,
        nox_ppb: countNoxPpb > 0 ? totalNoxPpb / countNoxPpb : 0,
        pm10_ug_m3: countPm10UgM3 > 0 ? totalPm10UgM3 / countPm10UgM3 : 0,
        pm2_5_ug_m3: countPm25UgM3 > 0 ? totalPm25UgM3 / countPm25UgM3 : 0,
        PM2_5_AQI: countPm25Aqi > 0 ? totalPm25Aqi / countPm25Aqi : 0,
        PM10_AQI: countPm10Aqi > 0 ? totalPm10Aqi / countPm10Aqi : 0,
        SO2_AQI: countSo2Aqi > 0 ? totalSo2Aqi / countSo2Aqi : 0,
        NO2_AQI: countNo2Aqi > 0 ? totalNo2Aqi / countNo2Aqi : 0,
        O3_AQI: countO3Aqi > 0 ? totalO3Aqi / countO3Aqi : 0,
        CO_AQI: countCoAqi > 0 ? totalCoAqi / countCoAqi : 0
    };
};

