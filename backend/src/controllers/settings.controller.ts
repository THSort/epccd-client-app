import { Request, Response } from "express";
import User from "../models/user.model";
import DemographicSurvey from "../models/demographicSurvey.model";

// Update user's location
export const updateUserLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_user, location } = req.body;

        if (!id_user || !location) {
            res.status(400).json({ message: "id_user and location are required" });
            return;
        }

        const updatedUser = await User.findOneAndUpdate(
            { id_user },
            { location },
            { new: true }
        );

        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json({ 
            message: "User location updated successfully", 
            user: updatedUser 
        });
    } catch (error) {
        console.error("Error updating user location:", error);
        res.status(500).json({ message: "Error updating user location", error });
    }
};

// Update user's alerts threshold
export const updateUserAlertsThreshold = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_user, alerts_threshold } = req.body;

        if (!id_user || !alerts_threshold) {
            res.status(400).json({ message: "id_user and alerts_threshold are required" });
            return;
        }

        // Validate alerts_threshold value
        const validThresholds = ['good', 'satisfactory', 'moderate', 'unhealthyForSensitive', 'unhealthy', 'veryUnhealthy', 'hazardous'];
        if (!validThresholds.includes(alerts_threshold)) {
            res.status(400).json({ 
                message: "Invalid alerts_threshold value",
                validValues: validThresholds
            });
            return;
        }

        const updatedUser = await User.findOneAndUpdate(
            { id_user },
            { alerts_threshold },
            { new: true }
        );

        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json({ 
            message: "User alerts threshold updated successfully", 
            user: updatedUser 
        });
    } catch (error) {
        console.error("Error updating user alerts threshold:", error);
        res.status(500).json({ message: "Error updating user alerts threshold", error });
    }
};

// Update user's language preference
export const updateUserLanguage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_user, language_preference } = req.body;

        if (!id_user || !language_preference) {
            res.status(400).json({ message: "id_user and language_preference are required" });
            return;
        }

        // Validate language_preference value
        const validLanguages = ['Eng', 'اردو'];
        if (!validLanguages.includes(language_preference)) {
            res.status(400).json({ 
                message: "Invalid language_preference value",
                validValues: validLanguages
            });
            return;
        }

        // Find or create demographic survey for the user
        let demographicSurvey = await DemographicSurvey.findOne({ id_user });

        if (demographicSurvey) {
            // Update existing record
            demographicSurvey.language_preference = language_preference;
            await demographicSurvey.save();
        } else {
            // Create new record
            demographicSurvey = new DemographicSurvey({
                id_user,
                language_preference
            });
            await demographicSurvey.save();
        }

        res.json({ 
            message: "User language preference updated successfully", 
            demographicSurvey 
        });
    } catch (error) {
        console.error("Error updating user language preference:", error);
        res.status(500).json({ message: "Error updating user language preference", error });
    }
}; 