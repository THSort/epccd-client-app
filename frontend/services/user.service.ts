import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = 'http://13.61.251.147/api';
// const API_BASE_URL = 'http://10.0.2.2:3000/api';

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
    console.log('Attempting to register user with:', {
      url: `${API_BASE_URL}/users/register`,
      fcmToken,
      location,
      mobile_number,
    });

    const response = await axios.post(`${API_BASE_URL}/users/register`, {
      fcmToken,
      location,
      mobile_number,
    });

    console.log('Registration response:', response.data);
    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Registration error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
    } else {
      console.error('Non-Axios error during registration:', error);
    }
    throw error;
  }
};

/**
 * Submit demographic survey information
 * @param id_user - User ID
 * @param asthma - Whether the user has asthma
 * @param language_preference - User's preferred language
 * @returns The submitted survey data
 */
export const submitDemographicSurvey = async (
  id_user: string,
  asthma?: boolean,
  language_preference?: string
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/demographics`, {
      id_user,
      asthma,
      language_preference,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting demographic survey:', error);
    throw error;
  }
};

/**
 * Update the user's language preference
 * @param id_user - User ID
 * @param language_preference - The preferred language
 * @returns The updated survey data
 */
export const updateLanguagePreference = async (
  id_user: string,
  language_preference: string
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/demographics/language`, {
      id_user,
      language_preference,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating language preference:', error);
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
