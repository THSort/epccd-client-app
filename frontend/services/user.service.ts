import axios from 'axios';
import { Location } from '../App.types';

// Base URL for API requests
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Same base URL as other services

/**
 * Register a new user
 * @param fcmToken - Firebase Cloud Messaging token for push notifications
 * @param location - The selected location
 * @param mobile_number - Optional mobile number
 * @returns The registered user data including the user ID
 */
export const registerUser = async (
  fcmToken: string,
  location: string,
  mobile_number?: string
): Promise<{ id_user: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, {
      fcmToken,
      location,
      mobile_number,
    });
    return response.data.user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Submit demographic survey information
 * @param id_user - User ID
 * @param asthma - Whether the user has asthma
 * @returns The submitted survey data
 */
export const submitDemographicSurvey = async (
  id_user: string,
  asthma?: boolean
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/demographics`, {
      id_user,
      asthma,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting demographic survey:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param id_user - User ID
 * @returns The user data
 */
export const getUserById = async (id_user: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${id_user}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
