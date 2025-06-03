import {Request, Response} from "express";

// Store the latest app version - you'll update this whenever you make changes
const LATEST_APP_VERSION = "1.0.1";

// URL where users can download the latest APK - update this with your actual APK URL
const LATEST_APK_URL = "https://drive.google.com/file/d/182KGzQTwXCEYvHRt99yYCTUINp5oDoTf/view?usp=drive_link";

/**
 * Check if the provided app version is the latest
 * @param req - Express request object containing app_version in body
 * @param res - Express response object
 */
export const checkAppVersion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { app_version } = req.body;

        if (!app_version) {
            res.status(400).json({
                success: false,
                error: "app_version_required"
            });
            return;
        }

        // Compare versions
        const isLatest = app_version === LATEST_APP_VERSION;
        const isUpdateRequired = app_version !== LATEST_APP_VERSION;

        if (isLatest) {
            res.status(200).json({
                success: true,
                isLatest: true,
                currentVersion: app_version,
                latestVersion: LATEST_APP_VERSION
            });
        } else {
            res.status(200).json({
                success: true,
                isLatest: false,
                updateRequired: true,
                currentVersion: app_version,
                latestVersion: LATEST_APP_VERSION,
                downloadUrl: LATEST_APK_URL
            });
        }
    } catch (error) {
        console.error('Error checking app version:', error);
        res.status(500).json({
            success: false,
            error: "version_check_failed"
        });
    }
};

/**
 * Get the current latest version info
 * @param req - Express request object
 * @param res - Express response object
 */
export const getLatestVersion = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            latestVersion: LATEST_APP_VERSION,
            downloadUrl: LATEST_APK_URL
        });
    } catch (error) {
        console.error('Error getting latest version:', error);
        res.status(500).json({
            success: false,
            error: "get_version_failed"
        });
    }
}; 