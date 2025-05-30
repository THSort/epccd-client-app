import express from "express";
import {
    runAirQualityForecastingModel,
    getForecastHistory,
    getLatestForecasts,
    getForecastForLocation,
    cleanupOldForecastRecords
} from "../controllers/airQualityForecast.controller";

const router = express.Router();

// Route to run the forecasting model and store results in database
router.get("/run", runAirQualityForecastingModel);

// Route to get forecast history with optional filtering
router.get("/history", getForecastHistory);

// Route to get latest forecasts for all or specific locations
router.get("/latest", getLatestForecasts);

// Route to get forecast for specific location and date
router.get("/:location/:date", getForecastForLocation);

// Route to cleanup old forecast records
router.delete("/cleanup", cleanupOldForecastRecords);

export default router;