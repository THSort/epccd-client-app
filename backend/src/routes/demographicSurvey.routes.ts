import express from "express";
import {submitDemographicSurvey, getSurveyByUserId} from "../controllers/demographicSurvey.controller";

const router = express.Router();

// Route to submit or update demographic survey
router.post("/", submitDemographicSurvey);

// Route to get survey info by user ID
router.get("/:id_user", getSurveyByUserId);

export default router;
