import {Request, Response} from "express";
import {fetchCurrentEpaMonitorsDataForLocation, getAllPollutantHistoricalData} from "../services/epaMonitorsData.service";
import logger from "../utils/logger";

const getCurrentEpaMonitorsDataForLocation = async (req: Request, res: Response): Promise<void> => {
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

const getHistoricalPollutantData = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);
        const currentDateTime = new Date();

        const historicalData = await getAllPollutantHistoricalData(location, currentDateTime);

        res.json(historicalData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching historical pollutant data for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching historical pollutant data for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch historical pollutant data"});
    }
};

export {
    getCurrentEpaMonitorsDataForLocation,
    getHistoricalPollutantData,
};
