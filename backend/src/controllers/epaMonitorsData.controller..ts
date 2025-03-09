import {Request, Response} from "express";
import {fetchCurrentEpaMonitorsDataForLocation, fetchHistoricalEpaMonitorsDataForLocation, fetchHistoricalEpaMonitorsDataByPeriods} from "../services/epaMonitorsData.service";
import logger from "../utils/logger";

export const getCurrentEpaMonitorsDataForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);

        const aqmsData = await fetchCurrentEpaMonitorsDataForLocation(location);

        res.json(aqmsData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching EPA Monitors data for location ${req.query.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching EPA Monitors data for location ${req.query.location}`);
        }
        res.status(500).json({message: "Failed to fetch EPA Monitors data"});
    }
};

export const getHistoricalEpaMonitorsDataForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);
        const currentDate = new Date().toISOString().split('T')[0];
        
        const historicalData = await fetchHistoricalEpaMonitorsDataByPeriods(location, currentDate);
        
        res.json(historicalData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching historical EPA Monitors data for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching historical EPA Monitors data for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch historical EPA Monitors data"});
    }
};
