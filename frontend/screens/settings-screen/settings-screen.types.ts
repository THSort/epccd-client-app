export interface SettingsScreenProps {
    // Add any props needed
}

// AQI threshold options for alerts
export type AlertThreshold = 
    | 'good'
    | 'satisfactory'
    | 'moderate'
    | 'unhealthyForSensitive'
    | 'unhealthy'
    | 'veryUnhealthy'
    | 'hazardous';

// Alert threshold details with color and label key for translation
export interface AlertThresholdOption {
    value: AlertThreshold;
    colorHex: string;
    labelKey: string;
} 