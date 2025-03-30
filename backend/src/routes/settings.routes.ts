import express from "express";
import {
    updateUserLocation,
    updateUserAlertsThreshold,
    updateUserLanguage
} from "../controllers/settings.controller";

const router = express.Router();

// Settings routes
router.put("/location", updateUserLocation);
router.put("/alerts-threshold", updateUserAlertsThreshold);
router.put("/language", updateUserLanguage);

export default router; 