import React, {useState, useEffect} from 'react';
import type { ReactElement } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
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
import {fetchEpaMonitorsData} from '../../services/api.service.ts';
import {EpaMonitorsApiResponse} from '../../types/epaMonitorsApiResponse.types.ts';
import {getAqiColor} from '../../utils/aqi-colors.util.ts';
import {getAqiDescription} from '../../utils/aqi-description.util.ts';

// Default pollutant descriptions
const pollutantDescriptions = {
    [Pollutant.PM2_5]: 'Fine Particles',
    [Pollutant.PM10]: 'Coarse Particles',
    [Pollutant.O3]: 'Ozone',
    [Pollutant.SO2]: 'Sulfur Dioxide',
    [Pollutant.NO2]: 'Nitrogen Dioxide',
    [Pollutant.CO]: 'Carbon Monoxide',
};

export function AirQualityDetailedReport(): ReactElement {
    const navigation = useNavigation();
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const {selectedLocation} = useSelectedLocation();
    const [location, setLocation] = useState<Location | undefined>(selectedLocation);

    // State for API data
    const [aqiData, setAqiData] = useState<EpaMonitorsApiResponse | null>(null);
    const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Fetch data when location changes
    useEffect(() => {
        const loadData = async () => {
            if (!location) {
                setIsFetchingData(false);
                return;
            }

            setIsFetchingData(true);
            setError(null);

            try {
                const data = await fetchEpaMonitorsData(location);
                setAqiData(data);
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Error fetching EPA Monitors data:', error);
                setError('Failed to load air quality data. Please try again later.');
                setAqiData(null);
            } finally {
                setIsFetchingData(false);
            }
        };

        loadData();
    }, [location]);

    // Format the time since last update
    const getTimeSinceUpdate = (): string => {
        if (!lastUpdated) {return 'N/A';}

        const now = new Date();
        const diffMs = now.getTime() - lastUpdated.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) {return 'Just now';}
        if (diffMins === 1) {return '1 min ago';}
        return `${diffMins} mins ago`;
    };

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
        if (isFetchingData) {
            return (
                <View style={styles.aqiContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                </View>
            );
        }

        if (error || !aqiData) {
            return (
                <View style={styles.aqiContainer}>
                    <Text style={styles.errorText}>{error || 'No data available'}</Text>
                </View>
            );
        }

        const aqiValue = aqiData.PM2_5_AQI;
        const aqiColor = getAqiColor(aqiValue);
        const aqiDescription = getAqiDescription(aqiValue);

        return (
            <View style={styles.aqiContainer}>
                <View style={styles.aqiDetails}>
                    <Text style={[styles.aqiValue, {color: aqiColor}]}>{aqiValue} AQI</Text>
                    <Text style={[styles.aqiStatus, {color: aqiColor}]}>{aqiDescription.level}</Text>
                </View>
                <View>
                    <Text style={styles.updateLabel}>Updated</Text>
                    <Text style={styles.updateTime}>{getTimeSinceUpdate()}</Text>
                </View>
            </View>
        );
    };

    const getPollutantLevels = () => {
        if (isFetchingData) {
            return (
                <View style={styles.pollutantContainer}>
                    <View style={styles.pollutantHeader}>
                        <Text style={styles.pollutantTitle}>Pollutant Levels</Text>
                        <TouchableOpacity>
                            <Icon name="question-circle" size={30} color="yellow" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFD700" />
                    </View>
                </View>
            );
        }

        if (error || !aqiData) {
            return (
                <View style={styles.pollutantContainer}>
                    <View style={styles.pollutantHeader}>
                        <Text style={styles.pollutantTitle}>Pollutant Levels</Text>
                        <TouchableOpacity>
                            <Icon name="question-circle" size={30} color="yellow" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error || 'No data available'}</Text>
                    </View>
                </View>
            );
        }

        // Map API data to pollutant objects
        const pollutants = [
            {
                pollutantName: Pollutant.PM2_5,
                pollutantValue: aqiData.pm2_5_ug_m3,
                pollutantDescription: pollutantDescriptions[Pollutant.PM2_5],
            },
            {
                pollutantName: Pollutant.PM10,
                pollutantValue: aqiData.pm10_ug_m3,
                pollutantDescription: pollutantDescriptions[Pollutant.PM10],
            },
            {
                pollutantName: Pollutant.O3,
                pollutantValue: aqiData.o3_ppb,
                pollutantDescription: pollutantDescriptions[Pollutant.O3],
            },
            {
                pollutantName: Pollutant.SO2,
                pollutantValue: aqiData.so2_ppb,
                pollutantDescription: pollutantDescriptions[Pollutant.SO2],
            },
            {
                pollutantName: Pollutant.NO2,
                pollutantValue: aqiData.no2_ppb,
                pollutantDescription: pollutantDescriptions[Pollutant.NO2],
            },
            {
                pollutantName: Pollutant.CO,
                pollutantValue: aqiData.co_ppm,
                pollutantDescription: pollutantDescriptions[Pollutant.CO],
            },
        ];

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
