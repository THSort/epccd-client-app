import express from "express";
import {submitDemographicSurvey, getSurveyByUserId, updateLanguagePreference} from "../controllers/demographicSurvey.controller";

const router = express.Router();

// Route to submit or update demographic survey
router.post("/", submitDemographicSurvey);

// Route to get survey info by user ID
router.get("/:id_user", getSurveyByUserId);

// Route to update language preference
router.post("/language", updateLanguagePreference);

export default router;
