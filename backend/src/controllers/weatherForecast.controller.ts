import {Request, Response} from "express";
import axios from "axios";
import DailySnapshotModel from "../models/dailySnapshot.model";
import logger from "../utils/logger";

// Define the locations array
const locations = [
    {
        locationCode: '1',
        locationCity: 'Lahore',
        locationName: 'Sagian Road, Lahore',
        latitude: 31.623366,
        longitude: 74.389432,
    },
    {
        locationCode: '2',
        locationCity: 'Lahore',
        locationName: 'Mahmood Booti, Lahore',
        latitude: 31.613553,
        longitude: 74.394554,
    },
    {
        locationCode: '3',
        locationCity: 'Lahore',
        locationName: 'WWF Ferozpur Road, Lahore',
        latitude: 31.491538,
        longitude: 74.335076,
    },
    {
        locationCode: '4',
        locationCity: 'Lahore',
        locationName: 'Egerton Road, Lahore',
        latitude: 31.560210,
        longitude: 74.331020,
    },
    {
        locationCode: '5',
        locationCity: 'Lahore',
        locationName: 'Hill Park, Lahore',
        latitude: 31.609038,
        longitude: 74.390145,
    },
];

// Define the Open Meteo API URL with parameters
const OPEN_METEO_API_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_API_PAST_WEEK_URL = 'https://archive-api.open-meteo.com/v1/archive';

const WEATHER_PARAMS = 'hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,showers,rain,snowfall,snow_depth,wind_speed_80m,wind_speed_10m,wind_speed_180m,wind_speed_120m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_mid,cloud_cover_low,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm,uv_index,uv_index_clear_sky,total_column_integrated_water_vapour,cape,lifted_index&timezone=auto';

/**
 * Fetch weather forecasts for all locations and store in database
 */
export const fetchAndStoreWeatherForecasts = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Starting weather forecast fetch and store operation for ${locations.length} locations`);
    try {
        // Get current date in YYYY-MM-DD format
        const today = new Date();
        const snapshot_date = today.toISOString().split('T')[0];
        
        // Calculate past week dates
        const pastWeekEnd = new Date(today);
        pastWeekEnd.setDate(today.getDate() - 1); // Exclude today
        const pastWeekStart = new Date(pastWeekEnd);
        pastWeekStart.setDate(pastWeekEnd.getDate() - 5); // Include 6 days total (end-start+1=6)
        const pastWeekStartStr = pastWeekStart.toISOString().split('T')[0];
        const pastWeekEndStr = pastWeekEnd.toISOString().split('T')[0];
        
        logger.info(`Snapshot date: ${snapshot_date}, Past week range: ${pastWeekStartStr} to ${pastWeekEndStr}`);

        // Array to store results for response
        const results = [];

        // Process each location
        for (const location of locations) {
            const locationId = parseInt(location.locationCode);
            logger.info(`Processing location: ${location.locationName} (ID: ${locationId})`);

            try {
                // Construct API URL with location coordinates
                const forecastApiUrl = `${OPEN_METEO_API_FORECAST_URL}?latitude=${location.latitude}&longitude=${location.longitude}&${WEATHER_PARAMS}&forecast_days=3`;
                const pastWeekApiUrl = `${OPEN_METEO_API_PAST_WEEK_URL}?latitude=${location.latitude}&longitude=${location.longitude}&${WEATHER_PARAMS}&start_date=${pastWeekStartStr}&end_date=${pastWeekEndStr}`;

                logger.debug(`Forecast API URL: ${forecastApiUrl}`);
                logger.debug(`Past Week API URL: ${pastWeekApiUrl}`);

                // Fetch forecastData from Open Meteo API
                logger.info(`Fetching forecast data for location ${location.locationName}`);
                const forecastResponse = await axios.get(forecastApiUrl);
                const forecastData = forecastResponse.data;

                // Fetch pastWeekData from Open Meteo API
                logger.info(`Fetching past week data for location ${location.locationName}`);
                const pastWeekResponse = await axios.get(pastWeekApiUrl);
                const pastWeekData = pastWeekResponse.data;

                // Create forecast array
                logger.debug(`Processing ${forecastData.hourly.time.length} hourly forecast data points`);
                const future_forecast = forecastData.hourly.time.map((time: string, index: number) => ({
                    datetime: time,
                    temperature_2m: forecastData.hourly.temperature_2m[index],
                    relative_humidity_2m: forecastData.hourly.relative_humidity_2m[index],
                    dew_point_2m: forecastData.hourly.dew_point_2m[index],
                    apparent_temperature: forecastData.hourly.apparent_temperature[index],
                    precipitation_probability: forecastData.hourly.precipitation_probability[index],
                    precipitation: forecastData.hourly.precipitation[index],
                    showers: forecastData.hourly.showers[index],
                    rain: forecastData.hourly.rain[index],
                    wind_speed_80m: forecastData.hourly.wind_speed_80m[index],
                    wind_speed_10m: forecastData.hourly.wind_speed_10m[index],
                    wind_speed_180m: forecastData.hourly.wind_speed_180m[index],
                    wind_speed_120m: forecastData.hourly.wind_speed_120m[index],
                    wind_direction_10m: forecastData.hourly.wind_direction_10m[index],
                    wind_direction_80m: forecastData.hourly.wind_direction_80m[index],
                    wind_direction_120m: forecastData.hourly.wind_direction_120m[index],
                    wind_direction_180m: forecastData.hourly.wind_direction_180m[index],
                    wind_gusts_10m: forecastData.hourly.wind_gusts_10m[index],
                    temperature_80m: forecastData.hourly.temperature_80m[index],
                    temperature_120m: forecastData.hourly.temperature_120m[index],
                    temperature_180m: forecastData.hourly.temperature_180m[index],
                    weather_code: forecastData.hourly.weather_code[index],
                    pressure_msl: forecastData.hourly.pressure_msl[index],
                    surface_pressure: forecastData.hourly.surface_pressure[index],
                    cloud_cover: forecastData.hourly.cloud_cover[index],
                    cloud_cover_mid: forecastData.hourly.cloud_cover_mid[index],
                    cloud_cover_low: forecastData.hourly.cloud_cover_low[index],
                    cloud_cover_high: forecastData.hourly.cloud_cover_high[index],
                    visibility: forecastData.hourly.visibility[index],
                    evapotranspiration: forecastData.hourly.evapotranspiration[index],
                    et0_fao_evapotranspiration: forecastData.hourly.et0_fao_evapotranspiration[index],
                    vapour_pressure_deficit: forecastData.hourly.vapour_pressure_deficit[index],
                    soil_temperature_0cm: forecastData.hourly.soil_temperature_0cm[index],
                    soil_temperature_6cm: forecastData.hourly.soil_temperature_6cm[index],
                    soil_temperature_18cm: forecastData.hourly.soil_temperature_18cm[index],
                    soil_temperature_54cm: forecastData.hourly.soil_temperature_54cm[index],
                    soil_moisture_0_to_1cm: forecastData.hourly.soil_moisture_0_to_1cm[index],
                    soil_moisture_1_to_3cm: forecastData.hourly.soil_moisture_1_to_3cm[index],
                    soil_moisture_3_to_9cm: forecastData.hourly.soil_moisture_3_to_9cm[index],
                    soil_moisture_9_to_27cm: forecastData.hourly.soil_moisture_9_to_27cm[index],
                    soil_moisture_27_to_81cm: forecastData.hourly.soil_moisture_27_to_81cm[index],
                    uv_index: forecastData.hourly.uv_index[index],
                    uv_index_clear_sky: forecastData.hourly.uv_index_clear_sky[index],
                    total_column_integrated_water_vapour: forecastData.hourly.total_column_integrated_water_vapour[index],
                    cape: forecastData.hourly.cape[index],
                    lifted_index: forecastData.hourly.lifted_index[index],
                }));

                // Create past week data array
                logger.debug(`Processing ${pastWeekData.hourly.time.length} hourly past week data points`);
                const past_week = pastWeekData.hourly.time.map((time: string, index: number) => ({
                    datetime: time,
                    temperature_2m: pastWeekData.hourly.temperature_2m[index],
                    relative_humidity_2m: pastWeekData.hourly.relative_humidity_2m[index],
                    dew_point_2m: pastWeekData.hourly.dew_point_2m[index],
                    apparent_temperature: pastWeekData.hourly.apparent_temperature[index],
                    precipitation_probability: pastWeekData.hourly.precipitation_probability[index],
                    precipitation: pastWeekData.hourly.precipitation[index],
                    showers: pastWeekData.hourly.showers[index],
                    rain: pastWeekData.hourly.rain[index],
                    wind_speed_80m: pastWeekData.hourly.wind_speed_80m[index],
                    wind_speed_10m: pastWeekData.hourly.wind_speed_10m[index],
                    wind_speed_180m: pastWeekData.hourly.wind_speed_180m[index],
                    wind_speed_120m: pastWeekData.hourly.wind_speed_120m[index],
                    wind_direction_10m: pastWeekData.hourly.wind_direction_10m[index],
                    wind_direction_80m: pastWeekData.hourly.wind_direction_80m[index],
                    wind_direction_120m: pastWeekData.hourly.wind_direction_120m[index],
                    wind_direction_180m: pastWeekData.hourly.wind_direction_180m[index],
                    wind_gusts_10m: pastWeekData.hourly.wind_gusts_10m[index],
                    temperature_80m: pastWeekData.hourly.temperature_80m[index],
                    temperature_120m: pastWeekData.hourly.temperature_120m[index],
                    temperature_180m: pastWeekData.hourly.temperature_180m[index],
                    weather_code: pastWeekData.hourly.weather_code[index],
                    pressure_msl: pastWeekData.hourly.pressure_msl[index],
                    surface_pressure: pastWeekData.hourly.surface_pressure[index],
                    cloud_cover: pastWeekData.hourly.cloud_cover[index],
                    cloud_cover_mid: pastWeekData.hourly.cloud_cover_mid[index],
                    cloud_cover_low: pastWeekData.hourly.cloud_cover_low[index],
                    cloud_cover_high: pastWeekData.hourly.cloud_cover_high[index],
                    visibility: pastWeekData.hourly.visibility[index],
                    evapotranspiration: pastWeekData.hourly.evapotranspiration[index],
                    et0_fao_evapotranspiration: pastWeekData.hourly.et0_fao_evapotranspiration[index],
                    vapour_pressure_deficit: pastWeekData.hourly.vapour_pressure_deficit[index],
                    soil_temperature_0cm: pastWeekData.hourly.soil_temperature_0cm[index],
                    soil_temperature_6cm: pastWeekData.hourly.soil_temperature_6cm[index],
                    soil_temperature_18cm: pastWeekData.hourly.soil_temperature_18cm[index],
                    soil_temperature_54cm: pastWeekData.hourly.soil_temperature_54cm[index],
                    soil_moisture_0_to_1cm: pastWeekData.hourly.soil_moisture_0_to_1cm[index],
                    soil_moisture_1_to_3cm: pastWeekData.hourly.soil_moisture_1_to_3cm[index],
                    soil_moisture_3_to_9cm: pastWeekData.hourly.soil_moisture_3_to_9cm[index],
                    soil_moisture_9_to_27cm: pastWeekData.hourly.soil_moisture_9_to_27cm[index],
                    soil_moisture_27_to_81cm: pastWeekData.hourly.soil_moisture_27_to_81cm[index],
                    uv_index: pastWeekData.hourly.uv_index[index],
                    uv_index_clear_sky: pastWeekData.hourly.uv_index_clear_sky[index],
                    total_column_integrated_water_vapour: pastWeekData.hourly.total_column_integrated_water_vapour[index],
                    cape: pastWeekData.hourly.cape[index],
                    lifted_index: pastWeekData.hourly.lifted_index[index],
                }));

                // Check if a snapshot already exists for this date and location
                logger.info(`Checking for existing snapshot for location ${locationId} on ${snapshot_date}`);
                const existingSnapshot = await DailySnapshotModel.findOne({
                    snapshot_date,
                    location_id: locationId
                });

                if (existingSnapshot) {
                    // Update existing snapshot
                    logger.info(`Updating existing snapshot for location ${locationId} on ${snapshot_date}`);
                    await DailySnapshotModel.updateOne(
                        {snapshot_date, location_id: locationId},
                        {
                            future_forecast,
                            past_week_data: past_week,
                            created_at: new Date()
                        }
                    );
                    results.push({
                        location_id: locationId,
                        status: 'updated',
                        message: `Snapshot updated for location ${location.locationName} on ${snapshot_date}`
                    });
                    logger.info(`Successfully updated snapshot for location ${location.locationName} on ${snapshot_date}`);
                } else {
                    // Create new snapshot
                    logger.info(`Creating new snapshot for location ${locationId} on ${snapshot_date}`);
                    const newSnapshot = new DailySnapshotModel({
                        snapshot_date,
                        location_id: locationId,
                        future_forecast,
                        past_week,
                        created_at: new Date()
                    });

                    await newSnapshot.save();
                    results.push({
                        location_id: locationId,
                        status: 'created',
                        message: `Snapshot created for location ${location.locationName} on ${snapshot_date}`
                    });
                    logger.info(`Successfully created snapshot for location ${location.locationName} on ${snapshot_date}`);
                }
            } catch (error: any) {
                logger.error(`Error processing location ${location.locationName} on ${snapshot_date}: ${error.message}`);
                if (error.response) {
                    logger.error(`API response error - Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
                }
                logger.error(`Stack trace: ${error.stack}`);
                results.push({
                    location_id: locationId,
                    status: 'error',
                    message: `Failed to create snapshot for location ${location.locationName} on ${snapshot_date}`
                });
            }
        }

        logger.info(`Completed weather forecast operation. Results: ${results.length} locations processed`);
        res.status(200).json({
            success: true,
            date: snapshot_date,
            results
        });
    } catch (error: any) {
        logger.error(`Fatal error in fetchAndStoreWeatherForecasts: ${error.message}`);
        logger.error(`Stack trace: ${error.stack}`);
        res.status(500).json({
            success: false,
            message: `Failed to create and store snapshots`,
            error: error.message
        });
    }
};

/**
 * Get weather forecasts for a specific location
 */
export const getWeatherForecast = async (req: Request, res: Response): Promise<void> => {
    const locationId = req.params.locationId;
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    
    logger.info(`Retrieving weather forecast for location ${locationId} on date ${date}`);
    
    try {
        const snapshot = await DailySnapshotModel.findOne({
            snapshot_date: date,
            location_id: parseInt(locationId)
        });

        if (!snapshot) {
            logger.warn(`No forecast found for location ${locationId} on date ${date}`);
            res.status(404).json({
                success: false,
                message: `No forecast found for location ${locationId} on date ${date}`
            });
            return; // Add return to prevent further execution
        }

        logger.info(`Successfully retrieved forecast for location ${locationId} on date ${date}`);
        res.status(200).json({
            success: true,
            data: snapshot
        });
    } catch (error: any) {
        logger.error(`Error retrieving weather forecast for location ${locationId} on date ${date}: ${error.message}`);
        logger.error(`Stack trace: ${error.stack}`);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve weather forecast',
            error: error.message
        });
    }
}; 