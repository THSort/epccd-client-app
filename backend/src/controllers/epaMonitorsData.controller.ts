import {Request, Response} from "express";
import {
    fetchCurrentEpaMonitorsDataForLocation,
    getAllPollutantHistoricalData,
    getPollutantHistoryDataForPast24Hours,
    getPollutantHistoryDataForPastWeek,
    getPollutantHistoryDataForPastMonth,
    getPollutantHistoryDataForPastThreeMonths,
    getPollutantHistoryDataForPastSixMonths,
    getPollutantHistoryDataForPastYear
} from "../services/epaMonitorsData.service";
import logger from "../utils/logger";
import {PollutantBucketData} from "../types/epaMonitorsData.types";
import {TimeRange} from "../types/timeRange.types";

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

const getHistoricalPollutantsDataForAllTimePeriods = async (req: Request, res: Response): Promise<void> => {
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

const getHistoricalPollutantsDataForSpecificTimePeriod = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);
        const timePeriod = req.params.timePeriod as TimeRange;
        const currentDateTime = new Date();

        // Get the appropriate data based on time period
        let data: PollutantBucketData[] = [];
        switch (timePeriod) {
            case '1d':
                data = await getPollutantHistoryDataForPast24Hours(location, currentDateTime);
                break;
            case "1w":
                data = await getPollutantHistoryDataForPastWeek(location, currentDateTime);
                break;
            case "1m":
                data = await getPollutantHistoryDataForPastMonth(location, currentDateTime);
                break;
            case "3m":
                data = await getPollutantHistoryDataForPastThreeMonths(location, currentDateTime);
                break;
            case "6m":
                data = await getPollutantHistoryDataForPastSixMonths(location, currentDateTime);
                break;
            case "1y":
                data = await getPollutantHistoryDataForPastYear(location, currentDateTime);
                break;
        }

        res.json(data);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching pollutant data for time period for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching pollutant data for time period for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch pollutant data for the specified time period"});
    }
};

export {
    getCurrentEpaMonitorsDataForLocation,
    getHistoricalPollutantsDataForAllTimePeriods,
    getHistoricalPollutantsDataForSpecificTimePeriod,
};
