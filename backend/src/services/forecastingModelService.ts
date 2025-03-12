import {ForecastingModelParams} from "../types/forecastingModelParams";
import User from '../models/user.model'; // Import the User model
import admin from "firebase-admin";

var serviceAccount = require("../../firebase-service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const fireBaseMessaging = admin.messaging();


// Function to send notifications
export const sendNotifications = async (tokens: string[], message: string) => {
  const messages = tokens.map(token => ({
    notification: {
      title: 'Alert',
      body: message,
    },
    token: token,
  }));

  try {
    const response = await Promise.all(messages.map(msg => fireBaseMessaging.send(msg)));
    console.log(response.length + ' messages were sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Example usage
// const tokens = ['token1', 'token2'];
// sendNotifications(tokens, 'This is a test notification.');

export const shouldAlertUsersInLocation = (location: number, params: ForecastingModelParams): boolean => {
    return Math.random() < 0.5; // 50% chance of returning true
};

// Function to fetch FCM tokens and send notifications to users in alert locations
export const alertUsersInLocations = async (params: ForecastingModelParams) => {
  // Fetch FCM tokens and location data from the database
  const users = await fetchUsersFromDatabase();

  // Filter users based on alert locations
  const alertUsers = users.filter(user => shouldAlertUsersInLocation(user.location, params));

  if (alertUsers.length > 0) {
    console.log(`Sending alerts to ${alertUsers.length} users in affected locations`);
    
    // Extract FCM tokens from alert users
    const tokens = alertUsers.map(user => user.fcmToken);
    
    // Create a more detailed alert message based on air quality parameters
    let alertMessage = 'Air quality alert: Potential health risk detected in your area.';
    
    // Check which parameters might be concerning and add them to the message
    const highAQIParameters = [];
    
    if (params.PM2_5_AQI > 100) highAQIParameters.push('PM2.5');
    if (params.PM10_AQI > 100) highAQIParameters.push('PM10');
    if (params.O3_AQI > 100) highAQIParameters.push('Ozone');
    if (params.NO2_AQI > 100) highAQIParameters.push('NO2');
    if (params.SO2_AQI > 100) highAQIParameters.push('SO2');
    if (params.CO_AQI > 100) highAQIParameters.push('CO');
    
    if (highAQIParameters.length > 0) {
      alertMessage += ` Elevated levels of: ${highAQIParameters.join(', ')}.`;
    }
    
    alertMessage += ' Take necessary precautions.';
    
    // Send notifications to users in alert locations
    await sendNotifications(tokens, alertMessage);
  } else {
    console.log('No users in alert locations found');
  }
};

// Function to fetch users from the database
const fetchUsersFromDatabase = async () => {
  try {
    // Query the database for all users with their FCM tokens and locations
    const users = await User.find({}, 'fcmToken location');

    console.log(`Retrieved ${users.length} users from database`);

    // Transform the Mongoose documents to plain objects
    return users.map(user => ({
      fcmToken: user.fcmToken,
      location: user.location
    }));
  } catch (error) {
    console.error('Error fetching users from database:', error);
    return []; // Return empty array in case of error
  }
};
