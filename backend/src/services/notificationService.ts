import admin from "firebase-admin";
import User from '../models/user.model';
import logger from "../utils/logger";
import { EpaMonitorsData } from "../types/epaMonitorsData.types";

// Initialize Firebase Admin if not already initialized
let fireBaseMessaging: admin.messaging.Messaging;
try {
  if (!admin.apps.length) {
    const serviceAccount = require("../../firebase-service-account-key.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  fireBaseMessaging = admin.messaging();
} catch (error) {
  logger.error(`Error initializing Firebase Admin: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
}

// Function to send notifications with improved error handling
export const sendNotifications = async (tokens: string[], message: string, title: string = 'Air Quality Alert') => {
  if (!tokens.length) {
    logger.info('No tokens provided for notifications');
    return;
  }

  logger.info(`Attempting to send notifications to ${tokens.length} devices`);
  
  const messages = tokens.map(token => ({
    notification: {
      title: title,
      body: message,
    },
    token: token,
  }));

  // Track successful and failed notifications
  const results = {
    successful: 0,
    failed: 0,
    failedTokens: [] as string[],
    errors: [] as string[]
  };

  // Send notifications individually to track which ones succeed and which fail
  for (let i = 0; i < messages.length; i++) {
    try {
      await fireBaseMessaging.send(messages[i]);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.failedTokens.push(messages[i].token);
      results.errors.push(error instanceof Error ? error.message : JSON.stringify(error));
      logger.error(`Failed to send notification to token ${messages[i].token}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  }

  // Log summary of results
  logger.info(`Notification results: ${results.successful} successful, ${results.failed} failed`);
  
  if (results.failed > 0) {
    logger.error(`Failed to send notifications to the following tokens: ${results.failedTokens.join(', ')}`);
  }
};

// Function to fetch users from the database
export const fetchUsersFromDatabase = async () => {
  try {
    // Query the database for all users with their FCM tokens and locations
    const users = await User.find({}, 'fcmToken location');

    logger.info(`Retrieved ${users.length} users from database`);

    // Transform the Mongoose documents to plain objects
    return users.map(user => ({
      fcmToken: user.fcmToken,
      location: user.location
    }));
  } catch (error) {
    logger.error(`Error fetching users from database: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    return []; // Return empty array in case of error
  }
};

// Function to send notifications to users in the specified alert locations
// This function assumes that the locations passed in have already been determined to need alerts
export const alertUsersInLocations = async (locationsData: EpaMonitorsData[]) => {
  if (!locationsData.length) {
    logger.info('No locations to alert');
    return;
  }

  try {
    // Fetch all users
    const users = await fetchUsersFromDatabase();
    
    // Get unique locations to alert
    const alertLocations = locationsData.map(data => data.location);
    logger.info(`Sending notifications to users in locations: ${alertLocations.join(', ')}`);
    
    // Filter users based on alert locations
    const usersInAlertLocations = users.filter(user => alertLocations.includes(user.location));

    if (usersInAlertLocations.length > 0) {
      logger.info(`Found ${usersInAlertLocations.length} users in affected locations`);
      
      // Extract FCM tokens from users in alert locations and filter out any null/undefined tokens
      const tokens = usersInAlertLocations
        .map(user => user.fcmToken)
        .filter(token => token && token.trim() !== '');
      
      logger.info(`Found ${tokens.length} valid FCM tokens out of ${usersInAlertLocations.length} users`);
      
      if (tokens.length === 0) {
        logger.warn('No valid FCM tokens found for users in alert locations');
        return;
      }
      
      // Create a detailed alert message
      let alertMessage = 'Air quality alert: Potential health risk detected in your area.';
      
      // Check which parameters might be concerning across all locations
      const highAQIParameters = new Set<string>();
      
      for (const data of locationsData) {
        if (data.PM2_5_AQI > 100) highAQIParameters.add('PM2.5');
        if (data.PM10_AQI > 100) highAQIParameters.add('PM10');
        if (data.O3_AQI > 100) highAQIParameters.add('Ozone');
        if (data.NO2_AQI > 100) highAQIParameters.add('NO2');
        if (data.SO2_AQI > 100) highAQIParameters.add('SO2');
        if (data.CO_AQI > 100) highAQIParameters.add('CO');
      }
      
      if (highAQIParameters.size > 0) {
        alertMessage += ` Elevated levels of: ${Array.from(highAQIParameters).join(', ')}.`;
      }
      
      alertMessage += ' Take necessary precautions.';
      
      // Send notifications to users in alert locations
      await sendNotifications(tokens, alertMessage);
    } else {
      logger.info('No users found in alert locations');
    }
  } catch (error) {
    logger.error(`Error in alertUsersInLocations: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
}; 