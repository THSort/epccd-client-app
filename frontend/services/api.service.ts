import axios from 'axios';
import {Location} from '../App.types';
import {EpaMonitorsApiResponse, FilteredHistoricalDataResponse, PollutantSummaryResponse, PollutantChartData} from '../types/epaMonitorsApiResponse.types';
import {TimeRange} from '../screens/air-quality-history/components/time-range-selector/time-range-selector.types.ts';

// Base URL for API requests
const API_BASE_URL = 'http://13.61.251.147/api';
// const API_BASE_URL = 'http://10.0.2.2:3000/api';

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
        const response = await axios.get(`${API_BASE_URL}/epa-monitors/epaMonitorsData/lahoreLocationsAqi`);
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
        const response = await axios.get(`${API_BASE_URL}/epa-monitors/epaMonitorsData/${location.locationCode}`);
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
        const url = `${API_BASE_URL}/epa-monitors/epaMonitorsData/historical/${location.locationCode}`;

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
        const url = `${API_BASE_URL}/epa-monitors/epaMonitorsData/historical/${location.locationCode}/${timePeriod}`;

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
        const url = `${API_BASE_URL}/epa-monitors/epaMonitorsData/summary/${location.locationCode}`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching pollutant summary data:', error);
        throw error;
    }
};

/**
 * Updates user's location preference
 * @param userId - The user ID
 * @param location - The location ID (1-21)
 * @returns Response from the server
 */
export const updateUserLocation = async (userId: string, location: number): Promise<any> => {
    try {
        const url = `${API_BASE_URL}/settings/location`;
        const response = await axios.put(url, {
            id_user: userId,
            location,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user location:', error);
        throw error;
    }
};

/**
 * Updates user's alerts threshold preference
 * @param userId - The user ID
 * @param alertsThreshold - The AQI threshold for alerts
 * @returns Response from the server
 */
export const updateUserAlertsThreshold = async (userId: string, alertsThreshold: string): Promise<any> => {
    try {
        const url = `${API_BASE_URL}/settings/alerts-threshold`;
        const response = await axios.put(url, {
            id_user: userId,
            alerts_threshold: alertsThreshold,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user alerts threshold:', error);
        throw error;
    }
};

/**
 * Updates user's language preference
 * @param userId - The user ID
 * @param language - The language preference ('Eng' or 'اردو')
 * @returns Response from the server
 */
export const updateUserLanguagePreference = async (userId: string, language: string): Promise<any> => {
    try {
        const url = `${API_BASE_URL}/settings/language`;
        const response = await axios.put(url, {
            id_user: userId,
            language_preference: language,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user language preference:', error);
        throw error;
    }
};
