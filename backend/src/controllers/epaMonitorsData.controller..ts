import {Request, Response} from "express";
import {fetchEpaMonitorsDataForLocation} from "../services/epaMonitorsData.service";
import logger from "../utils/logger";

export const getEpaMonitorsDataForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);

        const aqmsData = await fetchEpaMonitorsDataForLocation(location);

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
