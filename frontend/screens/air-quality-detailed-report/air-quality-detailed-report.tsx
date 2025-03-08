import React, {useState} from 'react';
import type { ReactElement } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './air-quality-detailed-report.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PollutantInfoCard } from './pollutant-info-card/pollutant-info-card';
import {useNavigation} from '@react-navigation/native';
import {LocationSelector} from '../home-screen/components/location-selector/location-selector.tsx';
import {useLocationModal} from '../home-screen/components/location-modal/location-modal.types.ts';
import {useSelectedLocation} from '../../context/SelectedLocationContext.tsx';
import { Location } from '../../App.types.ts';
import {LocationModal} from '../home-screen/components/location-modal/location-modal.tsx';
import {Pollutant} from './air-quality-detailed-report.types.ts';

const pollutants = [
    { pollutantName: Pollutant.PM2_5, pollutantValue: 35.8, pollutantDescription: 'Fine Particles' },
    { pollutantName: Pollutant.PM10, pollutantValue: 35.8, pollutantDescription: 'Coarse Particles' },
    { pollutantName: Pollutant.O3, pollutantValue: 35.8, pollutantDescription: 'Ozone' },
    { pollutantName: Pollutant.SO2, pollutantValue: 35.8, pollutantDescription: 'Sulfur Dioxide' },
    { pollutantName: Pollutant.NO2, pollutantValue: 35.8, pollutantDescription: 'Nitrogen Dioxide' },
    { pollutantName: Pollutant.CO, pollutantValue: 35.8, pollutantDescription: 'Carbon Monoxide' },
];

export function AirQualityDetailedReport(): ReactElement {
    const navigation = useNavigation();
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const [location, setLocation] = useState<Location | undefined>(useSelectedLocation().selectedLocation);

    const getHeader = () => {
        return (
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    navigation.goBack();
                }}>
                    <Icon name="chevron-left" size={25} color="yellow" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Air Quality Report</Text>
            </View>
        );
    };

    const getAqiSummary = () => {
        return (
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
    };

    const getPollutantLevels = () => {
        return (
            <View style={styles.pollutantContainer}>
                <View style={styles.pollutantHeader}>
                    <Text style={styles.pollutantTitle}>Pollutant Levels</Text>
                    <TouchableOpacity>
                        <Icon name="question-circle" size={30} color="yellow" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.pollutantList} contentContainerStyle={styles.pollutantListContent}>
                    {pollutants.map((p, i) => (
                        <PollutantInfoCard selectedLocation={location} key={i} {...p} />
                    ))}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {getHeader()}
            {isModalOpen ? <LocationModal selectedLocation={location} visible onClose={closeLocationModal} onLocationSelected={(locationToSelect) => {
                setLocation(locationToSelect);
                closeLocationModal();
            }}/> : null}
            <View style={styles.locationSelector}>
                <LocationSelector
                    isFullWidth
                    showLocationLabel
                    selectedLocation={location}
                    onOpenLocationModal={openLocationModal}
                />
            </View>
            {getAqiSummary()}
            <View style={styles.divider} />
            {getPollutantLevels()}
        </View>
    );
}
