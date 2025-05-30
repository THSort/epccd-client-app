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

        // Await forecast processing
        await processForecasts(forecastRecords);
        logger.info('Alert processing complete');

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
