import {Request, Response} from "express";
import logger from "../utils/logger";
import { runForecastingModel, processForecasts } from "../services/forecastingModelService";

/**
 * Controller method to run the air quality forecasting model and process the results
 */
export const runAirQualityForecastingModel = async (req: Request, res: Response): Promise<void> => {
    try {
        logger.info(`Starting air quality forecast fetch and store operation`);
        
        // Run the forecasting model to get predictions
        const forecastRecords = await runForecastingModel();
        
        // Process forecasts and send alerts to relevant users
        processForecasts(forecastRecords)
            .then(() => {
                logger.info('Alert processing complete');
            })
            .catch(alertErr => {
                logger.error(`Error processing alerts: ${alertErr instanceof Error ? alertErr.message : 'Unknown error'}`);
            });
        
        // Return success response with forecast data
        res.status(200).json({
            success: true,
            message: 'Air quality forecast complete',
            forecast: forecastRecords
        });
    } catch (error) {
        // Handle any errors from the forecasting service
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error in runAirQualityForecastingModel: ${errorMessage}`);
        
        res.status(500).json({
            success: false,
            message: 'Failed to generate air quality forecast',
            error: errorMessage
        });
    }
};