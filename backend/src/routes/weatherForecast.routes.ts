import express from "express";
import {fetchAndStoreWeatherForecasts, getWeatherForecast} from "../controllers/weatherForecast.controller";

const router = express.Router();

// Route to fetch weather forecasts for all locations and store in database
router.get("/fetch-and-store", fetchAndStoreWeatherForecasts);

// Route to get weather forecast for a specific location
router.get("/:locationId", getWeatherForecast);

export default router; 