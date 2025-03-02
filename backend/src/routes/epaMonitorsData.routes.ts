import express from "express";
import { getEpaMonitorsDataForLocation } from "../controllers/epaMonitorsData.controller.";

const router = express.Router();

router.get("/epaMonitorsData/:location", getEpaMonitorsDataForLocation);

export default router;
