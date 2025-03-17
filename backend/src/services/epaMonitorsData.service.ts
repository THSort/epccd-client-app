import axios from "axios";
import {EpaMonitorsData, HistoricalEpaMonitorsDataResponse, PollutantSummaryData, PollutantHistoryData, PollutantBucketData} from "../types/epaMonitorsData.types";
import logger from "../utils/logger";
import {shouldAlertUsersInLocation} from "./forecastingModelService";
import EpaMonitorsDataModel from "../models/epaMonitorsData.model";
import {alertUsersInLocations} from "./notificationService";

const BASE_URL = "http://34.132.171.41:8000/api/aqms_data/";

// Helper function to calculate average of numeric values, ignoring null/undefined
const calculateAverage = (values: (number | null | undefined)[]): number | null => {
    const validValues = values.filter(val => val !== null && val !== undefined) as number[];
    if (validValues.length === 0) return null;
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
};

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

export const getPollutantHistoryDataForPast24Hours = async (location: number, currentDateTime: Date): Promise<PollutantBucketData[]> => {
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
                    o3_ppb: null,
                    co_ppm: null,
                    so2_ppb: null,
                    no2_ppb: null,
                    pm10_ug_m3: null,
                    pm2_5_ug_m3: null,
                    PM2_5_AQI: null,
                    PM10_AQI: null,
                    SO2_AQI: null,
                    NO2_AQI: null,
                    O3_AQI: null,
                    CO_AQI: null
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

        console.log('formattedBucketAverages', formattedBucketAverages)
        
        return formattedBucketAverages;

    } catch (error) {
        logger.error(`Error extracting pollutant history data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
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
        }).sort({ report_date_time: 1 }); // Sort by date in ascending order
        
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
        }).sort({ report_date_time: 1 }); // Sort by date in ascending order
        
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
        }).sort({ report_date_time: 1 }); // Sort by date in ascending order
        
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
        }).sort({ report_date_time: 1 }); // Sort by date in ascending order
        
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
        }).sort({ report_date_time: 1 }); // Sort by date in ascending order
        
        logger.info(`Retrieved ${data.length} records for location ${location} in the last 6 months`);

        return data;
    } catch (error) {
        logger.error(`Error retrieving 6-month data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};

export const getPollutantHistoryDataForPastWeek = async (location: number, currentDateTime: Date): Promise<PollutantBucketData[]> => {
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
                    o3_ppb: null,
                    co_ppm: null,
                    so2_ppb: null,
                    no2_ppb: null,
                    pm10_ug_m3: null,
                    pm2_5_ug_m3: null,
                    PM2_5_AQI: null,
                    PM10_AQI: null,
                    SO2_AQI: null,
                    NO2_AQI: null,
                    O3_AQI: null,
                    CO_AQI: null
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
        
        console.log('dayAverages', dayAverages);
        return dayAverages;

    } catch (error) {
        logger.error(`Error extracting weekly pollutant history data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
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
            const month = date.toLocaleString('default', { month: 'short' });
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
                    o3_ppb: null,
                    co_ppm: null,
                    so2_ppb: null,
                    no2_ppb: null,
                    pm10_ug_m3: null,
                    pm2_5_ug_m3: null,
                    PM2_5_AQI: null,
                    PM10_AQI: null,
                    SO2_AQI: null,
                    NO2_AQI: null,
                    O3_AQI: null,
                    CO_AQI: null
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
        
        console.log('weekAverages', weekAverages);
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
            const month = date.toLocaleString('default', { month: 'long' });
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
                    o3_ppb: null,
                    co_ppm: null,
                    so2_ppb: null,
                    no2_ppb: null,
                    pm10_ug_m3: null,
                    pm2_5_ug_m3: null,
                    PM2_5_AQI: null,
                    PM10_AQI: null,
                    SO2_AQI: null,
                    NO2_AQI: null,
                    O3_AQI: null,
                    CO_AQI: null
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
        
        console.log('bucketAverages', bucketAverages);
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
            const month = date.toLocaleString('default', { month: 'long' });
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
                    o3_ppb: null,
                    co_ppm: null,
                    so2_ppb: null,
                    no2_ppb: null,
                    pm10_ug_m3: null,
                    pm2_5_ug_m3: null,
                    PM2_5_AQI: null,
                    PM10_AQI: null,
                    SO2_AQI: null,
                    NO2_AQI: null,
                    O3_AQI: null,
                    CO_AQI: null
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
        
        console.log('sixMonthBucketAverages', bucketAverages);
        return bucketAverages;

    } catch (error) {
        logger.error(`Error extracting 6-month pollutant history data for location ${location}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        return [];
    }
};