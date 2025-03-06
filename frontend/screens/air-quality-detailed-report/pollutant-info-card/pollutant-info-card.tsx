import type { ReactElement } from 'react';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { PollutantInfoCardProps } from './pollutant-info-card.types';
import { styles } from './pollutant-info-card.styles';
import Icon from 'react-native-vector-icons/FontAwesome';

const UNITS = 'µg/m³';

export function PollutantInfoCard({ ...props }: PollutantInfoCardProps): ReactElement {
    return (
        <View style={styles.container}>
            <PollutantDetails {...props} />
            <HistoryButton />
        </View>
    );
}

const PollutantDetails = ({ pollutantName, pollutantValue, pollutantDescription }: PollutantInfoCardProps) => (
    <View>
        <View style={styles.row}>
            <Text style={styles.pollutantName}>{pollutantName}</Text>
            <Text style={styles.pollutantValue}>{pollutantValue}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.pollutantDescription}>{pollutantDescription}</Text>
            <Text style={styles.pollutantUnits}>{UNITS}</Text>
        </View>
    </View>
);

const HistoryButton = () => (
    <TouchableOpacity activeOpacity={0.8}>
        <View style={styles.historyButton}>
            <Icon name="line-chart" size={15} color="yellow" style={styles.historyIcon} />
            <Text style={styles.historyText}>View History</Text>
        </View>
    </TouchableOpacity>
);
