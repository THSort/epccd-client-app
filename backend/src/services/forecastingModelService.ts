import {ForecastingModelParams} from "../types/forecastingModelParams";
import logger from "../utils/logger";

// Function to determine if users in a location should be alerted
export const shouldAlertUsersInLocation = (location: number, params: ForecastingModelParams): boolean => {
    // Using random number generator as requested
    return Math.random() > 0.5;
};
