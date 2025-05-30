import mongoose from "mongoose";

const airQualityForecastSchema = new mongoose.Schema({
    location: {
        type: Number, 
        required: true, 
        index: true,
        min: 1,
        max: 21 // Based on the existing location range
    },
    forecast_date: {
        type: Date, 
        required: true, 
        index: true
    },
    
    // Forecast AQI Values for each pollutant
    PM2_5_AQI_forecast: {
        type: Number, 
        required: true,
        min: 0
    },
    PM10_AQI_forecast: {
        type: Number, 
        default: 0,
        min: 0
    },
    SO2_AQI_forecast: {
        type: Number, 
        default: 0,
        min: 0
    },
    NO2_AQI_forecast: {
        type: Number, 
        default: 0,
        min: 0
    },
    O3_AQI_forecast: {
        type: Number, 
        default: 0,
        min: 0
    },
    CO_AQI_forecast: {
        type: Number, 
        default: 0,
        min: 0
    },
    
    // Metadata
    model_version: {
        type: String,
        default: "202500508" // Based on the R script version
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    
    // Whether alerts were sent for this forecast
    alerts_sent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: 'air_quality_forecasts' // Explicitly set collection name
});

// Create compound index for location and forecast_date for fast lookups
// Also ensure uniqueness - one forecast per location per date
airQualityForecastSchema.index(
    { location: 1, forecast_date: 1 }, 
    { unique: true }
);

// Index for querying recent forecasts
airQualityForecastSchema.index({ forecast_date: -1 });

// Index for location-based queries
airQualityForecastSchema.index({ location: 1, forecast_date: -1 });

const AirQualityForecast = mongoose.model("AirQualityForecast", airQualityForecastSchema, 'air_quality_forecasts');

export default AirQualityForecast; 