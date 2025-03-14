# EPA Monitors Data Generation Script

This script generates dummy data for the EPA monitors collection, dating back 2 years from the current date.

## Features

- Generates data for multiple monitoring locations
- Creates hourly readings for each day
- Spans 2 years of historical data
- Generates realistic random values for all required fields
- Inserts data in batches to optimize performance

## Usage

To run the script, make sure you have set up your MongoDB connection in your `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/your_database_name
```

Then run the script using:

```bash
npm run generate-epa-data
```

## Data Structure

The script generates data with the following structure:

- **id**: Unique identifier for each record
- **location**: Monitoring station location ID
- **datatime**: Date in YYYY-MM-DD format
- **report_date**: Date in YYYY-MM-DD format
- **report_time**: Time in HH:MM:SS format
- **Air Quality Fields**: Random values for o3_ppb, co_ppm, so2_ppb, etc.
- **Weather Fields**: Random values for temperature, humidity, wind_speed_m_s, etc.
- **AQI Values**: Random values for PM2_5_AQI, PM10_AQI, etc.

## Customization

You can modify the script to:

- Change the number of locations by editing the `locations` array
- Adjust the number of entries per day by changing the `entriesPerDay` variable
- Modify the ranges for random values in the `generateRandomData` function
- Change the starting ID by updating the `startId` variable 