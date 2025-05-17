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

## Weather Forecast Cron Job

A script to fetch weather forecasts for all locations on a daily basis.

### Automatic Setup with PM2

The cron job is automatically configured in the `ecosystem.config.js` file to run at 3:00 PM every day.

When you deploy the application using PM2:

```bash
pm2 start ecosystem.config.js
```

The cron job will be automatically scheduled.

### Manual Setup with System Cron

If you prefer to use the system's crontab instead of PM2's built-in scheduler:

1. Open the crontab editor:

```bash
crontab -e
```

2. Add the following line to run the script at 3:00 PM daily:

```
0 15 * * * cd /path/to/your/backend && node dist/scripts/weatherForecastCron.js >> /path/to/your/backend/logs/cron.log 2>&1
```

Replace `/path/to/your/backend` with the actual path to your backend directory.

### Running Manually

You can also run the script manually:

```bash
cd /path/to/your/backend
node dist/scripts/weatherForecastCron.js
```

Or during development:

```bash
npx ts-node src/scripts/weatherForecastCron.ts
```

This will immediately trigger the weather forecast data collection for all configured locations. 