# Air Quality Data Processing & Forecasting: How It Works

This document explains in simple terms how our system collects air quality data from EPA monitors and uses it to generate daily air pollution forecasts.

## The Big Picture

Our system works like a pipeline with three main stages:
1. **Data Collection** - Gathering fresh air quality readings every 5 minutes
2. **Data Storage** - Saving all this information in our database
3. **Daily Forecasting** - Using all the collected data to predict tomorrow's air quality

---

## Stage 1: Continuous Data Collection (Every 5 Minutes)

### What Happens:
Every 5 minutes, our server automatically reaches out to the EPA air quality monitoring stations to check if there's any new data available.

### Technical Details:
- **Location**: This happens in `index.ts` when the server starts up
- **Frequency**: Every 5 minutes (300,000 milliseconds)
- **Monitoring Stations**: We collect data from 5 different locations in Lahore
- **Data Points**: Each reading includes:
  - Air pollutant levels (PM2.5, PM10, CO, SO2, NO2, O3)
  - Weather conditions (temperature, humidity, wind speed, rainfall, etc.)
  - Air Quality Index (AQI) values for each pollutant

### What Gets Stored:
If new data is found at any monitoring station, it gets saved to our MongoDB database in the `epa_monitors_data` collection. Each record includes timestamps so we know exactly when each reading was taken.

---

## Stage 2: Data Storage & Organization

### Database Structure:
All the collected data is stored in a structured way in our database. Think of it like a giant spreadsheet where:
- Each row represents one air quality reading from one location at one specific time
- Columns include all the measurements (pollutant levels, weather data, AQI values)
- The data is indexed by location and date/time for fast retrieval

### Data Accumulation:
Over time, this creates a rich historical dataset showing:
- How air quality changes throughout each day
- Seasonal patterns and trends
- Relationships between weather conditions and pollution levels
- Patterns specific to each monitoring location

### Where Data is Stored:
- **Database**: MongoDB collection called `epa_monitors_data`
- **Location**: Server's database (can be local or cloud-hosted)
- **Format**: Each record contains all measurements with precise timestamps
- **Retention**: All historical data is kept indefinitely for better predictions

## Stage 3: Daily Forecasting Process

### What is a "Cron Job"?
A cron job is like setting an alarm clock for your computer. Just like you might set an alarm to wake up at the same time every day, a cron job tells the computer to automatically run a specific task at scheduled times. In our case, we have two "alarm clocks" set:

1. **Weather Forecast Cron**: Runs daily at **3:00 PM Pakistan Time** (10:00 AM UTC)
2. **Air Quality Forecast Cron**: Runs daily at **4:00 PM Pakistan Time** (11:00 AM UTC) - one hour after the weather forecast

### The Forecasting Process:

#### Step 1: Data Preparation
When the air quality forecast cron job runs, it:
1. **Retrieves ALL historical data** from the database (all air quality readings ever collected)
2. **Exports this data to a CSV file** that the forecasting model can read
3. **Includes the following information for each reading**:
   - Location ID
   - Date and time of measurement
   - All pollutant concentrations (O3, CO, SO2, NO2, PM2.5, PM10)
   - Weather conditions (temperature, humidity, pressure, wind, rainfall, solar radiation)
   - AQI values for each pollutant

#### Step 2: Data Processing (Inside forecasting_model.R)

#### Step 3: Generating Tomorrow's Forecast

### Where Forecasts are Stored:
- **Temporary Files**: CSV files created during processing (input.csv, output.csv)
- **File Location**: Server's temporary directory (`/tmp` folder)
- **Processing**: Results are processed in memory and used immediately
- **User Notifications**: Sent via push notification service, not permanently stored
- **Cleanup**: Temporary files are automatically deleted after processing

#### Step 4: User Notifications
After generating forecasts, the system:
1. Checks if any forecasts exceed users' alert thresholds
2. Sends push notifications to users these users in the user's preferred language (English or Urdu)

---

## Data Flow Summary

```
EPA Monitors → Server (every 5 min) → Database → Daily Cron Job → R Script → Forecasts → User Alerts
```

1. **EPA monitoring stations** continuously measure air quality
2. **Our server** checks for new data every 5 minutes
3. **New readings** are stored in the database with timestamps
4. **Daily at 4 PM**, a scheduled job collects ALL historical data
5. **R forecasting script** processes this data and generates tomorrow's predictions
6. **Users receive alerts** if tomorrow's forecast exceeds their threshold

---

## Key Technical Components

- **`index.ts`**: Sets up the 5-minute data polling when server starts
- **`epaMonitorsData.service.ts`**: Handles fetching and storing EPA data
- **`airQualityForecastCron.ts`**: The daily scheduled job that triggers forecasting
- **`forecasting_model.R`**: The machine learning script that generates predictions
- **Database**: MongoDB collection storing all historical readings
- **Cron Schedule**: Automated daily execution at 4:00 PM Pakistan Time

---
