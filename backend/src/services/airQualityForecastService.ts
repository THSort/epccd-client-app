import AirQualityForecast from "../models/airQualityForecast.model";
import logger from "../utils/logger";

/**
 * Interface for storing forecast data
 */
export interface ForecastRecord {
    location: number;
    forecast_date: Date;
    PM2_5_AQI_forecast: number;
    PM10_AQI_forecast?: number;
    SO2_AQI_forecast?: number;
    NO2_AQI_forecast?: number;
    O3_AQI_forecast?: number;
    CO_AQI_forecast?: number;
}

/**
 * Interface for forecast query parameters
 */
export interface ForecastQueryParams {
    location?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
}

/**
 * Stores forecast records in the database
 * @param forecasts Array of forecast records to store
 * @returns Promise with the saved forecast records
 */
export const storeForecastRecords = async (forecasts: ForecastRecord[]): Promise<any[]> => {
    try {
        logger.info(`Storing ${forecasts.length} forecast records to database`);
        
        const savePromises = forecasts.map(async (forecast) => {
            try {
                // Use upsert to replace existing forecast for same location and date
                const result = await AirQualityForecast.findOneAndUpdate(
                    { 
                        location: forecast.location, 
                        forecast_date: forecast.forecast_date 
                    },
                    {
                        ...forecast,
                        created_at: new Date()
                    },
                    { 
                        upsert: true, 
                        new: true, 
                        runValidators: true 
                    }
                );
                
                logger.info(`✅ Stored forecast for location ${forecast.location} on ${forecast.forecast_date.toISOString().split('T')[0]}`);
                return result;
            } catch (error) {
                logger.error(`❌ Failed to store forecast for location ${forecast.location}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                throw error;
            }
        });
        
        const savedForecasts = await Promise.all(savePromises);
        logger.info(`✅ Successfully stored ${savedForecasts.length} forecast records`);
        
        return savedForecasts;
    } catch (error) {
        logger.error(`❌ Error storing forecast records: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};

/**
 * Retrieves forecast records from the database
 * @param params Query parameters for filtering forecasts
 * @returns Promise with the forecast records
 */
export const getForecastRecords = async (params: ForecastQueryParams = {}): Promise<any[]> => {
    try {
        const { location, startDate, endDate, limit = 100 } = params;
        
        // Build query object
        const query: any = {};
        
        if (location) {
            query.location = location;
        }
        
        if (startDate || endDate) {
            query.forecast_date = {};
            if (startDate) {
                query.forecast_date.$gte = startDate;
            }
            if (endDate) {
                query.forecast_date.$lte = endDate;
            }
        }
        
        logger.info(`Fetching forecasts with query: ${JSON.stringify(query)}`);
        
        const forecasts = await AirQualityForecast.find(query)
            .sort({ forecast_date: -1, location: 1 })
            .limit(limit)
            .lean();
        
        logger.info(`✅ Retrieved ${forecasts.length} forecast records`);
        return forecasts;
    } catch (error) {
        logger.error(`❌ Error retrieving forecast records: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};

/**
 * Gets the latest forecast for each location
 * @param locations Optional array of location IDs to filter by
 * @returns Promise with the latest forecast for each location
 */
export const getLatestForecastsForAllLocations = async (locations?: number[]): Promise<any[]> => {
    try {
        const matchStage: any = {};
        
        if (locations && locations.length > 0) {
            matchStage.location = { $in: locations };
        }
        
        const pipeline: any[] = [];
        
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        
        pipeline.push(
            { $sort: { location: 1, forecast_date: -1 } },
            {
                $group: {
                    _id: "$location",
                    latestForecast: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$latestForecast" } },
            { $sort: { location: 1 } }
        );
        
        const latestForecasts = await AirQualityForecast.aggregate(pipeline);
        
        logger.info(`✅ Retrieved latest forecasts for ${latestForecasts.length} locations`);
        return latestForecasts;
    } catch (error) {
        logger.error(`❌ Error retrieving latest forecasts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};

/**
 * Gets forecast for a specific location and date
 * @param location Location ID
 * @param date Forecast date
 * @returns Promise with the forecast record or null if not found
 */
export const getForecastForLocationAndDate = async (location: number, date: Date): Promise<any | null> => {
    try {
        const forecast = await AirQualityForecast.findOne({
            location,
            forecast_date: {
                $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
            }
        }).lean();
        
        if (forecast) {
            logger.info(`✅ Retrieved forecast for location ${location} on ${date.toISOString().split('T')[0]}`);
        } else {
            logger.info(`No forecast found for location ${location} on ${date.toISOString().split('T')[0]}`);
        }
        
        return forecast;
    } catch (error) {
        logger.error(`❌ Error retrieving forecast for location ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};

/**
 * Deletes old forecast records to prevent database bloat
 * @param daysToKeep Number of days of forecasts to keep (default: 30)
 * @returns Promise with the number of deleted records
 */
export const cleanupOldForecasts = async (daysToKeep: number = 30): Promise<number> => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const result = await AirQualityForecast.deleteMany({
            forecast_date: { $lt: cutoffDate }
        });
        
        logger.info(`✅ Cleaned up ${result.deletedCount} old forecast records (older than ${daysToKeep} days)`);
        return result.deletedCount;
    } catch (error) {
        logger.error(`❌ Error cleaning up old forecasts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};

/**
 * Marks forecasts as having alerts sent
 * @param location Location ID
 * @param date Forecast date
 * @returns Promise with the updated forecast record
 */
export const markAlertsAsSent = async (location: number, date: Date): Promise<any | null> => {
    try {
        const updatedForecast = await AirQualityForecast.findOneAndUpdate(
            {
                location,
                forecast_date: {
                    $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                }
            },
            {
                alerts_sent: true
            },
            {
                new: true
            }
        );
        
        if (updatedForecast) {
            logger.info(`✅ Marked alerts as sent for location ${location} on ${date.toISOString().split('T')[0]}`);
        }
        
        return updatedForecast;
    } catch (error) {
        logger.error(`❌ Error marking alerts as sent for location ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
}; 