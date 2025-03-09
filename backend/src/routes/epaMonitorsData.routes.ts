import express from "express";
import { getCurrentEpaMonitorsDataForLocation, getHistoricalEpaMonitorsDataForLocation } from "../controllers/epaMonitorsData.controller.";

const router = express.Router();

// The more specific route should come first
router.get("/epaMonitorsData/historical/:location", getHistoricalEpaMonitorsDataForLocation);
router.get("/epaMonitorsData/:location", getCurrentEpaMonitorsDataForLocation);

export default router;
