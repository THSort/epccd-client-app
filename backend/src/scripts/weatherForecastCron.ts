import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

/**
 * Script to fetch weather forecasts for all locations
 * This can be run as a standalone script or via PM2 cron
 */

async function fetchWeatherForecasts() {
  logger.info('Starting scheduled weather forecast data collection');
  
  try {
    // Get API URL from environment or use default
    const API_URL = process.env.API_URL || 'http://localhost:3000';
    
    // Call the fetchAndStoreWeatherForecasts endpoint
    const response = await axios.get(`${API_URL}/api/weather-forecasts/fetch-and-store`);
    
    logger.info(`Weather forecast cron completed successfully: ${response.data.results.length} locations processed`);
    logger.info(`Results: ${JSON.stringify(response.data.results)}`);
    
    return { success: true, data: response.data };
  } catch (error: any) {
    logger.error(`Weather forecast cron job failed: ${error.message}`);
    if (error.response) {
      logger.error(`API response error - Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    }
    logger.error(`Stack trace: ${error.stack}`);
    
    return { success: false, error: error.message };
  }
}

// Execute if run directly (node weatherForecastCron.js)
if (require.main === module) {
  fetchWeatherForecasts()
    .then((result) => {
      if (result.success) {
        logger.info('Weather forecast cron job executed successfully');
        process.exit(0);
      } else {
        logger.error('Weather forecast cron job failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error(`Unhandled error in weather forecast cron: ${error.message}`);
      process.exit(1);
    });
}

export default fetchWeatherForecasts; 