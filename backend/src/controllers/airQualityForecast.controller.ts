import {Request, Response} from "express";
import logger from "../utils/logger";
import { runForecastingModel, processForecasts } from "../services/forecastingModelService";
import { 
    getForecastRecords, 
    getLatestForecastsForAllLocations, 
    getForecastForLocationAndDate,
    cleanupOldForecasts,
    ForecastQueryParams 
} from "../services/airQualityForecastService";

/**
 * Controller method to run the air quality forecasting model and process the results
 */
export const runAirQualityForecastingModel = async (req: Request, res: Response): Promise<void> => {
    try {
        logger.info(`Starting air quality forecast fetch and store operation`);

        // Run the forecasting model to get predictions
        const forecastRecords = await runForecastingModel();

        // Await forecast processing (this includes storing forecasts and sending alerts)
        await processForecasts(forecastRecords);
        logger.info('Forecast processing and storage complete');

        // Return success response with forecast data
        res.status(200).json({
            success: true,
            message: 'Air quality forecast complete',
            forecast: forecastRecords
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error in runAirQualityForecastingModel: ${errorMessage}`);

        res.status(500).json({
            success: false,
            message: 'Failed to generate air quality forecast',
            error: errorMessage
        });
    }
};

/**
 * Controller method to get forecast records with optional filtering
 */
export const getForecastHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { location, startDate, endDate, limit } = req.query;
        
        const params: ForecastQueryParams = {};
        
        if (location) {
            const locationNum = parseInt(location as string);
            if (isNaN(locationNum)) {
                res.status(400).json({
                    success: false,
                    message: 'Location must be a valid number'
                });
                return;
            }
            params.location = locationNum;
        }
        
        if (startDate) {
            params.startDate = new Date(startDate as string);
            if (isNaN(params.startDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'Start date must be a valid date'
                });
                return;
            }
        }
        
        if (endDate) {
            params.endDate = new Date(endDate as string);
            if (isNaN(params.endDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'End date must be a valid date'
                });
                return;
            }
        }
        
        if (limit) {
            const limitNum = parseInt(limit as string);
            if (isNaN(limitNum) || limitNum <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Limit must be a positive number'
                });
                return;
            }
            params.limit = limitNum;
        }

        const forecasts = await getForecastRecords(params);

        res.status(200).json({
            success: true,
            message: 'Forecast history retrieved successfully',
            data: forecasts,
            count: forecasts.length
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error in getForecastHistory: ${errorMessage}`);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve forecast history',
            error: errorMessage
        });
    }
};

/**
 * Controller method to get the latest forecast for all locations
 */
export const getLatestForecasts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { locations } = req.query;
        
        let locationArray: number[] | undefined;
        
        if (locations) {
            try {
                locationArray = (locations as string).split(',').map(loc => {
                    const num = parseInt(loc.trim());
                    if (isNaN(num)) {
                        throw new Error(`Invalid location: ${loc}`);
                    }
                    return num;
                });
            } catch (parseError) {
                res.status(400).json({
                    success: false,
                    message: 'Locations must be comma-separated numbers'
                });
                return;
            }
        }

        const latestForecasts = await getLatestForecastsForAllLocations(locationArray);

        res.status(200).json({
            success: true,
            message: 'Latest forecasts retrieved successfully',
            data: latestForecasts,
            count: latestForecasts.length
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error in getLatestForecasts: ${errorMessage}`);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve latest forecasts',
            error: errorMessage
        });
    }
};

/**
 * Controller method to get forecast for a specific location and date
 */
export const getForecastForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { location, date } = req.params;
        
        const locationNum = parseInt(location);
        if (isNaN(locationNum)) {
            res.status(400).json({
                success: false,
                message: 'Location must be a valid number'
            });
            return;
        }
        
        const forecastDate = new Date(date);
        if (isNaN(forecastDate.getTime())) {
            res.status(400).json({
                success: false,
                message: 'Date must be a valid date (YYYY-MM-DD format)'
            });
            return;
        }

        const forecast = await getForecastForLocationAndDate(locationNum, forecastDate);

        if (!forecast) {
            res.status(404).json({
                success: false,
                message: `No forecast found for location ${locationNum} on ${date}`
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Forecast retrieved successfully',
            data: forecast
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error in getForecastForLocation: ${errorMessage}`);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve forecast',
            error: errorMessage
        });
    }
};

/**
 * Controller method to clean up old forecast records
 */
export const cleanupOldForecastRecords = async (req: Request, res: Response): Promise<void> => {
    try {
        const { daysToKeep } = req.query;
        
        let days = 30; // Default to 30 days
        if (daysToKeep) {
            const daysNum = parseInt(daysToKeep as string);
            if (isNaN(daysNum) || daysNum <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Days to keep must be a positive number'
                });
                return;
            }
            days = daysNum;
        }

        const deletedCount = await cleanupOldForecasts(days);

        res.status(200).json({
            success: true,
            message: `Cleanup completed successfully`,
            data: {
                deletedCount,
                daysKept: days
            }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error in cleanupOldForecastRecords: ${errorMessage}`);

        res.status(500).json({
            success: false,
            message: 'Failed to cleanup old forecast records',
            error: errorMessage
        });
    }
};
