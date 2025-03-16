import express from "express";
import { getCurrentEpaMonitorsDataForLocation, getPollutantSummaryForLocation, getHistoricalEpaMonitorsDataForLocation } from "../controllers/epaMonitorsData.controller";

const router = express.Router();

// The more specific routes should come first
router.get("/epaMonitorsData/summary/:location", getPollutantSummaryForLocation);
router.get("/epaMonitorsData/historical/:location", getHistoricalEpaMonitorsDataForLocation);
router.get("/epaMonitorsData/:location", getCurrentEpaMonitorsDataForLocation);

export default router;
