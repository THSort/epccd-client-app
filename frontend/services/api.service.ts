import axios from 'axios';
import {Location} from '../App.types';
import {EpaMonitorsApiResponse, FilteredHistoricalDataResponse, PollutantSummaryResponse, PollutantChartData} from '../types/epaMonitorsApiResponse.types';
import {TimeRange} from '../screens/air-quality-history/components/time-range-selector/time-range-selector.types.ts';

// Base URL for API requests
const API_BASE_URL = 'http://13.61.251.147/api/epa-monitors';

/**
 * Interface for Lahore location AQI data
 */
export interface LahoreLocationAqiData {
    locationCode: string;
    aqi: number;
}

/**
 * Fetches AQI data for all Lahore locations
 * @returns Array of location objects with AQI values
 */
export const fetchLahoreLocationsAqi = async (): Promise<LahoreLocationAqiData[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/epaMonitorsData/lahoreLocationsAqi`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Lahore locations AQI data:', error);
        throw error;
    }
};

/**
 * Fetches EPA Monitors data for a specific location
 * @param location - The location object to fetch data for
 * @returns The EPA Monitors data including PM2.5 AQI
 */
export const fetchEpaMonitorsData = async (location: Location): Promise<EpaMonitorsApiResponse> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/epaMonitorsData/${location.locationCode}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching EPA Monitors data:', error);
        throw error;
    }
};

/**
 * Fetches historical EPA Monitors data for a specific location over the past year
 * @param location - The location object to fetch historical data for
 * @returns Object containing filtered EPA Monitors data for different time periods with only pollutant data
 */
export const fetchHistoricalEpaMonitorsData = async (location: Location): Promise<FilteredHistoricalDataResponse> => {
    try {
        const url = `${API_BASE_URL}/epaMonitorsData/historical/${location.locationCode}`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching historical EPA Monitors data:', error);
        throw error;
    }
};

/**
 * Fetches pollutant-specific data for a selected time period
 * @param location - The location object to fetch data for
 * @param timePeriod - The time period to fetch data for ("oneday", "oneweek", etc.)
 * @param pollutant - The pollutant to fetch data for ("o3", "co", "so2", etc.)
 * @returns Array of data points with timeRange, concentration, and aqi values
 */
export const fetchPollutantDataForTimePeriod = async (location: Location, timePeriod: TimeRange): Promise<Record<string, PollutantChartData>> => {
    try {
        const url = `${API_BASE_URL}/epaMonitorsData/historical/${location.locationCode}/${timePeriod}`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching pollutant data for time period:', error);
        throw error;
    }
};

/**
 * Fetches pollutant summary data (current, 24h avg, weekly avg) for a specific location
 * @param location - The location object to fetch summary data for
 * @returns Object containing current values, 24-hour averages, and weekly averages for all pollutants
 */
export const fetchPollutantSummary = async (location: Location): Promise<PollutantSummaryResponse> => {
    try {
        const url = `${API_BASE_URL}/epaMonitorsData/summary/${location.locationCode}`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching pollutant summary data:', error);
        throw error;
    }
};
