import axios from 'axios';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Base URL for API requests
const API_BASE_URL = 'http://10.0.2.2:5000/api/user-activity'; // Change this to your actual backend URL

// Queue to store activities when offline
let activityQueue: any[] = [];
let isProcessingQueue = false;

/**
 * Get device information
 * @returns Object containing device platform, OS version, and app version
 */
const getDeviceInfo = async () => {
  try {
    return {
      platform: Platform.OS,
      os_version: Platform.Version.toString(),
      app_version: await DeviceInfo.getVersion(),
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      platform: Platform.OS,
      os_version: 'unknown',
      app_version: 'unknown',
    };
  }
};

/**
 * Process the queue of activities that couldn't be sent while offline
 * @param userId - The user ID
 */
const processQueue = async (userId: string) => {
  if (isProcessingQueue || activityQueue.length === 0) {return;}

  isProcessingQueue = true;

  try {
    // Process each item in the queue
    while (activityQueue.length > 0) {
      const activity = activityQueue[0];

      await axios.post(API_BASE_URL, {
        ...activity,
        user_id: userId,
      });

      // Remove the processed item
      activityQueue.shift();
    }
  } catch (error) {
    console.error('Error processing activity queue:', error);
  } finally {
    isProcessingQueue = false;
  }
};

/**
 * Track a user activity
 * @param userId - The user ID
 * @param actionType - Type of action (e.g., 'button_click', 'navigation', 'input')
 * @param actionDetails - Details about the action
 */
export const trackUserActivity = async (
  userId: string,
  actionType: string,
  actionDetails: Record<string, any>
) => {
  try {
    const deviceInfo = await getDeviceInfo();

    const activityData = {
      user_id: userId,
      action_type: actionType,
      action_details: actionDetails,
      device_info: deviceInfo,
    };

    // Try to send the activity to the server
    await axios.post(API_BASE_URL, activityData);

    // If successful and we have queued items, process them
    if (activityQueue.length > 0) {
      processQueue(userId);
    }
  } catch (error) {
    console.error('Error tracking user activity:', error);

    // If there was an error (likely offline), queue the activity
    activityQueue.push({
      action_type: actionType,
      action_details: actionDetails,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track a screen view
 * @param userId - The user ID
 * @param screenName - Name of the screen being viewed
 * @param additionalDetails - Any additional details to track
 */
export const trackScreenView = async (
  userId: string,
  screenName: string,
  additionalDetails: Record<string, any> = {}
) => {
  await trackUserActivity(userId, 'screen_view', {
    screen_name: screenName,
    ...additionalDetails,
  });
};

/**
 * Track a button click
 * @param userId - The user ID
 * @param buttonName - Name of the button clicked
 * @param screenName - Name of the screen containing the button
 * @param additionalDetails - Any additional details to track
 */
export const trackButtonClick = async (
  userId: string,
  buttonName: string,
  screenName: string,
  additionalDetails: Record<string, any> = {}
) => {
  await trackUserActivity(userId, 'button_click', {
    button_name: buttonName,
    screen_name: screenName,
    ...additionalDetails,
  });
};

/**
 * Track user input
 * @param userId - The user ID
 * @param inputName - Name of the input field
 * @param screenName - Name of the screen containing the input
 * @param additionalDetails - Any additional details to track
 */
export const trackUserInput = async (
  userId: string,
  inputName: string,
  screenName: string,
  additionalDetails: Record<string, any> = {}
) => {
  await trackUserActivity(userId, 'user_input', {
    input_name: inputName,
    screen_name: screenName,
    ...additionalDetails,
  });
};

/**
 * Track app state change (e.g., app going to background or foreground)
 * @param userId - The user ID
 * @param appState - The new app state ('active', 'background', 'inactive')
 */
export const trackAppStateChange = async (
  userId: string,
  appState: string
) => {
  await trackUserActivity(userId, 'app_state_change', {
    app_state: appState,
  });
};

/**
 * Track app exit (when app goes to background or becomes inactive)
 * @param userId - The user ID
 * @param screenName - Name of the current screen when app was exited
 * @param additionalDetails - Any additional details to track
 */
export const trackAppExit = async (
  userId: string,
  screenName: string,
  additionalDetails: Record<string, any> = {}
) => {
  await trackUserActivity(userId, 'app_exit', {
    screen_name: screenName,
    timestamp: new Date().toISOString(),
    ...additionalDetails,
  });
};

/**
 * Track app entry (when app comes to foreground)
 * @param userId - The user ID
 * @param screenName - Name of the current screen when app was entered
 * @param additionalDetails - Any additional details to track
 */
export const trackAppEntry = async (
  userId: string,
  screenName: string,
  additionalDetails: Record<string, any> = {}
) => {
  await trackUserActivity(userId, 'app_entry', {
    screen_name: screenName,
    timestamp: new Date().toISOString(),
    ...additionalDetails,
  });
};

/**
 * Track back button press
 * @param userId - The user ID
 * @param screenName - Name of the current screen
 */
export const trackBackButtonPress = async (
  userId: string,
  screenName: string
) => {
  await trackUserActivity(userId, 'back_button_press', {
    screen_name: screenName,
  });
};
