import React from 'react';
import type { ReactElement } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { AirQualityDetailedReportProps } from './air-quality-detailed-report.types';
import { styles } from './air-quality-detailed-report.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PollutantInfoCard } from './pollutant-info-card/pollutant-info-card';

export function AirQualityDetailedReport({...props}: AirQualityDetailedReportProps): ReactElement {
    return (
        <View style={styles.container}>
            <Header />
            <AqiSummary />
            <View style={styles.divider} />
            <PollutantLevels />
        </View>
    );
}

const Header = () => (
    <View style={styles.header}>
        <TouchableOpacity onPress={() => console.log('Back pressed')}>
            <Icon name="chevron-left" size={25} color="yellow" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Air Quality Report</Text>
    </View>
);

const AqiSummary = () => (
    <View style={styles.aqiContainer}>
        <View style={styles.aqiDetails}>
            <Text style={styles.aqiValue}>156 AQI</Text>
            <Text style={styles.aqiStatus}>Moderate</Text>
        </View>
        <View>
            <Text style={styles.updateLabel}>Updated</Text>
            <Text style={styles.updateTime}>10 mins ago</Text>
        </View>
    </View>
);

const PollutantLevels = () => (
    <View style={styles.pollutantContainer}>
        <View style={styles.pollutantHeader}>
            <Text style={styles.pollutantTitle}>Pollutant Levels</Text>
            <TouchableOpacity>
                <Icon name="question-circle" size={30} color="yellow" />
            </TouchableOpacity>
        </View>
        <ScrollView style={styles.pollutantList} contentContainerStyle={styles.pollutantListContent}>
            {pollutants.map((p, i) => (
                <PollutantInfoCard key={i} {...p} />
            ))}
        </ScrollView>
    </View>
);

const pollutants = [
    { pollutantName: 'PM₂.₅', pollutantValue: 35.8, pollutantDescription: 'Fine Particles' },
    { pollutantName: 'PM₁₀', pollutantValue: 35.8, pollutantDescription: 'Coarse Particles' },
    { pollutantName: 'O₃', pollutantValue: 35.8, pollutantDescription: 'Ozone' },
    { pollutantName: 'SO₂', pollutantValue: 35.8, pollutantDescription: 'Sulfur Dioxide' },
    { pollutantName: 'NO₂', pollutantValue: 35.8, pollutantDescription: 'Nitrogen Dioxide' },
    { pollutantName: 'CO', pollutantValue: 35.8, pollutantDescription: 'Carbon Monoxide' },
];
