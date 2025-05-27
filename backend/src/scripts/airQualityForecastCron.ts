import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

/**
 * Script to run the air quality forecasting model and send alerts to users
 * This is designed to run 1 hour after the weather forecast cron job
 * Can be run as a standalone script or via PM2 cron
 */

async function runAirQualityForecast() {
  logger.info('Starting scheduled air quality forecast model execution');
  
  try {
    // Get API URL from environment or use default
    const API_URL = process.env.API_URL || 'http://localhost:3000';
    
    // Call the air quality forecast endpoint
    const response = await axios.get(`${API_URL}/api/air-quality/forecasts/run`);
    
    logger.info(`Air quality forecast cron completed successfully: ${response.data.forecast.length} forecast records generated`);
    
    return { success: true, data: response.data };
  } catch (error: any) {
    logger.error(`Air quality forecast cron job failed: ${error.message}`);
    if (error.response) {
      logger.error(`API response error - Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    }
    logger.error(`Stack trace: ${error.stack}`);
    
    return { success: false, error: error.message };
  }
}

// Execute if run directly (node airQualityForecastCron.js)
if (require.main === module) {
  runAirQualityForecast()
    .then((result) => {
      if (result.success) {
        logger.info('Air quality forecast cron job executed successfully');
        process.exit(0);
      } else {
        logger.error('Air quality forecast cron job failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error(`Unhandled error in air quality forecast cron: ${error.message}`);
      process.exit(1);
    });
}

export default runAirQualityForecast;