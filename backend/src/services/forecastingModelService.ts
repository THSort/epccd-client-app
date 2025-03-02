import {ForecastingModelParams} from "../types/forecastingModelParams";

export const shouldAlertUsersInLocation = (location: number, params: ForecastingModelParams): boolean => {
    return Math.random() < 0.5; // 50% chance of returning true
};
