import express from "express";
import { getCurrentEpaMonitorsDataForLocation, getHistoricalPollutantsDataForAllTimePeriods, getHistoricalPollutantsDataForSpecificTimePeriod } from "../controllers/epaMonitorsData.controller";

const router = express.Router();

// The more specific routes should come first
// router.get("/epaMonitorsData/summary/:location", getPollutantSummaryForLocation);
router.get("/epaMonitorsData/historical/:location/:timePeriod", getHistoricalPollutantsDataForSpecificTimePeriod);
router.get("/epaMonitorsData/historical/:location", getHistoricalPollutantsDataForAllTimePeriods);
router.get("/epaMonitorsData/:location", getCurrentEpaMonitorsDataForLocation);

export default router;
