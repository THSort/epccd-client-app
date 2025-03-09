import express from "express";
import { getCurrentEpaMonitorsDataForLocation } from "../controllers/epaMonitorsData.controller.";

const router = express.Router();

router.get("/epaMonitorsData/:location", getCurrentEpaMonitorsDataForLocation);

export default router;
