import axios from 'axios';
import { Location } from '../App.types';
import {EpaMonitorsApiResponse} from '../types/epaMonitorsApiResponse.types.ts';

// Base URL for API requests
const API_BASE_URL = 'http://10.0.2.2:5000/api/epa-monitors'; // Change this to your actual backend URL

/**
 * Fetches EPA Monitors data for a specific location
 * @param location - The location object to fetch data for
 * @returns The EPA Monitors data including PM2.5 AQI
 */
export const fetchEpaMonitorsData = async (location: Location): Promise<EpaMonitorsApiResponse> => {
  try {
    console.log(`${API_BASE_URL}/epaMonitorsData/${location.locationCode}`);

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
 * @returns Array of EPA Monitors data for the past year
 */
export const fetchHistoricalEpaMonitorsData = async (location: Location): Promise<EpaMonitorsApiResponse[]> => {
  try {
    const url = `${API_BASE_URL}/epaMonitorsData/historical/${location.locationCode}`;

    console.log(`Fetching historical data from: ${url}`);

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching historical EPA Monitors data:', error);
    throw error;
  }
};
