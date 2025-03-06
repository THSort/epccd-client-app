import React from 'react';
import type { ReactElement } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { AirQualityDetailedReportProps } from './air-quality-detailed-report.types';
import { styles } from './air-quality-detailed-report.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PollutantInfoCard } from './pollutant-info-card/pollutant-info-card.tsx';

export function AirQualityDetailedReport({...props}: AirQualityDetailedReportProps): ReactElement {
    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            {/* Header Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                <TouchableOpacity onPress={() => console.log('Back pressed')}>
                    <Icon name="chevron-left" size={18} color="yellow" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'yellow', marginLeft: 10 }}>
                    Air Quality Report
                </Text>
            </View>

            {/* AQI Summary Section */}
            <View style={{ paddingHorizontal: 24, paddingTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'yellow' }}>156 AQI</Text>
                        <Text style={{ fontSize: 14, color: 'yellow' }}>Moderate</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'yellow', textAlign: 'center' }}>Updated</Text>
                        <Text style={{ fontSize: 12, color: 'yellow', textAlign: 'center' }}>10 mins ago</Text>
                    </View>
                </View>
            </View>

            {/* Divider (Full width) */}
            <View style={{ height: 1, backgroundColor: 'yellow', marginVertical: 10 }} />

            {/* Content with padding */}
            <View style={{ paddingHorizontal: 25 }}>
                {/* Pollutant Levels Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'yellow' }}>Pollutant Levels</Text>
                    <TouchableOpacity>
                        <Icon name="question-circle" size={30} color="yellow" />
                    </TouchableOpacity>
                </View>

                {/* Scrollable Pollutant List */}
                <ScrollView
                    style={{ backgroundColor: 'red', height: 400 }}
                    contentContainerStyle={{ alignItems: 'center', gap: 10 }}
                >
                    <PollutantInfoCard pollutantName={'PM₂.₅'} pollutantValue={35.8} pollutantDescription={'Fine Particles'}/>
                    <PollutantInfoCard pollutantName={'PM₁₀'} pollutantValue={35.8} pollutantDescription={'Coarse Particles'}/>
                    <PollutantInfoCard pollutantName={'O₃'} pollutantValue={35.8} pollutantDescription={'Ozone'}/>
                    <PollutantInfoCard pollutantName={'SO₂'} pollutantValue={35.8} pollutantDescription={'Sulfur Dioxide'}/>
                    <PollutantInfoCard pollutantName={'NO₂'} pollutantValue={35.8} pollutantDescription={'Nitrogen Dioxide'}/>
                    <PollutantInfoCard pollutantName={'CO'} pollutantValue={35.8} pollutantDescription={'Carbon Monoxide'}/>
                </ScrollView>
            </View>
        </View>
    );
}
