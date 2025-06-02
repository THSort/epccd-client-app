import express from "express";
import {
    checkAppVersion,
    getLatestVersion
} from "../controllers/version.controller";

const router = express.Router();

// POST /api/version/check - Check if app version is latest
router.post("/check", checkAppVersion);

// GET /api/version/latest - Get latest version info
router.get("/latest", getLatestVersion);

export default router; 