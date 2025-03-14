import {Request, Response} from "express";
import {fetchCurrentEpaMonitorsDataForLocation, fetchHistoricalEpaMonitorsDataForLocation, fetchHistoricalEpaMonitorsDataByPeriods} from "../services/epaMonitorsData.service";
import logger from "../utils/logger";
import {EpaMonitorsData, PollutantChartData, FilteredHistoricalDataResponse} from "../types/epaMonitorsData.types";

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
        
        // Filter the data to include only the required fields
        const filteredData: FilteredHistoricalDataResponse = {
            oneDay: filterPollutantData(historicalData.oneDay),
            oneWeek: filterPollutantData(historicalData.oneWeek),
            oneMonth: filterPollutantData(historicalData.oneMonth),
            threeMonths: filterPollutantData(historicalData.threeMonths),
            sixMonths: filterPollutantData(historicalData.sixMonths),
            oneYear: filterPollutantData(historicalData.oneYear)
        };
        
        res.json(filteredData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching historical EPA Monitors data for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching historical EPA Monitors data for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch historical EPA Monitors data"});
    }
};

// Helper function to filter only the required fields for the chart
const filterPollutantData = (data: EpaMonitorsData[]): PollutantChartData[] => {
    return data.map(item => ({
        // Date and time fields
        report_date: item.report_date,
        report_time: item.report_time,
        
        // Pollutant concentration fields
        o3_ppb: item.o3_ppb,
        co_ppm: item.co_ppm,
        so2_ppb: item.so2_ppb,
        no_ppb: item.no_ppb,
        no2_ppb: item.no2_ppb,
        nox_ppb: item.nox_ppb,
        pm10_ug_m3: item.pm10_ug_m3,
        pm2_5_ug_m3: item.pm2_5_ug_m3,
        
        // AQI values
        PM2_5_AQI: item.PM2_5_AQI,
        PM10_AQI: item.PM10_AQI,
        SO2_AQI: item.SO2_AQI,
        NO2_AQI: item.NO2_AQI,
        O3_AQI: item.O3_AQI,
        CO_AQI: item.CO_AQI
    }));
};
