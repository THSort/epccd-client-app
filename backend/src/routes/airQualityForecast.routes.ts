import express from "express";
import {runAirQualityForecastingModel} from "../controllers/airQualityForecast.controller";


const router = express.Router();

// Route to fetch air quality forecasts for all locations and store in database
router.get("/run", runAirQualityForecastingModel);

export default router;