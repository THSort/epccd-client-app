import express from "express";
import { getCurrentEpaMonitorsDataForLocation, getHistoricalPollutantData } from "../controllers/epaMonitorsData.controller";

const router = express.Router();

// The more specific routes should come first
// router.get("/epaMonitorsData/summary/:location", getPollutantSummaryForLocation);
router.get("/epaMonitorsData/historical/:location", getHistoricalPollutantData);
router.get("/epaMonitorsData/:location", getCurrentEpaMonitorsDataForLocation);

export default router;
