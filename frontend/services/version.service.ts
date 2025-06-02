import axios from 'axios';

// Base URL for API requests
// const API_BASE_URL = 'http://13.61.251.147/api';
const API_BASE_URL = 'http://10.0.2.2:3000/api';
// const API_BASE_URL = 'http:/192.168.100.34:3000/api';

/**
 * Interface for version check response
 */
export interface VersionCheckResponse {
    success: boolean;
    isLatest: boolean;
    updateRequired?: boolean;
    currentVersion: string;
    latestVersion: string;
    downloadUrl?: string;
    message?: string;
    updateMessage?: string;
}

/**
 * Interface for latest version response
 */
export interface LatestVersionResponse {
    success: boolean;
    latestVersion: string;
    downloadUrl: string;
}

/**
 * Checks if the current app version is the latest
 * @param appVersion - The current app version to check
 * @returns Promise with version check result
 */
export const checkAppVersion = async (appVersion: string): Promise<VersionCheckResponse> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/version/check`, {
            app_version: appVersion,
        });
        return response.data;
    } catch (error) {
        console.error('Error checking app version:', error);
        throw error;
    }
};

/**
 * Gets the latest version information
 * @returns Promise with latest version info
 */
export const getLatestVersion = async (): Promise<LatestVersionResponse> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/version/latest`);
        return response.data;
    } catch (error) {
        console.error('Error getting latest version:', error);
        throw error;
    }
};
