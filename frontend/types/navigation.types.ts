import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {Location} from '../App.types.ts';
import {Pollutant} from '../screens/air-quality-detailed-report/air-quality-detailed-report.types.ts';

type ScreensParamList = {
    HomeScreen: undefined;
    AirQualityDetailedReport: undefined;
    AirQualityHistory: {
        selectedLocation?: Location,
        selectedPollutant: Pollutant
    };
};

export type HomeScreenNavigationProps = NativeStackNavigationProp<ScreensParamList, 'HomeScreen'>;
export type AirQualityDetailedReportNavigationProps = NativeStackNavigationProp<ScreensParamList, 'AirQualityDetailedReport'>;
export type AirQualityHistoryNavigationProps = NativeStackNavigationProp<ScreensParamList, 'AirQualityHistory'>;
