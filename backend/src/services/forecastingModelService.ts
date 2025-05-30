import { Parser } from 'json2csv';
import * as fs from 'fs';
import { exec } from "node:child_process";
import path from "node:path";
import { parse } from "csv-parse/sync";
import User from "../models/user.model";
import DemographicSurvey from "../models/demographicSurvey.model";
import EpaMonitorsDataModel from "../models/epaMonitorsData.model";
import { sendNotifications } from "./notificationService";
import { storeForecastRecords, ForecastRecord, markAlertsAsSent } from "./airQualityForecastService";
import logger from "../utils/logger";
import { ForecastingModelParams } from "../types/forecastingModelParams";
import { invalidateForecastCacheForLocation } from "./epaMonitorsData.service";

// Map AQI threshold levels to numeric values
const AQI_THRESHOLD_MAP: Record<string, number> = {
    'good': 50,             // Green - Good
    'satisfactory': 100,    // Light Green - Satisfactory
    'moderate': 150,        // Yellow - Moderate
    'unhealthyForSensitive': 200, // Orange - Unhealthy for sensitive groups
    'unhealthy': 300,       // Red - Unhealthy
    'veryUnhealthy': 400,   // Purple - Very Unhealthy
    'hazardous': 500        // Brown - Hazardous
};

// Alert messages in different languages
const ALERT_MESSAGES = {
    english: {
        title: 'Air Quality Alert',
        body: (aqi: number, date: string) => 
            `Air quality alert: Forecast shows PM2.5 AQI of ${Math.round(aqi)} for ${date}. This exceeds your alert threshold. Take necessary precautions.`
    },
    urdu: {
        title: 'ہوا کے معیار کا الرٹ',
        body: (aqi: number, date: string) => 
            `ہوا کے معیار کا الرٹ: پیش گوئی ${date} کے لیے PM2.5 AQI ${Math.round(aqi)} دکھاتی ہے۔ یہ آپ کی الرٹ کی حد سے تجاوز کرتا ہے۔ ضروری احتیاطی تدابیر اختیار کریں۔`
    }
};

// CSV field definitions for R model input
const EPA_DATA_FIELDS = [
    'location',
    'report_date_time',
    'o3_ppb',
    'co_ppm',
    'so2_ppb',
    'no_ppb',
    'no2_ppb',
    'nox_ppb',
    'pm10_ug_m3',
    'pm2_5_ug_m3',
    'temperature',
    'humidity',
    'atmospheric_pressure_kpa',
    'wind_speed_m_s',
    'wind_direction',
    'rainfall_mm',
    'total_solar_radiation_w_m2',
    'PM2_5_AQI',
    'PM10_AQI',
    'SO2_AQI',
    'NO2_AQI',
    'O3_AQI',
    'CO_AQI'
];

/**
 * Interface for forecast data
 */
interface ForecastData {
    location: number;
    date: string;
    PM2_5_AQI: number;
}

/**
 * Interface for notification info by language
 */
interface NotificationByLanguage {
    byLanguage: Map<string, string[]>;  // Map of language -> array of FCM tokens
    forecast: {
        location: number;
        report_date_time: Date;
        PM2_5_AQI: number;
        PM10_AQI: number;
        SO2_AQI: number;
        NO2_AQI: number;
        O3_AQI: number;
        CO_AQI: number;
    };
}

/**
 * Prepares EPA data and runs the R forecasting model
 * @returns Promise with the model results or error
 */
export const runForecastingModel = async (): Promise<any[]> => {
    logger.info('Preparing EPA data for forecasting model');
    
    // Fetch EPA monitoring data
    const data = await fetchEpaMonitoringData();
    
    // Convert data to CSV format for the R script
    const csv = convertDataToCsv(data);
    
    // Set up file paths
    const { tempDir, inputCsvPath, outputCsvPath, rScriptPath } = setupFilePaths();
    
    // Ensure temp directory exists
    ensureTempDirectoryExists(tempDir);
    
    // Write data to CSV file
    fs.writeFileSync(inputCsvPath, csv);
    logger.info('✅ CSV ready, now calling R script...');
    
    // Execute R script and return results
    return await executeRScript(rScriptPath, inputCsvPath, outputCsvPath);
};

/**
 * Fetches EPA monitoring data from the database
 * @returns Promise with EPA data
 */
const fetchEpaMonitoringData = async (): Promise<any[]> => {
    return await EpaMonitorsDataModel.find(
        {},
        {
            location: 1,
            report_date_time: 1,
            o3_ppb: 1,
            co_ppm: 1,
            so2_ppb: 1,
            no_ppb: 1,
            no2_ppb: 1,
            nox_ppb: 1,
            pm10_ug_m3: 1,
            pm2_5_ug_m3: 1,
            temperature: 1,
            humidity: 1,
            atmospheric_pressure_kpa: 1,
            wind_speed_m_s: 1,
            wind_direction: 1,
            rainfall_mm: 1,
            total_solar_radiation_w_m2: 1,
            PM2_5_AQI: 1,
            PM10_AQI: 1,
            SO2_AQI: 1,
            NO2_AQI: 1,
            O3_AQI: 1,
            CO_AQI: 1,
            _id: 0 // Exclude MongoDB _id field
        }
    ).lean();
};

/**
 * Converts data to CSV format for R script
 * @param data EPA monitoring data
 * @returns CSV string
 */
const convertDataToCsv = (data: any[]): string => {
    const parser = new Parser({ fields: EPA_DATA_FIELDS });
    return parser.parse(data);
};

/**
 * Sets up file paths for the R script
 * @returns Object with file paths
 */
const setupFilePaths = () => {
    const tempDir = path.join(__dirname, '../../temp');
    const inputCsvPath = path.join(tempDir, 'epa_data.csv');
    const outputCsvPath = path.join(tempDir, 'forecast_output.csv');
    const rScriptPath = path.join(__dirname, '../scripts/forecasting_model.R');
    
    return { tempDir, inputCsvPath, outputCsvPath, rScriptPath };
};

/**
 * Ensures the temporary directory exists
 * @param tempDir Path to temporary directory
 */
const ensureTempDirectoryExists = (tempDir: string): void => {
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
};

/**
 * Executes the R script and returns the results
 * @param rScriptPath Path to R script
 * @param inputCsvPath Path to input CSV
 * @param outputCsvPath Path to output CSV
 * @returns Promise with the R script results
 */
const executeRScript = (rScriptPath: string, inputCsvPath: string, outputCsvPath: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        exec(`Rscript ${rScriptPath} ${inputCsvPath} ${outputCsvPath}`, (error, stdout, stderr) => {
            // Clean up input file regardless of result
            if (fs.existsSync(inputCsvPath)) {
                fs.unlinkSync(inputCsvPath);
            }

            if (error) {
                logger.error(`❌ R script error: ${error.message}`);
                reject(new Error(`R script failed: ${error.message}`));
                return;
            }

            if (stderr) {
                logger.warn(`⚠️ R script stderr: ${stderr}`);
            }

            logger.info('✅ Forecasting model executed successfully');

            // Read and parse forecast_output.csv
            if (!fs.existsSync(outputCsvPath)) {
                reject(new Error('Output file not found'));
                return;
            }

            try {
                const csvData = fs.readFileSync(outputCsvPath, 'utf-8');
                const records = parse(csvData, {
                    columns: true,
                    skip_empty_lines: true
                });

                logger.info('✅ Forecasting model executed and parsed successfully');
                resolve(records);
            } catch (readErr) {
                if (readErr instanceof Error) {
                    logger.error(`❌ Failed to read or parse output CSV: ${readErr.message}`);
                    reject(readErr);
                } else {
                    const error = new Error('Unknown error reading output CSV');
                    logger.error('❌ Unknown error! Failed to read or parse output CSV');
                    reject(error);
                }
            }
        });
    });
};

/**
 * Gets the next day's date from the current date
 * @returns Next day's date in ISO format (YYYY-MM-DD)
 */
const getNextDayDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

/**
 * Creates a map of locations to forecast data
 * @param records Forecast records
 * @returns Map of location IDs to forecast data
 */
const createLocationMap = (records: any[]): Map<number, ForecastData> => {
    const locationMap = new Map<number, ForecastData>();
    
    // Get tomorrow's date instead of using the date from the script
    const nextDayDate = getNextDayDate();
    
    for (const record of records) {
        // Convert location to number for consistency with user model
        const locationId = Number(record.location);
        if (!isNaN(locationId)) {
            // Store the latest forecast for each location with tomorrow's date
            locationMap.set(locationId, {
                location: locationId,
                date: nextDayDate, // Use next day's date instead of record.date
                PM2_5_AQI: parseFloat(record.forecast_PM2_5_AQI_loc_day)
            });
        }
    }
    
    return locationMap;
};

/**
 * Stores forecast data in the database
 * @param locationMap Map of location IDs to forecast data
 */
const storeForecastsInDatabase = async (locationMap: Map<number, ForecastData>): Promise<void> => {
    try {
        // Convert location map to forecast records array
        const forecastRecords: ForecastRecord[] = Array.from(locationMap.values()).map(forecast => ({
            location: forecast.location,
            forecast_date: new Date(forecast.date),
            PM2_5_AQI_forecast: forecast.PM2_5_AQI,
        }));

        logger.info(`Preparing to store ${forecastRecords.length} forecast records`);
        
        // Store the forecast records in the database
        const savedForecasts = await storeForecastRecords(forecastRecords);
        
        logger.info(`✅ Successfully stored ${savedForecasts.length} forecast records in air_quality_forecasts table`);

        // Invalidate cache for all locations that had forecasts stored
        for (const locationId of locationMap.keys()) {
            invalidateForecastCacheForLocation(locationId);
        }
        logger.info(`Cache invalidated for ${locationMap.size} locations`);
    } catch (error) {
        logger.error(`❌ Failed to store forecasts in database: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};

/**
 * Process forecast records and send alerts to users based on their location and threshold preferences
 * @param records Forecast records from the R model
 */
export const processForecasts = async (records: any[]): Promise<void> => {
    try {
        logger.info(`Processing ${records.length} forecast records for alerts`);
        
        // Group records by location
        const locationMap = createLocationMap(records);
        
        // Get all unique locations from the forecast
        const forecastLocations = Array.from(locationMap.keys());
        logger.info(`Found forecasts for ${forecastLocations.length} locations: ${forecastLocations.join(', ')}`);
        
        // Fetch users and their language preferences
        const { users, languagePreferences } = await fetchUsersAndPreferences(forecastLocations);
        
        // Identify users to alert based on thresholds
        const usersToAlert = identifyUsersToAlert(users, locationMap, languagePreferences);
        
        // Send alerts to users whose thresholds were exceeded
        await sendAlertsToUsers(usersToAlert);

        // Store the forecasts in the database table "air_quality_forecasts"
        await storeForecastsInDatabase(locationMap);
        
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error in processForecasts: ${error.message}`);
        } else {
            logger.error('Unknown error in processForecasts');
        }
        throw error;
    }
};

/**
 * Fetches users and their language preferences
 * @param forecastLocations Array of location IDs
 * @returns Object with users and language preferences
 */
const fetchUsersAndPreferences = async (forecastLocations: number[]) => {
    // Fetch all users with their locations and alert thresholds
    const users = await User.find(
        { location: { $in: forecastLocations } }, 
        'id_user fcmToken location alerts_threshold'
    );
    logger.info(`Found ${users.length} users in the forecast locations`);
    
    // Get user IDs to fetch demographic information
    const userIds = users.map(user => user.id_user);
    
    // Fetch demographic survey data for language preferences
    const demographicSurveys = await DemographicSurvey.find(
        { id_user: { $in: userIds } }, 
        'id_user language_preference'
    );
    
    // Create a map of user IDs to language preferences
    const languagePreferences = new Map<string, string>();
    demographicSurveys.forEach(survey => {
        if (survey.language_preference) {
            languagePreferences.set(survey.id_user, survey.language_preference.toLowerCase());
        }
    });
    
    logger.info(`Found language preferences for ${languagePreferences.size} users`);
    
    return { users, languagePreferences };
};

/**
 * Identifies users to alert based on their thresholds
 * @param users Array of users
 * @param locationMap Map of location IDs to forecast data
 * @param languagePreferences Map of user IDs to language preferences
 * @returns Map of location IDs to notification info
 */
const identifyUsersToAlert = (
    users: any[], 
    locationMap: Map<number, ForecastData>, 
    languagePreferences: Map<string, string>
): Map<number, NotificationByLanguage> => {
    // Create a map to store users whose thresholds have been exceeded
    const usersToAlert = new Map<number, NotificationByLanguage>();
    
    // Process each user and check if their threshold is exceeded
    for (const user of users) {
        const locationId = user.location;
        const forecast = locationMap.get(locationId);
        
        if (!forecast) {
            logger.info(`No forecast found for user location ${locationId}`);
            continue;
        }
        
        const forecastAqi = forecast.PM2_5_AQI || 0;
        const thresholdValue = AQI_THRESHOLD_MAP[user.alerts_threshold] || AQI_THRESHOLD_MAP.unhealthy;
        
        if (forecastAqi >= thresholdValue) {
            // Get user's language preference, default to English
            const language = languagePreferences.get(user.id_user) || 'english';
            
            logger.info(`Alert needed for user with threshold ${user.alerts_threshold} (${thresholdValue}) at location ${locationId} with forecast AQI ${forecastAqi}. Language: ${language}`);
            
            // Initialize the location entry if it doesn't exist
            if (!usersToAlert.has(locationId)) {
                usersToAlert.set(locationId, {
                    byLanguage: new Map<string, string[]>(),
                    forecast: {
                        location: locationId,
                        report_date_time: new Date(forecast.date),
                        PM2_5_AQI: forecast.PM2_5_AQI,
                        // Set other AQI values to 0 to ensure they don't trigger alerts
                        PM10_AQI: 0,
                        SO2_AQI: 0,
                        NO2_AQI: 0,
                        O3_AQI: 0,
                        CO_AQI: 0
                    }
                });
            }
            
            // Initialize the language entry if it doesn't exist
            const locationInfo = usersToAlert.get(locationId)!;
            if (!locationInfo.byLanguage.has(language)) {
                locationInfo.byLanguage.set(language, []);
            }
            
            // Add this user's token to the list for their preferred language
            if (user.fcmToken && user.fcmToken.trim() !== '') {
                locationInfo.byLanguage.get(language)!.push(user.fcmToken);
            }
        }
    }
    
    return usersToAlert;
};

/**
 * Sends alerts to users whose thresholds were exceeded
 * @param usersToAlert Map of location IDs to notification info
 */
const sendAlertsToUsers = async (usersToAlert: Map<number, NotificationByLanguage>): Promise<void> => {
    if (usersToAlert.size > 0) {
        logger.info(`Sending alerts to users in ${usersToAlert.size} locations`);
        
        // Process each location and send notifications to specific users whose thresholds were exceeded
        for (const [locationId, info] of usersToAlert.entries()) {
            // Format the date consistently
            const forecastDate = formatForecastDate(info.forecast.report_date_time);
            
            // Process each language group at this location
            for (const [language, tokens] of info.byLanguage.entries()) {
                if (tokens.length > 0) {
                    logger.info(`Location ${locationId}: alerting ${tokens.length} users in ${language}`);
                    
                    try {
                        await sendLocalizedNotifications(language, tokens, info.forecast.PM2_5_AQI, forecastDate);
                    } catch (notificationErr) {
                        logger.error(`Error sending notifications for location ${locationId} in ${language}: ${notificationErr instanceof Error ? notificationErr.message : 'Unknown error'}`);
                    }
                }
            }
        }
    } else {
        logger.info('No users have thresholds that were exceeded by the forecast');
    }
};

/**
 * Formats the forecast date for display
 * @param date Date object
 * @returns Formatted date string
 */
const formatForecastDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Sends localized notifications to users
 * @param language Language code
 * @param tokens Array of FCM tokens
 * @param aqi AQI value
 * @param forecastDate Formatted forecast date
 */
const sendLocalizedNotifications = async (language: string, tokens: string[], aqi: number, forecastDate: string): Promise<void> => {
    // Select the appropriate language template
    const messageTemplate = ALERT_MESSAGES[language as keyof typeof ALERT_MESSAGES] || ALERT_MESSAGES.english;
    
    // Create the notification with title and body in the appropriate language
    const title = messageTemplate.title;
    const body = messageTemplate.body(aqi, forecastDate);
    
    // Send notifications directly to the specific users in their preferred language
    await sendNotifications(tokens, body, title);
};

/**
 * Determines if users in a specific location should be alerted
 * Kept for backward compatibility with existing code
 * 
 * @param location Location ID
 * @param params Optional forecasting model parameters
 * @returns Boolean indicating whether users should be alerted
 */
export const shouldAlertUsersInLocation = (location: number, params?: ForecastingModelParams): boolean => {
    // If we have location-specific AQI forecasts, we could check them here
    // For now, maintaining backward compatibility with previous random implementation
    
    // Log that this function is deprecated
    logger.warn('shouldAlertUsersInLocation is deprecated. Use processForecasts instead for more accurate alerts.');
    
    // Return true if the location is valid (non-zero, non-negative)
    // This is better than a random check but still maintains compatibility
    return location > 0;
};
