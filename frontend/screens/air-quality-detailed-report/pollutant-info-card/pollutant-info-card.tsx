import type { ReactElement } from 'react';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { PollutantInfoCardProps } from './pollutant-info-card.types';
import { styles } from './pollutant-info-card.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {AirQualityDetailedReportNavigationProps} from '../../../types/navigation.types.ts';
import {Pollutant} from '../air-quality-detailed-report.types.ts';

// Define units for each pollutant type
const POLLUTANT_UNITS = {
    [Pollutant.PM2_5]: 'µg/m³',
    [Pollutant.PM10]: 'µg/m³',
    [Pollutant.O3]: 'ppb',
    [Pollutant.SO2]: 'ppb',
    [Pollutant.NO2]: 'ppb',
    [Pollutant.CO]: 'ppm',
};

export function PollutantInfoCard({ ...props }: PollutantInfoCardProps): ReactElement {
    const navigation = useNavigation<AirQualityDetailedReportNavigationProps>();

    // Get the appropriate unit for the pollutant
    const getUnit = (pollutantName: Pollutant) => {
        return POLLUTANT_UNITS[pollutantName] || 'µg/m³';
    };

    const getPollutantDetails = (pollutantName: Pollutant, pollutantValue: number, pollutantDescription: string) => {
        const unit = getUnit(pollutantName);

        return (
            <View>
                <View style={styles.row}>
                    <Text style={styles.pollutantName}>{pollutantName}</Text>
                    <Text style={styles.pollutantValue}>{pollutantValue.toFixed(1)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.pollutantDescription}>{pollutantDescription}</Text>
                    <Text style={styles.pollutantUnits}>{unit}</Text>
                </View>
            </View>
        );
    };

    const getHistoryButton = () => {
        return (
            <TouchableOpacity onPress={() => {
                // navigate to AirQualityHistory
                navigation.navigate('AirQualityHistory', {selectedLocation: props.selectedLocation, selectedPollutant: props.pollutantName});
            }} activeOpacity={0.8}>
                <View style={styles.historyButton}>
                    <Icon name="line-chart" size={15} color="yellow" style={styles.historyIcon} />
                    <Text style={styles.historyText}>View History</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {getPollutantDetails(props.pollutantName, props.pollutantValue, props.pollutantDescription)}
            {getHistoryButton()}
        </View>
    );
}
