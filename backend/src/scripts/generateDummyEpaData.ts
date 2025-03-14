import mongoose from 'mongoose';
import EpaMonitorsDataModel from '../models/epaMonitorsData.model';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/epa_data');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate random number within a range
const getRandomNumber = (min: number, max: number): number => {
  return +(Math.random() * (max - min) + min).toFixed(3);
};

// Generate random data for a specific date and time
const generateRandomData = (date: Date, location: number, id: number) => {
  // Format date and time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  const report_date = `${year}-${month}-${day}`;
  const report_time = `${hours}:${minutes}:${seconds}`;
  const datatime = report_date;

  // Generate random values for each field
  return {
    id,
    location,
    datatime,
    report_date,
    report_time,
    
    // Air Quality Fields - random values within realistic ranges
    o3_ppb: getRandomNumber(0, 100),
    co_ppm: getRandomNumber(0, 10),
    so2_ppb: getRandomNumber(0, 100),
    no_ppb: getRandomNumber(0, 100),
    no2_ppb: getRandomNumber(0, 100),
    nox_ppb: getRandomNumber(0, 200),
    pm10_ug_m3: getRandomNumber(0, 500),
    pm2_5_ug_m3: getRandomNumber(0, 300),
    
    // Weather Fields
    temperature: getRandomNumber(0, 40),
    humidity: getRandomNumber(0, 100),
    atmospheric_pressure_kpa: getRandomNumber(95, 105),
    wind_speed_m_s: getRandomNumber(0, 20),
    wind_direction: getRandomNumber(0, 360),
    rainfall_mm: getRandomNumber(0, 50),
    total_solar_radiation_w_m2: getRandomNumber(0, 1000),
    
    // AQI Values
    PM2_5_AQI: getRandomNumber(0, 300),
    PM10_AQI: getRandomNumber(0, 300),
    SO2_AQI: getRandomNumber(0, 100),
    NO2_AQI: getRandomNumber(0, 100),
    O3_AQI: getRandomNumber(0, 200),
    CO_AQI: getRandomNumber(0, 200)
  };
};

// Generate data for the past 2 years with multiple entries per day
export const generateHistoricalData = async () => {
  const locations = [1, 2, 3]; // Sample location IDs
  const entriesPerDay = 24; // One entry per hour
  const startId = 620000; // Starting ID
  
  // Calculate dates
  const endDate = new Date(); // Today
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 2); // 2 years ago
  
  console.log(`Generating data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
  let currentDate = new Date(startDate);
  let idCounter = startId;
  let batchData = [];
  let totalDocuments = 0;
  
  // Loop through each day
  while (currentDate <= endDate) {
    // For each location
    for (const location of locations) {
      // Generate multiple entries per day
      for (let hour = 0; hour < entriesPerDay; hour++) {
        const entryDate = new Date(currentDate);
        entryDate.setHours(hour, Math.floor(Math.random() * 60), 0);
        
        const data = generateRandomData(entryDate, location, idCounter++);
        batchData.push(data);
        
        // Insert in batches of 1000 to avoid memory issues
        if (batchData.length >= 1000) {
          await EpaMonitorsDataModel.insertMany(batchData);
          totalDocuments += batchData.length;
          console.log(`Inserted ${totalDocuments} documents so far...`);
          batchData = [];
        }
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Insert any remaining documents
  if (batchData.length > 0) {
    await EpaMonitorsDataModel.insertMany(batchData);
    totalDocuments += batchData.length;
  }
  
  console.log(`Data generation complete. Total documents inserted: ${totalDocuments}`);
};