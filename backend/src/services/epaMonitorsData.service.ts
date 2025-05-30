import axios from "axios";
import {EpaMonitorsData, HistoricalEpaMonitorsDataResponse, PollutantSummaryData, PollutantHistoryData, PollutantBucketData, EpaMonitorsDataWithForecast} from "../types/epaMonitorsData.types";
import logger from "../utils/logger";
import EpaMonitorsDataModel from "../models/epaMonitorsData.model";
import {alertUsersInLocations} from "./notificationService";
import {PollutantHistoricalData} from "../types/pollutantHistoricalData.types";
import { getLatestForecastsForAllLocations, getForecastForLocationAndDate } from "./airQualityForecastService";

/**
 * EPA Monitors Data Service with In-Memory Caching
 *
 * This service implements a simple in-memory caching mechanism for EPA data:
 *
 * 1. Four types of cache are maintained:
 *    - currentData: Latest EPA data for each location
 *    - historicalDataForAllPeriods: Complete historical data for all time periods
 *    - historicalDataForSpecificPeriod: Data for specific time periods (1d, 1w, 1m, etc.)
 *    - pollutantSummary: Summary data for each location
 *
 * 2. Cache TTL is set to 5 minutes
 *
 * 3. Cache invalidation:
 *    - When new data is received via pollEpaMonitorsData(), the cache for that location is invalidated
 *    - This ensures controllers always receive fresh data after it's updated in the database
 *
 * 4. The caching mechanism is transparent to controllers, which continue to call
 *    the same service functions without needing to know about caching logic
 */

const BASE_URL = "http://34.132.171.41:8000/api/aqms_data/";

// Define the Lahore location response type
export interface LahoreLocationAqiData {
    locationCode: string;
    aqi: number;
    report_date_time: string;
}

// In-memory cache for EPA monitors data
interface EpaMonitorsDataCache {
    currentData: { [locationId: number]: { data: EpaMonitorsData, timestamp: number } };
    forecastData: { [locationId: number]: { data: any, timestamp: number } };
    historicalDataForAllPeriods: { [locationId: number]: { data: PollutantHistoricalData, timestamp: number } };
    historicalDataForSpecificPeriod: {
        [locationId: number]: {
            [timePeriod: string]: { data: PollutantBucketData[], timestamp: number }
        }
    };
    pollutantSummary: { [locationId: number]: { data: PollutantSummaryData, timestamp: number } };
    lahoreLocationsAqi?: { data: LahoreLocationAqiData[], timestamp: number };
}

// Initialize empty cache
const cache: EpaMonitorsDataCache = {
    currentData: {},
    forecastData: {},
    historicalDataForAllPeriods: {},
    historicalDataForSpecificPeriod: {},
    pollutantSummary: {},
    lahoreLocationsAqi: undefined
};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Helper function to get cached data for a specific time period or compute and cache it
const getCachedTimePeriodData = async (
    location: number,
    timePeriod: string,
    fetcher: () => Promise<PollutantBucketData[]>
): Promise<PollutantBucketData[]> => {
    try {
        // Initialize the location's cache if it doesn't exist
        if (!cache.historicalDataForSpecificPeriod[location]) {
            cache.historicalDataForSpecificPeriod[location] = {};
        }

        // Check if data exists in cache and is not expired
        const cachedData = cache.historicalDataForSpecificPeriod[location][timePeriod];
        const now = Date.now();

        if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
            logger.info(`Using cached ${timePeriod} data for location ${location}`);
            return cachedData.data;
        }

        logger.info(`Cache miss for ${timePeriod} data for location ${location}, fetching from database`);

        // Fetch fresh data
        const data = await fetcher();

        // Store in cache
        cache.historicalDataForSpecificPeriod[location][timePeriod] = {
            data,
            timestamp: now
        };

        return data;
    } catch (error) {
        logger.error(`Error getting cached data for ${timePeriod} at location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

// Function to invalidate cache for a specific location
export const invalidateCacheForLocation = (location: number): void => {
    logger.info(`Invalidating cache for location ${location}`);

    // Remove all cached data for this location
    delete cache.currentData[location];
    delete cache.forecastData[location];
    delete cache.historicalDataForAllPeriods[location];
    delete cache.pollutantSummary[location];
    delete cache.lahoreLocationsAqi;

    // If specific period data exists for this location, clear it
    if (cache.historicalDataForSpecificPeriod[location]) {
        delete cache.historicalDataForSpecificPeriod[location];
    }
};

// Function to invalidate only EPA data cache for a specific location (preserves forecast data)
export const invalidateEpaDataCacheForLocation = (location: number): void => {
    logger.info(`Invalidating EPA data cache for location ${location} (preserving forecast data)`);

    // Remove only EPA-related cached data for this location
    delete cache.currentData[location];
    delete cache.historicalDataForAllPeriods[location];
    delete cache.pollutantSummary[location];
    delete cache.lahoreLocationsAqi;

    // If specific period data exists for this location, clear it
    if (cache.historicalDataForSpecificPeriod[location]) {
        delete cache.historicalDataForSpecificPeriod[location];
    }
};

// Function to invalidate only forecast data cache for a specific location
export const invalidateForecastCacheForLocation = (location: number): void => {
    logger.info(`Invalidating forecast data cache for location ${location}`);
    delete cache.forecastData[location];
};

// Helper function to calculate average of numeric values, ignoring null/undefined
const calculateAverage = (values: (number | null | undefined)[]): number | undefined => {
    const validValues = values.filter(val => val !== null && val !== undefined) as number[];
    if (validValues.length === 0) return undefined;
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
};

// Poll EPA Monitors Data Every 5 Minutes
export const pollEpaMonitorsData = async () => {
    try {
        const locations = Array.from({length: 5}, (_, i) => i + 1);

        // Fetch data for all locations concurrently
        const results = await Promise.allSettled(locations.map(fetchCurrentEpaMonitorsDataForLocation));

        // Extract fulfilled results and filter out rejected ones
        const aqmsData = results
            .filter(result => result.status === "fulfilled")
            .map(result => (result as PromiseFulfilledResult<EpaMonitorsData>).value);

        // Collect locations that need alerts based on the forecasting model
        const locationsNeedingAlerts: EpaMonitorsData[] = [];

        for (const data of aqmsData) {
            // // Determine if this location needs an alert using the forecasting model
            // if (shouldAlertUsersInLocation(data.location, data)) {
            //     locationsNeedingAlerts.push(data);
            // }
            // Store Data in MongoDB
            await storeEpaMonitorsData(data);

            // Invalidate cache for this location since data has been updated (preserves forecast data)
            invalidateEpaDataCacheForLocation(data.location);
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
        }
    } catch (error) {
        logger.error(`Error storing EPA Monitors data: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
};

export const getPollutantHistoryDataForPast24Hours = async (location: number, currentDateTime: Date): Promise<PollutantBucketData[]> => {
    return getCachedTimePeriodData(location, '1d', async () => {
        try {
            const pastDayData = await getPast24HoursEpaMonitorsDataForLocation(location, currentDateTime);

            // Extract only the pollutant concentration/AQI fields and report_date_time
            const pollutantHistoryData: PollutantHistoryData[] = pastDayData.map((data: EpaMonitorsData) => ({
                report_date_time: data.report_date_time,

                // Pollutant concentration fields
                o3_ppb: data.o3_ppb,
                co_ppm: data.co_ppm,
                so2_ppb: data.so2_ppb,
                no_ppb: data.no_ppb,
                no2_ppb: data.no2_ppb,
                nox_ppb: data.nox_ppb,
                pm10_ug_m3: data.pm10_ug_m3,
                pm2_5_ug_m3: data.pm2_5_ug_m3,

                // AQI values
                PM2_5_AQI: data.PM2_5_AQI,
                PM10_AQI: data.PM10_AQI,
                SO2_AQI: data.SO2_AQI,
                NO2_AQI: data.NO2_AQI,
                O3_AQI: data.O3_AQI,
                CO_AQI: data.CO_AQI
            }));

            // use currentDateTime to divide pollutantHistoryData into 8 'buckets', with each representing a
            // 3 hour time-period, with the last one being for the currentDateTime, and the first one starting 24hours back
            const buckets: PollutantHistoryData[][] = Array(8).fill(null).map(() => []);

            // Calculate the start time for each bucket (going backward from currentDateTime)
            const bucketStartTimes = Array(8).fill(null).map((_, index) => {
                const bucketStart = new Date(currentDateTime);
                bucketStart.setHours(currentDateTime.getHours() - (24 - index * 3));
                return bucketStart;
            });

            // Calculate the end time for each bucket
            const bucketEndTimes = bucketStartTimes.map((startTime, index) => {
                if (index === 7) {
                    return currentDateTime; // Last bucket ends at currentDateTime
                }
                const endTime = new Date(startTime);
                endTime.setHours(startTime.getHours() + 3);
                return endTime;
            });

            // Distribute data points into appropriate buckets
            pollutantHistoryData.forEach(dataPoint => {
                const dataTime = new Date(dataPoint.report_date_time);

                for (let i = 0; i < 8; i++) {
                    if (dataTime >= bucketStartTimes[i] && dataTime <= bucketEndTimes[i]) {
                        buckets[i].push(dataPoint);
                        break;
                    }
                }
            });

            // now, i want to find the average of each array/bucket --> need an array with 8 objects, where each object has the average of all keys in that bucket --> if a buckey is empty, just put undefined in the array for it
            const bucketAverages: PollutantBucketData[] = buckets.map((bucket, index) => {
                // If bucket is empty, return object with null values
                if (bucket.length === 0) {
                    return {
                        timeRange: `${bucketStartTimes[index].toISOString()} - ${bucketEndTimes[index].toISOString()}`,
                        o3_ppb: undefined,
                        co_ppm: undefined,
                        so2_ppb: undefined,
                        no2_ppb: undefined,
                        pm10_ug_m3: undefined,
                        pm2_5_ug_m3: undefined,
                        PM2_5_AQI: undefined,
                        PM10_AQI: undefined,
                        SO2_AQI: undefined,
                        NO2_AQI: undefined,
                        O3_AQI: undefined,
                        CO_AQI: undefined
                    };
                }

                // Calculate averages for each pollutant
                return {
                    timeRange: `${bucketStartTimes[index].toISOString()} - ${bucketEndTimes[index].toISOString()}`,
                    o3_ppb: calculateAverage(bucket.map(d => d.o3_ppb)),
                    co_ppm: calculateAverage(bucket.map(d => d.co_ppm)),
                    so2_ppb: calculateAverage(bucket.map(d => d.so2_ppb)),
                    no2_ppb: calculateAverage(bucket.map(d => d.no2_ppb)),
                    pm10_ug_m3: calculateAverage(bucket.map(d => d.pm10_ug_m3)),
                    pm2_5_ug_m3: calculateAverage(bucket.map(d => d.pm2_5_ug_m3)),
                    PM2_5_AQI: calculateAverage(bucket.map(d => d.PM2_5_AQI)),
                    PM10_AQI: calculateAverage(bucket.map(d => d.PM10_AQI)),
                    SO2_AQI: calculateAverage(bucket.map(d => d.SO2_AQI)),
                    NO2_AQI: calculateAverage(bucket.map(d => d.NO2_AQI)),
                    O3_AQI: calculateAverage(bucket.map(d => d.O3_AQI)),
                    CO_AQI: calculateAverage(bucket.map(d => d.CO_AQI))
                };
            });

            // now, in the array, i want to convert timeRange to a timerange in Pakistani timezone, in AM/PM format 
            const formattedBucketAverages = bucketAverages.map(bucket => {
                // Extract start and end times from the timeRange
                const [startIsoString, endIsoString] = bucket.timeRange!.split(' - ');

                // Convert to Date objects
                const startDate = new Date(startIsoString);
                const endDate = new Date(endIsoString);

                // Format to Pakistani timezone (UTC+5) in AM/PM format
                const formatToPakistanTime = (date: Date) => {
                    // Add 5 hours for Pakistan timezone (UTC+5)
                    const pakistanDate = new Date(date.getTime() + (5 * 60 * 60 * 1000));

                    // Format hours for 12-hour clock with AM/PM
                    let hours = pakistanDate.getUTCHours();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // Convert 0 to 12

                    // Format minutes with leading zero if needed
                    const minutes = pakistanDate.getUTCMinutes().toString().padStart(2, '0');

                    return `${hours}:${minutes} ${ampm}`;
                };

                // Create the formatted timeRange
                const formattedTimeRange = `${formatToPakistanTime(startDate)} - ${formatToPakistanTime(endDate)}`;

                // Return a new object with the formatted timeRange
                return {
                    ...bucket,
                    label: formattedTimeRange,
                    timeRange: undefined
                };
            });

            return formattedBucketAverages;

        } catch (error) {
            logger.error(`Error extracting pollutant history data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            return [];
        }
    });
};

export const getPast24HoursEpaMonitorsDataForLocation = async (location: number, currentDateTime: Date): Promise<EpaMonitorsData[]> => {
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
        }).sort({report_date_time: 1}); // Sort by date in ascending order

        logger.info(`Retrieved ${data.length} records for location ${location} in the last 24 hours`);

        return data;
    } catch (error) {
        logger.error(`Error retrieving 24-hour data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPastWeekEpaMonitorsDataForLocation = async (location: number, currentDateTime: Date): Promise<EpaMonitorsData[]> => {
    try {
        // Calculate the date 7 days ago from the current date
        const sevenDaysAgo = new Date(currentDateTime);
        sevenDaysAgo.setDate(currentDateTime.getDate() - 7);

        // Query the database for records within the last 7 days for the specified location
        const data = await EpaMonitorsDataModel.find({
            location: location,
            report_date_time: {
                $gte: sevenDaysAgo,
                $lte: currentDateTime
            }
        }).sort({report_date_time: 1}); // Sort by date in ascending order

        logger.info(`Retrieved ${data.length} records for location ${location} in the last 7 days`);

        return data;
    } catch (error) {
        logger.error(`Error retrieving weekly data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPastMonthEpaMonitorsDataForLocation = async (location: number, currentDateTime: Date): Promise<EpaMonitorsData[]> => {
    try {
        // Calculate the date 30 days ago from the current date
        const thirtyDaysAgo = new Date(currentDateTime);
        thirtyDaysAgo.setDate(currentDateTime.getDate() - 30);

        // Query the database for records within the last 30 days for the specified location
        const data = await EpaMonitorsDataModel.find({
            location: location,
            report_date_time: {
                $gte: thirtyDaysAgo,
                $lte: currentDateTime
            }
        }).sort({report_date_time: 1}); // Sort by date in ascending order

        logger.info(`Retrieved ${data.length} records for location ${location} in the last 30 days`);

        return data;
    } catch (error) {
        logger.error(`Error retrieving monthly data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPastThreeMonthsEpaMonitorsDataForLocation = async (location: number, currentDateTime: Date): Promise<EpaMonitorsData[]> => {
    try {
        // Calculate the date 3 months ago from the current date
        const threeMonthsAgo = new Date(currentDateTime);
        threeMonthsAgo.setMonth(currentDateTime.getMonth() - 3);

        // Query the database for records within the last 3 months for the specified location
        const data = await EpaMonitorsDataModel.find({
            location: location,
            report_date_time: {
                $gte: threeMonthsAgo,
                $lte: currentDateTime
            }
        }).sort({report_date_time: 1}); // Sort by date in ascending order

        logger.info(`Retrieved ${data.length} records for location ${location} in the last 3 months`);

        return data;
    } catch (error) {
        logger.error(`Error retrieving 3-month data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPastSixMonthsEpaMonitorsDataForLocation = async (location: number, currentDateTime: Date): Promise<EpaMonitorsData[]> => {
    try {
        // Calculate the date 6 months ago from the current date
        const sixMonthsAgo = new Date(currentDateTime);
        sixMonthsAgo.setMonth(currentDateTime.getMonth() - 6);

        // Query the database for records within the last 6 months for the specified location
        const data = await EpaMonitorsDataModel.find({
            location: location,
            report_date_time: {
                $gte: sixMonthsAgo,
                $lte: currentDateTime
            }
        }).sort({report_date_time: 1}); // Sort by date in ascending order

        logger.info(`Retrieved ${data.length} records for location ${location} in the last 6 months`);

        return data;
    } catch (error) {
        logger.error(`Error retrieving 6-month data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPollutantHistoryDataForPastWeek = async (location: number, currentDateTime: Date): Promise<PollutantBucketData[]> => {
    return getCachedTimePeriodData(location, '1w', async () => {
        try {
            const pastWeekData = await getPastWeekEpaMonitorsDataForLocation(location, currentDateTime);

            // Extract only the pollutant concentration/AQI fields and report_date_time
            const pollutantHistoryData: PollutantHistoryData[] = pastWeekData.map((data: EpaMonitorsData) => ({
                report_date_time: data.report_date_time,

                // Pollutant concentration fields
                o3_ppb: data.o3_ppb,
                co_ppm: data.co_ppm,
                so2_ppb: data.so2_ppb,
                no_ppb: data.no_ppb,
                no2_ppb: data.no2_ppb,
                nox_ppb: data.nox_ppb,
                pm10_ug_m3: data.pm10_ug_m3,
                pm2_5_ug_m3: data.pm2_5_ug_m3,

                // AQI values
                PM2_5_AQI: data.PM2_5_AQI,
                PM10_AQI: data.PM10_AQI,
                SO2_AQI: data.SO2_AQI,
                NO2_AQI: data.NO2_AQI,
                O3_AQI: data.O3_AQI,
                CO_AQI: data.CO_AQI
            }));

            // Create 7 buckets, one for each day of the week
            const buckets: PollutantHistoryData[][] = Array(7).fill(null).map(() => []);

            // Calculate the start time for each day (going backward from currentDateTime)
            const dayStartTimes = Array(7).fill(null).map((_, index) => {
                const dayStart = new Date(currentDateTime);
                dayStart.setDate(currentDateTime.getDate() - (7 - index - 1));
                dayStart.setHours(0, 0, 0, 0); // Start of the day
                return dayStart;
            });

            // Calculate the end time for each day
            const dayEndTimes = dayStartTimes.map((startTime, index) => {
                if (index === 6) {
                    return currentDateTime; // Last day ends at currentDateTime
                }
                const endTime = new Date(startTime);
                endTime.setHours(23, 59, 59, 999); // End of the day
                return endTime;
            });

            // Get day names for each bucket
            const dayNames = dayStartTimes.map((date, index) => {
                // For the last day (today)
                if (index === 6) {
                    return "Today";
                }
                // For the second-to-last day (yesterday)
                if (index === 5) {
                    return "Yesterday";
                }

                // For other days, use the day name
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                return days[date.getDay()];
            });

            // Distribute data points into appropriate day buckets
            pollutantHistoryData.forEach(dataPoint => {
                const dataTime = new Date(dataPoint.report_date_time);

                for (let i = 0; i < 7; i++) {
                    if (dataTime >= dayStartTimes[i] && dataTime <= dayEndTimes[i]) {
                        buckets[i].push(dataPoint);
                        break;
                    }
                }
            });

            // Calculate average values for each day
            const dayAverages: PollutantBucketData[] = buckets.map((bucket, index) => {
                // If bucket is empty, return object with null values
                if (bucket.length === 0) {
                    return {
                        label: dayNames[index],
                        o3_ppb: undefined,
                        co_ppm: undefined,
                        so2_ppb: undefined,
                        no2_ppb: undefined,
                        pm10_ug_m3: undefined,
                        pm2_5_ug_m3: undefined,
                        PM2_5_AQI: undefined,
                        PM10_AQI: undefined,
                        SO2_AQI: undefined,
                        NO2_AQI: undefined,
                        O3_AQI: undefined,
                        CO_AQI: undefined
                    };
                }

                // Calculate averages for each pollutant
                return {
                    label: dayNames[index],
                    o3_ppb: calculateAverage(bucket.map(d => d.o3_ppb)),
                    co_ppm: calculateAverage(bucket.map(d => d.co_ppm)),
                    so2_ppb: calculateAverage(bucket.map(d => d.so2_ppb)),
                    no2_ppb: calculateAverage(bucket.map(d => d.no2_ppb)),
                    pm10_ug_m3: calculateAverage(bucket.map(d => d.pm10_ug_m3)),
                    pm2_5_ug_m3: calculateAverage(bucket.map(d => d.pm2_5_ug_m3)),
                    PM2_5_AQI: calculateAverage(bucket.map(d => d.PM2_5_AQI)),
                    PM10_AQI: calculateAverage(bucket.map(d => d.PM10_AQI)),
                    SO2_AQI: calculateAverage(bucket.map(d => d.SO2_AQI)),
                    NO2_AQI: calculateAverage(bucket.map(d => d.NO2_AQI)),
                    O3_AQI: calculateAverage(bucket.map(d => d.O3_AQI)),
                    CO_AQI: calculateAverage(bucket.map(d => d.CO_AQI))
                };
            });

            return dayAverages;

        } catch (error) {
            logger.error(`Error extracting weekly pollutant history data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            return [];
        }
    });
};

export const getPollutantHistoryDataForPastMonth = async (location: number, currentDateTime: Date): Promise<PollutantBucketData[]> => {
    try {
        const pastMonthData = await getPastMonthEpaMonitorsDataForLocation(location, currentDateTime);

        // Extract only the pollutant concentration/AQI fields and report_date_time
        const pollutantHistoryData: PollutantHistoryData[] = pastMonthData.map((data: EpaMonitorsData) => ({
            report_date_time: data.report_date_time,

            // Pollutant concentration fields
            o3_ppb: data.o3_ppb,
            co_ppm: data.co_ppm,
            so2_ppb: data.so2_ppb,
            no_ppb: data.no_ppb,
            no2_ppb: data.no2_ppb,
            nox_ppb: data.nox_ppb,
            pm10_ug_m3: data.pm10_ug_m3,
            pm2_5_ug_m3: data.pm2_5_ug_m3,

            // AQI values
            PM2_5_AQI: data.PM2_5_AQI,
            PM10_AQI: data.PM10_AQI,
            SO2_AQI: data.SO2_AQI,
            NO2_AQI: data.NO2_AQI,
            O3_AQI: data.O3_AQI,
            CO_AQI: data.CO_AQI
        }));

        // Create 4 buckets, one for each week of the month
        const buckets: PollutantHistoryData[][] = Array(4).fill(null).map(() => []);

        // Calculate the start time for each week (going backward from currentDateTime)
        const weekStartTimes = Array(4).fill(null).map((_, index) => {
            const weekStart = new Date(currentDateTime);
            weekStart.setDate(currentDateTime.getDate() - (28 - index * 7));
            weekStart.setHours(0, 0, 0, 0); // Start of the day
            return weekStart;
        });

        // Calculate the end time for each week
        const weekEndTimes = weekStartTimes.map((startTime, index) => {
            if (index === 3) {
                return currentDateTime; // Last week ends at currentDateTime
            }
            const endTime = new Date(startTime);
            endTime.setDate(startTime.getDate() + 6);
            endTime.setHours(23, 59, 59, 999); // End of the day
            return endTime;
        });

        // Format date to display day and month
        const formatDate = (date: Date): string => {
            const day = date.getDate();
            const month = date.toLocaleString('default', {month: 'long'});
            return `${day} ${month}`;
        };

        // Get week labels (startday - endday)
        const weekLabels = weekStartTimes.map((startTime, index) => {
            const endTime = weekEndTimes[index];
            return `${formatDate(startTime)} - ${formatDate(endTime)}`;
        });

        // Distribute data points into appropriate week buckets
        pollutantHistoryData.forEach(dataPoint => {
            const dataTime = new Date(dataPoint.report_date_time);

            for (let i = 0; i < 4; i++) {
                if (dataTime >= weekStartTimes[i] && dataTime <= weekEndTimes[i]) {
                    buckets[i].push(dataPoint);
                    break;
                }
            }
        });

        // Calculate average values for each week
        const weekAverages: PollutantBucketData[] = buckets.map((bucket, index) => {
            // If bucket is empty, return object with null values
            if (bucket.length === 0) {
                return {
                    label: weekLabels[index],
                    o3_ppb: undefined,
                    co_ppm: undefined,
                    so2_ppb: undefined,
                    no2_ppb: undefined,
                    pm10_ug_m3: undefined,
                    pm2_5_ug_m3: undefined,
                    PM2_5_AQI: undefined,
                    PM10_AQI: undefined,
                    SO2_AQI: undefined,
                    NO2_AQI: undefined,
                    O3_AQI: undefined,
                    CO_AQI: undefined
                };
            }

            // Calculate averages for each pollutant
            return {
                label: weekLabels[index],
                o3_ppb: calculateAverage(bucket.map(d => d.o3_ppb)),
                co_ppm: calculateAverage(bucket.map(d => d.co_ppm)),
                so2_ppb: calculateAverage(bucket.map(d => d.so2_ppb)),
                no2_ppb: calculateAverage(bucket.map(d => d.no2_ppb)),
                pm10_ug_m3: calculateAverage(bucket.map(d => d.pm10_ug_m3)),
                pm2_5_ug_m3: calculateAverage(bucket.map(d => d.pm2_5_ug_m3)),
                PM2_5_AQI: calculateAverage(bucket.map(d => d.PM2_5_AQI)),
                PM10_AQI: calculateAverage(bucket.map(d => d.PM10_AQI)),
                SO2_AQI: calculateAverage(bucket.map(d => d.SO2_AQI)),
                NO2_AQI: calculateAverage(bucket.map(d => d.NO2_AQI)),
                O3_AQI: calculateAverage(bucket.map(d => d.O3_AQI)),
                CO_AQI: calculateAverage(bucket.map(d => d.CO_AQI))
            };
        });

        return weekAverages;

    } catch (error) {
        logger.error(`Error extracting monthly pollutant history data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPollutantHistoryDataForPastThreeMonths = async (location: number, currentDateTime: Date): Promise<PollutantBucketData[]> => {
    try {
        const pastThreeMonthsData = await getPastThreeMonthsEpaMonitorsDataForLocation(location, currentDateTime);

        if (pastThreeMonthsData.length === 0) {
            return [];
        }

        // Extract only the pollutant concentration/AQI fields and report_date_time
        const pollutantHistoryData: PollutantHistoryData[] = pastThreeMonthsData.map((data: EpaMonitorsData) => ({
            report_date_time: data.report_date_time,

            // Pollutant concentration fields
            o3_ppb: data.o3_ppb,
            co_ppm: data.co_ppm,
            so2_ppb: data.so2_ppb,
            no_ppb: data.no_ppb,
            no2_ppb: data.no2_ppb,
            nox_ppb: data.nox_ppb,
            pm10_ug_m3: data.pm10_ug_m3,
            pm2_5_ug_m3: data.pm2_5_ug_m3,

            // AQI values
            PM2_5_AQI: data.PM2_5_AQI,
            PM10_AQI: data.PM10_AQI,
            SO2_AQI: data.SO2_AQI,
            NO2_AQI: data.NO2_AQI,
            O3_AQI: data.O3_AQI,
            CO_AQI: data.CO_AQI
        }));

        // Find the earliest and latest dates in the data
        const sortedDates = pollutantHistoryData
            .map(data => new Date(data.report_date_time))
            .sort((a, b) => a.getTime() - b.getTime());

        const earliestDate = sortedDates[0];
        const latestDate = currentDateTime;

        // Calculate the total time span in milliseconds
        const timeSpan = latestDate.getTime() - earliestDate.getTime();
        const monthSpan = timeSpan / 3; // Divide into 3 equal parts

        // Create 3 buckets, one for each month of the past three months
        const buckets: PollutantHistoryData[][] = Array(3).fill(null).map(() => []);

        // Calculate the start time for each bucket based on actual data range
        const bucketStartTimes = Array(3).fill(null).map((_, index) => {
            const bucketStart = new Date(earliestDate.getTime() + (monthSpan * index));
            return bucketStart;
        });

        // Calculate the end time for each bucket
        const bucketEndTimes = bucketStartTimes.map((startTime, index) => {
            if (index === 2) {
                return latestDate; // Last bucket ends at latestDate
            }
            return new Date(bucketStartTimes[index + 1].getTime() - 1); // 1ms before next bucket starts
        });

        // Format date to display month and day
        const getMonthDayFormat = (date: Date): string => {
            const day = date.getDate();
            const month = date.toLocaleString('default', {month: 'long'});
            return `${month} ${day}`;
        };

        // Get bucket labels with month and day
        const bucketLabels = bucketStartTimes.map((startTime, index) => {
            const endTime = bucketEndTimes[index];
            return `${getMonthDayFormat(startTime)} - ${getMonthDayFormat(endTime)}`;
        });

        // Distribute data points into appropriate buckets
        pollutantHistoryData.forEach(dataPoint => {
            const dataTime = new Date(dataPoint.report_date_time);

            for (let i = 0; i < 3; i++) {
                if (dataTime >= bucketStartTimes[i] && dataTime <= bucketEndTimes[i]) {
                    buckets[i].push(dataPoint);
                    break;
                }
            }
        });

        // Calculate average values for each bucket
        const bucketAverages: PollutantBucketData[] = buckets.map((bucket, index) => {
            // If bucket is empty, return object with null values
            if (bucket.length === 0) {
                return {
                    label: bucketLabels[index],
                    o3_ppb: undefined,
                    co_ppm: undefined,
                    so2_ppb: undefined,
                    no2_ppb: undefined,
                    pm10_ug_m3: undefined,
                    pm2_5_ug_m3: undefined,
                    PM2_5_AQI: undefined,
                    PM10_AQI: undefined,
                    SO2_AQI: undefined,
                    NO2_AQI: undefined,
                    O3_AQI: undefined,
                    CO_AQI: undefined
                };
            }

            // Calculate averages for each pollutant
            return {
                label: bucketLabels[index],
                o3_ppb: calculateAverage(bucket.map(d => d.o3_ppb)),
                co_ppm: calculateAverage(bucket.map(d => d.co_ppm)),
                so2_ppb: calculateAverage(bucket.map(d => d.so2_ppb)),
                no2_ppb: calculateAverage(bucket.map(d => d.no2_ppb)),
                pm10_ug_m3: calculateAverage(bucket.map(d => d.pm10_ug_m3)),
                pm2_5_ug_m3: calculateAverage(bucket.map(d => d.pm2_5_ug_m3)),
                PM2_5_AQI: calculateAverage(bucket.map(d => d.PM2_5_AQI)),
                PM10_AQI: calculateAverage(bucket.map(d => d.PM10_AQI)),
                SO2_AQI: calculateAverage(bucket.map(d => d.SO2_AQI)),
                NO2_AQI: calculateAverage(bucket.map(d => d.NO2_AQI)),
                O3_AQI: calculateAverage(bucket.map(d => d.O3_AQI)),
                CO_AQI: calculateAverage(bucket.map(d => d.CO_AQI))
            };
        });

        return bucketAverages;

    } catch (error) {
        logger.error(`Error extracting 3-month pollutant history data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPollutantHistoryDataForPastSixMonths = async (location: number, currentDateTime: Date): Promise<PollutantBucketData[]> => {
    try {
        const pastSixMonthsData = await getPastSixMonthsEpaMonitorsDataForLocation(location, currentDateTime);

        if (pastSixMonthsData.length === 0) {
            return [];
        }

        // Extract only the pollutant concentration/AQI fields and report_date_time
        const pollutantHistoryData: PollutantHistoryData[] = pastSixMonthsData.map((data: EpaMonitorsData) => ({
            report_date_time: data.report_date_time,

            // Pollutant concentration fields
            o3_ppb: data.o3_ppb,
            co_ppm: data.co_ppm,
            so2_ppb: data.so2_ppb,
            no_ppb: data.no_ppb,
            no2_ppb: data.no2_ppb,
            nox_ppb: data.nox_ppb,
            pm10_ug_m3: data.pm10_ug_m3,
            pm2_5_ug_m3: data.pm2_5_ug_m3,

            // AQI values
            PM2_5_AQI: data.PM2_5_AQI,
            PM10_AQI: data.PM10_AQI,
            SO2_AQI: data.SO2_AQI,
            NO2_AQI: data.NO2_AQI,
            O3_AQI: data.O3_AQI,
            CO_AQI: data.CO_AQI
        }));

        // Find the earliest and latest dates in the data
        const sortedDates = pollutantHistoryData
            .map(data => new Date(data.report_date_time))
            .sort((a, b) => a.getTime() - b.getTime());

        const earliestDate = sortedDates[0];
        const latestDate = currentDateTime;

        // Calculate the total time span in milliseconds
        const timeSpan = latestDate.getTime() - earliestDate.getTime();
        const monthSpan = timeSpan / 6; // Divide into 6 equal parts

        // Create 6 buckets, one for each month of the past six months
        const buckets: PollutantHistoryData[][] = Array(6).fill(null).map(() => []);

        // Calculate the start time for each bucket based on actual data range
        const bucketStartTimes = Array(6).fill(null).map((_, index) => {
            const bucketStart = new Date(earliestDate.getTime() + (monthSpan * index));
            return bucketStart;
        });

        // Calculate the end time for each bucket
        const bucketEndTimes = bucketStartTimes.map((startTime, index) => {
            if (index === 5) {
                return latestDate; // Last bucket ends at latestDate
            }
            return new Date(bucketStartTimes[index + 1].getTime() - 1); // 1ms before next bucket starts
        });

        // Format date to display month and day
        const getMonthDayFormat = (date: Date): string => {
            const day = date.getDate();
            const month = date.toLocaleString('default', {month: 'long'});
            return `${month} ${day}`;
        };

        // Get bucket labels with month and day
        const bucketLabels = bucketStartTimes.map((startTime, index) => {
            const endTime = bucketEndTimes[index];
            return `${getMonthDayFormat(startTime)} - ${getMonthDayFormat(endTime)}`;
        });

        // Distribute data points into appropriate buckets
        pollutantHistoryData.forEach(dataPoint => {
            const dataTime = new Date(dataPoint.report_date_time);

            for (let i = 0; i < 6; i++) {
                if (dataTime >= bucketStartTimes[i] && dataTime <= bucketEndTimes[i]) {
                    buckets[i].push(dataPoint);
                    break;
                }
            }
        });

        // Calculate average values for each bucket
        const bucketAverages: PollutantBucketData[] = buckets.map((bucket, index) => {
            // If bucket is empty, return object with null values
            if (bucket.length === 0) {
                return {
                    label: bucketLabels[index],
                    o3_ppb: undefined,
                    co_ppm: undefined,
                    so2_ppb: undefined,
                    no2_ppb: undefined,
                    pm10_ug_m3: undefined,
                    pm2_5_ug_m3: undefined,
                    PM2_5_AQI: undefined,
                    PM10_AQI: undefined,
                    SO2_AQI: undefined,
                    NO2_AQI: undefined,
                    O3_AQI: undefined,
                    CO_AQI: undefined
                };
            }

            // Calculate averages for each pollutant
            return {
                label: bucketLabels[index],
                o3_ppb: calculateAverage(bucket.map(d => d.o3_ppb)),
                co_ppm: calculateAverage(bucket.map(d => d.co_ppm)),
                so2_ppb: calculateAverage(bucket.map(d => d.so2_ppb)),
                no2_ppb: calculateAverage(bucket.map(d => d.no2_ppb)),
                pm10_ug_m3: calculateAverage(bucket.map(d => d.pm10_ug_m3)),
                pm2_5_ug_m3: calculateAverage(bucket.map(d => d.pm2_5_ug_m3)),
                PM2_5_AQI: calculateAverage(bucket.map(d => d.PM2_5_AQI)),
                PM10_AQI: calculateAverage(bucket.map(d => d.PM10_AQI)),
                SO2_AQI: calculateAverage(bucket.map(d => d.SO2_AQI)),
                NO2_AQI: calculateAverage(bucket.map(d => d.NO2_AQI)),
                O3_AQI: calculateAverage(bucket.map(d => d.O3_AQI)),
                CO_AQI: calculateAverage(bucket.map(d => d.CO_AQI))
            };
        });

        return bucketAverages;

    } catch (error) {
        logger.error(`Error extracting 6-month pollutant history data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPastYearEpaMonitorsDataForLocation = async (location: number, currentDateTime: Date): Promise<EpaMonitorsData[]> => {
    try {
        // Calculate the date 1 year ago from the current date
        const oneYearAgo = new Date(currentDateTime);
        oneYearAgo.setFullYear(currentDateTime.getFullYear() - 1);

        // Query the database for records within the last year for the specified location
        const data = await EpaMonitorsDataModel.find({
            location: location,
            report_date_time: {
                $gte: oneYearAgo,
                $lte: currentDateTime
            }
        }).sort({report_date_time: 1}); // Sort by date in ascending order

        logger.info(`Retrieved ${data.length} records for location ${location} in the last year`);

        return data;
    } catch (error) {
        logger.error(`Error retrieving 1-year data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPollutantHistoryDataForPastYear = async (location: number, currentDateTime: Date): Promise<PollutantBucketData[]> => {
    try {
        const pastYearData = await getPastYearEpaMonitorsDataForLocation(location, currentDateTime);

        if (pastYearData.length === 0) {
            return [];
        }

        // Extract only the pollutant concentration/AQI fields and report_date_time
        const pollutantHistoryData: PollutantHistoryData[] = pastYearData.map((data: EpaMonitorsData) => ({
            report_date_time: data.report_date_time,

            // Pollutant concentration fields
            o3_ppb: data.o3_ppb,
            co_ppm: data.co_ppm,
            so2_ppb: data.so2_ppb,
            no_ppb: data.no_ppb,
            no2_ppb: data.no2_ppb,
            nox_ppb: data.nox_ppb,
            pm10_ug_m3: data.pm10_ug_m3,
            pm2_5_ug_m3: data.pm2_5_ug_m3,

            // AQI values
            PM2_5_AQI: data.PM2_5_AQI,
            PM10_AQI: data.PM10_AQI,
            SO2_AQI: data.SO2_AQI,
            NO2_AQI: data.NO2_AQI,
            O3_AQI: data.O3_AQI,
            CO_AQI: data.CO_AQI
        }));

        // Find the earliest and latest dates in the data
        const sortedDates = pollutantHistoryData
            .map(data => new Date(data.report_date_time))
            .sort((a, b) => a.getTime() - b.getTime());

        const earliestDate = sortedDates[0];
        const latestDate = currentDateTime;

        // Calculate the total time span in milliseconds
        const timeSpan = latestDate.getTime() - earliestDate.getTime();
        const quarterSpan = timeSpan / 4; // Divide into 4 equal parts (quarters)

        // Create 4 buckets, one for each quarter of the past year
        const buckets: PollutantHistoryData[][] = Array(4).fill(null).map(() => []);

        // Calculate the start time for each bucket based on actual data range
        const bucketStartTimes = Array(4).fill(null).map((_, index) => {
            const bucketStart = new Date(earliestDate.getTime() + (quarterSpan * index));
            return bucketStart;
        });

        // Calculate the end time for each bucket
        const bucketEndTimes = bucketStartTimes.map((startTime, index) => {
            if (index === 3) {
                return latestDate; // Last bucket ends at latestDate
            }
            return new Date(bucketStartTimes[index + 1].getTime() - 1); // 1ms before next bucket starts
        });

        // Format date to display month, day, and year
        const getMonthDayYearFormat = (date: Date): string => {
            const day = date.getDate();
            const month = date.toLocaleString('default', {month: 'long'});
            const year = date.getFullYear();
            return `${month} ${day}, ${year}`;
        };

        // Get bucket labels with month, day, and year
        const bucketLabels = bucketStartTimes.map((startTime, index) => {
            const endTime = bucketEndTimes[index];
            return `${getMonthDayYearFormat(startTime)} - ${getMonthDayYearFormat(endTime)}`;
        });

        // Distribute data points into appropriate buckets
        pollutantHistoryData.forEach(dataPoint => {
            const dataTime = new Date(dataPoint.report_date_time);

            for (let i = 0; i < 4; i++) {
                if (dataTime >= bucketStartTimes[i] && dataTime <= bucketEndTimes[i]) {
                    buckets[i].push(dataPoint);
                    break;
                }
            }
        });

        // Calculate average values for each bucket
        const bucketAverages: PollutantBucketData[] = buckets.map((bucket, index) => {
            // If bucket is empty, return object with null values
            if (bucket.length === 0) {
                return {
                    label: bucketLabels[index],
                    o3_ppb: undefined,
                    co_ppm: undefined,
                    so2_ppb: undefined,
                    no2_ppb: undefined,
                    pm10_ug_m3: undefined,
                    pm2_5_ug_m3: undefined,
                    PM2_5_AQI: undefined,
                    PM10_AQI: undefined,
                    SO2_AQI: undefined,
                    NO2_AQI: undefined,
                    O3_AQI: undefined,
                    CO_AQI: undefined
                };
            }

            // Calculate averages for each pollutant
            return {
                label: bucketLabels[index],
                o3_ppb: calculateAverage(bucket.map(d => d.o3_ppb)),
                co_ppm: calculateAverage(bucket.map(d => d.co_ppm)),
                so2_ppb: calculateAverage(bucket.map(d => d.so2_ppb)),
                no2_ppb: calculateAverage(bucket.map(d => d.no2_ppb)),
                pm10_ug_m3: calculateAverage(bucket.map(d => d.pm10_ug_m3)),
                pm2_5_ug_m3: calculateAverage(bucket.map(d => d.pm2_5_ug_m3)),
                PM2_5_AQI: calculateAverage(bucket.map(d => d.PM2_5_AQI)),
                PM10_AQI: calculateAverage(bucket.map(d => d.PM10_AQI)),
                SO2_AQI: calculateAverage(bucket.map(d => d.SO2_AQI)),
                NO2_AQI: calculateAverage(bucket.map(d => d.NO2_AQI)),
                O3_AQI: calculateAverage(bucket.map(d => d.O3_AQI)),
                CO_AQI: calculateAverage(bucket.map(d => d.CO_AQI))
            };
        });

        return bucketAverages;

    } catch (error) {
        logger.error(`Error extracting yearly pollutant history data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getAllPollutantHistoricalData = async (location: number, currentDateTime: Date): Promise<PollutantHistoricalData> => {
    try {
        // Check if data exists in cache and is not expired
        const cachedData = cache.historicalDataForAllPeriods[location];
        const now = Date.now();
        if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
            logger.info(`Using cached historical data for all time periods for location ${location}`);
            return cachedData.data;
        }

        logger.info(`Cache miss for historical data (all periods) for location ${location}, fetching from database`);

        // Fetch all historical data in parallel
        const [
            oneDay,
            oneWeek,
            oneMonth,
            threeMonths,
            sixMonths,
            twelveMonths
        ] = await Promise.all([
            getPollutantHistoryDataForPast24Hours(location, currentDateTime),
            getPollutantHistoryDataForPastWeek(location, currentDateTime),
            getPollutantHistoryDataForPastMonth(location, currentDateTime),
            getPollutantHistoryDataForPastThreeMonths(location, currentDateTime),
            getPollutantHistoryDataForPastSixMonths(location, currentDateTime),
            getPollutantHistoryDataForPastYear(location, currentDateTime)
        ]);

        const result = {
            oneDay,
            oneWeek,
            oneMonth,
            threeMonths,
            sixMonths,
            twelveMonths
        };

        // Store in cache
        cache.historicalDataForAllPeriods[location] = {
            data: result,
            timestamp: now
        };

        return result;
    } catch (error) {
        logger.error(`Error fetching all historical pollutant data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return {
            oneDay: [],
            oneWeek: [],
            oneMonth: [],
            threeMonths: [],
            sixMonths: [],
            twelveMonths: []
        };
    }
};

// Get pollutant summary data for a location (current value, daily avg, weekly avg)
export const getPollutantSummaryForLocation = async (location: number): Promise<PollutantSummaryData> => {
    try {
        // Check if data exists in cache and is not expired
        const cachedData = cache.pollutantSummary[location];
        const now = Date.now();

        if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
            logger.info(`Using cached pollutant summary for location ${location}`);
            return cachedData.data;
        }

        logger.info(`Cache miss for pollutant summary for location ${location}, fetching data`);

        const currentDateTime = new Date();

        // Get current data
        const currentData = await fetchCurrentEpaMonitorsDataForLocation(location);

        // Get past 24 hours data for daily average
        const past24HoursData = await getPast24HoursEpaMonitorsDataForLocation(location, currentDateTime);

        // Get past week data for weekly average
        const pastWeekData = await getPastWeekEpaMonitorsDataForLocation(location, currentDateTime);

        // Calculate daily averages with fallback to 0
        const dailyAvg = {
            o3_ppb: calculateAverage(past24HoursData.map(d => d.o3_ppb)) ?? 0,
            co_ppm: calculateAverage(past24HoursData.map(d => d.co_ppm)) ?? 0,
            so2_ppb: calculateAverage(past24HoursData.map(d => d.so2_ppb)) ?? 0,
            no_ppb: calculateAverage(past24HoursData.map(d => d.no_ppb)) ?? 0,
            no2_ppb: calculateAverage(past24HoursData.map(d => d.no2_ppb)) ?? 0,
            nox_ppb: calculateAverage(past24HoursData.map(d => d.nox_ppb)) ?? 0,
            pm10_ug_m3: calculateAverage(past24HoursData.map(d => d.pm10_ug_m3)) ?? 0,
            pm2_5_ug_m3: calculateAverage(past24HoursData.map(d => d.pm2_5_ug_m3)) ?? 0,

            // AQI values
            PM2_5_AQI: calculateAverage(past24HoursData.map(d => d.PM2_5_AQI)) ?? 0,
            PM10_AQI: calculateAverage(past24HoursData.map(d => d.PM10_AQI)) ?? 0,
            SO2_AQI: calculateAverage(past24HoursData.map(d => d.SO2_AQI)) ?? 0,
            NO2_AQI: calculateAverage(past24HoursData.map(d => d.NO2_AQI)) ?? 0,
            O3_AQI: calculateAverage(past24HoursData.map(d => d.O3_AQI)) ?? 0,
            CO_AQI: calculateAverage(past24HoursData.map(d => d.CO_AQI)) ?? 0
        };

        // Calculate weekly averages with fallback to 0
        const weeklyAvg = {
            o3_ppb: calculateAverage(pastWeekData.map(d => d.o3_ppb)) ?? 0,
            co_ppm: calculateAverage(pastWeekData.map(d => d.co_ppm)) ?? 0,
            so2_ppb: calculateAverage(pastWeekData.map(d => d.so2_ppb)) ?? 0,
            no_ppb: calculateAverage(pastWeekData.map(d => d.no_ppb)) ?? 0,
            no2_ppb: calculateAverage(pastWeekData.map(d => d.no2_ppb)) ?? 0,
            nox_ppb: calculateAverage(pastWeekData.map(d => d.nox_ppb)) ?? 0,
            pm10_ug_m3: calculateAverage(pastWeekData.map(d => d.pm10_ug_m3)) ?? 0,
            pm2_5_ug_m3: calculateAverage(pastWeekData.map(d => d.pm2_5_ug_m3)) ?? 0,

            // AQI values
            PM2_5_AQI: calculateAverage(pastWeekData.map(d => d.PM2_5_AQI)) ?? 0,
            PM10_AQI: calculateAverage(pastWeekData.map(d => d.PM10_AQI)) ?? 0,
            SO2_AQI: calculateAverage(pastWeekData.map(d => d.SO2_AQI)) ?? 0,
            NO2_AQI: calculateAverage(pastWeekData.map(d => d.NO2_AQI)) ?? 0,
            O3_AQI: calculateAverage(pastWeekData.map(d => d.O3_AQI)) ?? 0,
            CO_AQI: calculateAverage(pastWeekData.map(d => d.CO_AQI)) ?? 0
        };

        // Prepare and return the summary data
        const result = {
            current: {
                o3_ppb: currentData.o3_ppb,
                co_ppm: currentData.co_ppm,
                so2_ppb: currentData.so2_ppb,
                no_ppb: currentData.no_ppb,
                no2_ppb: currentData.no2_ppb,
                nox_ppb: currentData.nox_ppb,
                pm10_ug_m3: currentData.pm10_ug_m3,
                pm2_5_ug_m3: currentData.pm2_5_ug_m3,

                // AQI values
                PM2_5_AQI: currentData.PM2_5_AQI,
                PM10_AQI: currentData.PM10_AQI,
                SO2_AQI: currentData.SO2_AQI,
                NO2_AQI: currentData.NO2_AQI,
                O3_AQI: currentData.O3_AQI,
                CO_AQI: currentData.CO_AQI,

                // Timestamp
                timestamp: currentData.report_date_time.toISOString()
            },
            daily_avg: dailyAvg,
            weekly_avg: weeklyAvg
        };

        // Store result in cache
        cache.pollutantSummary[location] = {
            data: result,
            timestamp: now
        };

        return result;
    } catch (error) {
        logger.error(`Error getting pollutant summary for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        throw new Error(`Failed to get pollutant summary for location ${location}`);
    }
};

// 🟢 Get Latest EPA Monitors Data from MongoDB for a location
export const getLatestEpaMonitorsDataFromDB = async (location: number): Promise<EpaMonitorsDataWithForecast> => {
    try {
        const now = Date.now();
        
        // Check EPA data cache
        let currentData: EpaMonitorsData;
        const cachedEpaData = cache.currentData[location];
        
        if (cachedEpaData && (now - cachedEpaData.timestamp < CACHE_EXPIRY)) {
            logger.info(`Using cached EPA data for location ${location}`);
            currentData = cachedEpaData.data;
        } else {
            logger.info(`Cache miss for EPA data for location ${location}, fetching from database`);
            const latestRecord = await EpaMonitorsDataModel.findOne({location})
                .sort({report_date_time: -1}) // Get the latest entry based on report_date_time
                .lean();

            if (!latestRecord) {
                throw new Error(`No EPA Monitors data found for location ${location}`);
            }

            currentData = latestRecord as EpaMonitorsData;
            
            // Store EPA data in cache
            cache.currentData[location] = {
                data: currentData,
                timestamp: now
            };
        }
        
        // Check forecast data cache (with longer expiry - 30 minutes)
        const FORECAST_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes
        let forecastData = undefined;
        const cachedForecastData = cache.forecastData[location];
        
        if (cachedForecastData && (now - cachedForecastData.timestamp < FORECAST_CACHE_EXPIRY)) {
            logger.info(`Using cached forecast data for location ${location}`);
            forecastData = cachedForecastData.data;
        } else {
            logger.info(`Cache miss for forecast data for location ${location}, fetching from database`);
            try {
                // Get tomorrow's date for forecast lookup
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const forecast = await getForecastForLocationAndDate(location, tomorrow);
                if (forecast) {
                    forecastData = {
                        forecast_date: new Date(forecast.forecast_date),
                        PM2_5_AQI_forecast: forecast.PM2_5_AQI_forecast,
                        PM10_AQI_forecast: forecast.PM10_AQI_forecast,
                        SO2_AQI_forecast: forecast.SO2_AQI_forecast,
                        NO2_AQI_forecast: forecast.NO2_AQI_forecast,
                        O3_AQI_forecast: forecast.O3_AQI_forecast,
                        CO_AQI_forecast: forecast.CO_AQI_forecast
                    };
                    logger.info(`✅ Found forecast for location ${location} on ${tomorrow.toISOString().split('T')[0]}`);
                } else {
                    logger.info(`No forecast found for location ${location} on ${tomorrow.toISOString().split('T')[0]}`);
                }
                
                // Store forecast data in cache (even if undefined)
                cache.forecastData[location] = {
                    data: forecastData,
                    timestamp: now
                };
            } catch (forecastError) {
                logger.warn(`Failed to get forecast for location ${location}: ${forecastError instanceof Error ? forecastError.message : 'Unknown error'}`);
                // Store null in cache to prevent repeated failures
                cache.forecastData[location] = {
                    data: undefined,
                    timestamp: now
                };
            }
        }

        // Combine current data with forecast
        const result: EpaMonitorsDataWithForecast = {
            ...currentData,
            forecast: forecastData
        };

        return result;
    } catch (error) {
        logger.error(`Error fetching latest EPA Monitors data from DB for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        throw new Error(`Failed to fetch latest EPA Monitors data for location ${location}`);
    }
};

/**
 * Get AQI data for all Lahore locations
 * This function retrieves the latest AQI values for all Lahore monitoring locations
 * Uses a cache to minimize database queries
 */
export const getLahoreLocationsAqiData = async (): Promise<LahoreLocationAqiData[]> => {
    try {
        const now = Date.now();

        // Check if we have a cache for Lahore locations AQI data
        if (
            cache.lahoreLocationsAqi &&
            (now - cache.lahoreLocationsAqi.timestamp < CACHE_EXPIRY)
        ) {
            logger.info('Using cached Lahore locations AQI data');
            return cache.lahoreLocationsAqi.data;
        }

        logger.info('Fetching Lahore locations AQI data from database');

        // Lahore locations (hardcoded for now since we know these are Lahore's locations)
        const lahoreLocationCodes = ['1', '2', '3', '4', '5'];

        // Get data for all locations
        const locationsData: LahoreLocationAqiData[] = await Promise.all(
            lahoreLocationCodes.map(async (locationCode) => {
                try {
                    const locationData = await getLatestEpaMonitorsDataFromDB(Number(locationCode));

                    const aqi = Math.round(locationData.PM2_5_AQI);

                    return {
                        locationCode,
                        aqi,
                        report_date_time: locationData.report_date_time.toISOString()
                    };
                } catch (error) {
                    logger.error(`Error fetching data for location ${locationCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    // Return default values if we can't get the data
                    return {
                        locationCode,
                        aqi: 0,
                        report_date_time: new Date().toISOString()
                    };
                }
            })
        );

        // Cache the results
        cache.lahoreLocationsAqi = {
            data: locationsData,
            timestamp: now
        };

        return locationsData;
    } catch (error) {
        logger.error(`Error getting Lahore locations AQI data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
    }
};