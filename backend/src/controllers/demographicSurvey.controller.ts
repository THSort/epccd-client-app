import {Request, Response} from "express";
import DemographicSurvey from "../models/demographicSurvey.model";

// Submit or update demographic survey info
export const submitDemographicSurvey = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_user, age, asthma, language_preference} = req.body;

        if (!id_user) {
            res.status(400).json({message: "id_user is required"});
            return;
        }

        // Upsert: Update if id_user exists, otherwise create new
        const survey = await DemographicSurvey.findOneAndUpdate(
            {id_user},
            {age, asthma, language_preference},
            {new: true, upsert: true, setDefaultsOnInsert: true}
        );

        res.status(201).json(survey);
    } catch (error) {
        res.status(500).json({message: "Error submitting survey", error});
    }
};

// Fetch survey info by user ID
export const getSurveyByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_user} = req.params;

        const survey = await DemographicSurvey.findOne({id_user});
        if (!survey) {
            res.status(404).json({message: "Survey info not found"});
            return;
        }

        res.json(survey);
    } catch (error) {
        res.status(500).json({message: "Error fetching survey info", error});
    }
};

// Update language preference only
export const updateLanguagePreference = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_user, language_preference} = req.body;

        if (!id_user || !language_preference) {
            res.status(400).json({message: "id_user and language_preference are required"});
            return;
        }

        // Upsert: Update if id_user exists, otherwise create new
        const survey = await DemographicSurvey.findOneAndUpdate(
            {id_user},
            {language_preference},
            {new: true, upsert: true, setDefaultsOnInsert: true}
        );

        res.status(200).json(survey);
    } catch (error) {
        res.status(500).json({message: "Error updating language preference", error});
    }
};
