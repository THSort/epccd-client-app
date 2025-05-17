import {Request, Response} from "express";
import axios from "axios";
import DailySnapshotModel from "../models/dailySnapshot.model";

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
const OPEN_METEO_API_URL = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_PARAMS = 'hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,showers,rain,snowfall,snow_depth,wind_speed_80m,wind_speed_10m,wind_speed_180m,wind_speed_120m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_mid,cloud_cover_low,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm,uv_index,uv_index_clear_sky,total_column_integrated_water_vapour,cape,lifted_index&timezone=auto&forecast_days=3';

/**
 * Fetch weather forecasts for all locations and store in database
 */
export const fetchAndStoreWeatherForecasts = async (req: Request, res: Response): Promise<void> => {
    console.log('fetchAndStoreWeatherForecasts');

    try {
        // Get current date in YYYY-MM-DD format
        const today = new Date();
        const snapshot_date = today.toISOString().split('T')[0];

        // Array to store results for response
        const results = [];

        // Process each location
        for (const location of locations) {
            const locationId = parseInt(location.locationCode);

            try {
                // Construct API URL with location coordinates
                const apiUrl = `${OPEN_METEO_API_URL}?latitude=${location.latitude}&longitude=${location.longitude}&${FORECAST_PARAMS}`;

                console.log(apiUrl);

                // Fetch data from Open Meteo API
                const response = await axios.get(apiUrl);
                const data = response.data;

                // Extract hourly data
                const {hourly, hourly_units} = data;

                // Create forecast array
                const future_forecast = hourly.time.map((time: string, index: number) => ({
                    datetime: time,
                    temperature_2m: hourly.temperature_2m[index],
                    relative_humidity_2m: hourly.relative_humidity_2m[index],
                    dew_point_2m: hourly.dew_point_2m[index],
                    apparent_temperature: hourly.apparent_temperature[index],
                    precipitation_probability: hourly.precipitation_probability[index],
                    precipitation: hourly.precipitation[index],
                    showers: hourly.showers[index],
                    rain: hourly.rain[index],
                    wind_speed_80m: hourly.wind_speed_80m[index],
                    wind_speed_10m: hourly.wind_speed_10m[index],
                    wind_speed_180m: hourly.wind_speed_180m[index],
                    wind_speed_120m: hourly.wind_speed_120m[index],
                    wind_direction_10m: hourly.wind_direction_10m[index],
                    wind_direction_80m: hourly.wind_direction_80m[index],
                    wind_direction_120m: hourly.wind_direction_120m[index],
                    wind_direction_180m: hourly.wind_direction_180m[index],
                    wind_gusts_10m: hourly.wind_gusts_10m[index],
                    temperature_80m: hourly.temperature_80m[index],
                    temperature_120m: hourly.temperature_120m[index],
                    temperature_180m: hourly.temperature_180m[index],
                    weather_code: hourly.weather_code[index],
                    pressure_msl: hourly.pressure_msl[index],
                    surface_pressure: hourly.surface_pressure[index],
                    cloud_cover: hourly.cloud_cover[index],
                    cloud_cover_mid: hourly.cloud_cover_mid[index],
                    cloud_cover_low: hourly.cloud_cover_low[index],
                    cloud_cover_high: hourly.cloud_cover_high[index],
                    visibility: hourly.visibility[index],
                    evapotranspiration: hourly.evapotranspiration[index],
                    et0_fao_evapotranspiration: hourly.et0_fao_evapotranspiration[index],
                    vapour_pressure_deficit: hourly.vapour_pressure_deficit[index],
                    soil_temperature_0cm: hourly.soil_temperature_0cm[index],
                    soil_temperature_6cm: hourly.soil_temperature_6cm[index],
                    soil_temperature_18cm: hourly.soil_temperature_18cm[index],
                    soil_temperature_54cm: hourly.soil_temperature_54cm[index],
                    soil_moisture_0_to_1cm: hourly.soil_moisture_0_to_1cm[index],
                    soil_moisture_1_to_3cm: hourly.soil_moisture_1_to_3cm[index],
                    soil_moisture_3_to_9cm: hourly.soil_moisture_3_to_9cm[index],
                    soil_moisture_9_to_27cm: hourly.soil_moisture_9_to_27cm[index],
                    soil_moisture_27_to_81cm: hourly.soil_moisture_27_to_81cm[index],
                    uv_index: hourly.uv_index[index],
                    uv_index_clear_sky: hourly.uv_index_clear_sky[index],
                    total_column_integrated_water_vapour: hourly.total_column_integrated_water_vapour[index],
                    cape: hourly.cape[index],
                    lifted_index: hourly.lifted_index[index],
                }));

                // Check if a snapshot already exists for this date and location
                const existingSnapshot = await DailySnapshotModel.findOne({
                    snapshot_date,
                    location_id: locationId
                });

                if (existingSnapshot) {
                    // Update existing snapshot
                    await DailySnapshotModel.updateOne(
                        {snapshot_date, location_id: locationId},
                        {
                            future_forecast,
                            created_at: new Date()
                        }
                    );
                    results.push({
                        location_id: locationId,
                        status: 'updated',
                        message: `Forecast updated for location ${location.locationName}`
                    });
                } else {
                    // Create new snapshot
                    const newSnapshot = new DailySnapshotModel({
                        snapshot_date,
                        location_id: locationId,
                        future_forecast,
                        created_at: new Date()
                    });

                    await newSnapshot.save();
                    results.push({
                        location_id: locationId,
                        status: 'created',
                        message: `Forecast created for location ${location.locationName}`
                    });
                }
            } catch (error: any) {
                console.error(`Error fetching data for location ${location.locationName}:`, error.message);
                results.push({
                    location_id: locationId,
                    status: 'error',
                    message: `Failed to fetch/store forecast for location ${location.locationName}`
                });
            }
        }

        res.status(200).json({
            success: true,
            date: snapshot_date,
            results
        });
    } catch (error: any) {
        console.error('Error in fetchAndStoreWeatherForecasts:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch and store weather forecasts',
            error: error.message
        });
    }
};

/**
 * Get weather forecasts for a specific location
 */
export const getWeatherForecast = async (req: Request, res: Response): Promise<void> => {
    try {
        const {locationId} = req.params;
        const date = req.query.date as string || new Date().toISOString().split('T')[0];

        const snapshot = await DailySnapshotModel.findOne({
            snapshot_date: date,
            location_id: parseInt(locationId)
        });

        if (!snapshot) {
            res.status(404).json({
                success: false,
                message: `No forecast found for location ${locationId} on date ${date}`
            });
        }

        res.status(200).json({
            success: true,
            data: snapshot
        });
    } catch (error: any) {
        console.error('Error in getWeatherForecast:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve weather forecast',
            error: error.message
        });
    }
}; 