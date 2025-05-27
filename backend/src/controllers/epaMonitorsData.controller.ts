import {Request, Response} from "express";
import {
    getLatestEpaMonitorsDataFromDB,
    getAllPollutantHistoricalData,
    getPollutantHistoryDataForPast24Hours,
    getPollutantHistoryDataForPastWeek,
    getPollutantHistoryDataForPastMonth,
    getPollutantHistoryDataForPastThreeMonths,
    getPollutantHistoryDataForPastSixMonths,
    getPollutantHistoryDataForPastYear,
    getPollutantSummaryForLocation as getPollutantSummaryService,
    getLahoreLocationsAqiData
} from "../services/epaMonitorsData.service";
import logger from "../utils/logger";
import {PollutantBucketData} from "../types/epaMonitorsData.types";
import {TimeRange} from "../types/timeRange.types";

const getCurrentEpaMonitorsDataForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);

        // Service now handles caching
        const aqmsData = await getLatestEpaMonitorsDataFromDB(location);

        res.json(aqmsData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching EPA Monitors data for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching EPA Monitors data for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch EPA Monitors data"});
    }
};

const getHistoricalPollutantsDataForAllTimePeriods = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);
        const currentDateTime = new Date();

        // Service now handles caching
        const historicalData = await getAllPollutantHistoricalData(location, currentDateTime);

        // Get the latest updated time for this location
        const latestData = await getLatestEpaMonitorsDataFromDB(location);
        
        // Create response with data and latest updated time
        const response = {
            ...historicalData,
            latest_updated_time: latestData.report_date_time.toISOString()
        };

        res.json(response);
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
        // I have done sudo timedatectl set-timezone Asia/Karachi on the deployment server so no need to convert to PK time here

        // Each service function now handles its own caching
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

        // Get the latest updated time for this location
        const latestData = await getLatestEpaMonitorsDataFromDB(location);
        
        // Create response with data and latest updated time
        const response = {
            data: data,
            latest_updated_time: latestData.report_date_time.toISOString()
        };

        res.json(response);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching pollutant data for time period for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching pollutant data for time period for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch pollutant data for the specified time period"});
    }
};

const getPollutantSummaryForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);

        // Service now handles caching
        const summaryData = await getPollutantSummaryService(location);

        res.json(summaryData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching pollutant summary data for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching pollutant summary data for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch pollutant summary data"});
    }
};

const getLahoreLocationsAqi = async (_req: Request, res: Response): Promise<void> => {
    try {
        // Get AQI data for all Lahore locations
        const locationsAqiData = await getLahoreLocationsAqiData();

        res.json(locationsAqiData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching AQI data for Lahore locations: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching AQI data for Lahore locations`);
        }
        res.status(500).json({message: "Failed to fetch AQI data for Lahore locations"});
    }
};

export {
    getCurrentEpaMonitorsDataForLocation,
    getHistoricalPollutantsDataForAllTimePeriods,
    getHistoricalPollutantsDataForSpecificTimePeriod,
    getPollutantSummaryForLocation,
    getLahoreLocationsAqi
};
