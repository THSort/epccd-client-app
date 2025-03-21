import React, {useState, useEffect, useCallback} from 'react';
import type {ReactElement} from 'react';
import {ScrollView, Text, TouchableOpacity, View, ActivityIndicator, BackHandler} from 'react-native';
import {styles} from './air-quality-detailed-report.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {PollutantInfoCard} from './components/pollutant-info-card/pollutant-info-card';
import {useNavigation} from '@react-navigation/native';
import {LocationSelector} from '../home-screen/components/location-selector/location-selector.tsx';
import {useLocationModal} from '../home-screen/components/location-modal/location-modal.types.ts';
import {useSelectedLocation} from '../../context/SelectedLocationContext.tsx';
import {Location} from '../../App.types.ts';
import {LocationModal} from '../home-screen/components/location-modal/location-modal.tsx';
import {Pollutant} from './air-quality-detailed-report.types.ts';
import {fetchEpaMonitorsData} from '../../services/api.service.ts';
import {EpaMonitorsApiResponse} from '../../types/epaMonitorsApiResponse.types.ts';
import {getAqiColor} from '../../utils/aqi-colors.util.ts';
import {getAqiDescription} from '../../utils/aqi-description.util.ts';
import {useUserActivity} from '../../context/UserActivityContext.tsx';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';
import {getTranslation, Language, getTranslatedTimeSinceUpdate, getTranslatedNumber} from '../../utils/translations';
import {LahoreGraph} from './components/lahore-graph/lahore-graph.tsx';

const currentScreen = 'AirQualityReport';

export function AirQualityDetailedReport(): ReactElement {
    const navigation = useNavigation();
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const {selectedLocation} = useSelectedLocation();
    const [location, setLocation] = useState<Location | undefined>(selectedLocation);
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = (selectedLanguage || 'Eng') as Language;

    const {trackButton, trackBackButton} = useUserActivity();

    // State for API data
    const [aqiData, setAqiData] = useState<EpaMonitorsApiResponse | null>(null);
    const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Map pollutant types to translation keys
    const getPollutantTranslation = (pollutant: Pollutant, type: 'name' | 'description' | 'unit'): string => {
        switch (pollutant) {
            case Pollutant.PM2_5:
                if (type === 'name') {
                    return getTranslation('pm25', currentLanguage);
                }
                if (type === 'description') {
                    return getTranslation('pm25Description', currentLanguage);
                }
                return getTranslation('ugm3', currentLanguage);
            case Pollutant.PM10:
                if (type === 'name') {
                    return getTranslation('pm10', currentLanguage);
                }
                if (type === 'description') {
                    return getTranslation('pm10Description', currentLanguage);
                }
                return getTranslation('ugm3', currentLanguage);
            case Pollutant.O3:
                if (type === 'name') {
                    return getTranslation('o3', currentLanguage);
                }
                if (type === 'description') {
                    return getTranslation('o3Description', currentLanguage);
                }
                return getTranslation('ppb', currentLanguage);
            case Pollutant.SO2:
                if (type === 'name') {
                    return getTranslation('so2', currentLanguage);
                }
                if (type === 'description') {
                    return getTranslation('so2Description', currentLanguage);
                }
                return getTranslation('ppb', currentLanguage);
            case Pollutant.NO2:
                if (type === 'name') {
                    return getTranslation('no2', currentLanguage);
                }
                if (type === 'description') {
                    return getTranslation('no2Description', currentLanguage);
                }
                return getTranslation('ppb', currentLanguage);
            case Pollutant.CO:
                if (type === 'name') {
                    return getTranslation('co', currentLanguage);
                }
                if (type === 'description') {
                    return getTranslation('coDescription', currentLanguage);
                }
                return getTranslation('ppm', currentLanguage);
            default:
                return '';
        }
    };

    const handleBackButtonClick = useCallback(() => {
        trackBackButton(currentScreen);
        navigation.goBack();
        return true; // Prevent default behavior since we're handling navigation
    }, [trackBackButton, navigation]);

    useEffect(() => {
        const backEvent = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            backEvent.remove();
        };
    }, [handleBackButtonClick]);

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
                setError(null);
            } catch (error) {
                console.error('Error fetching AQI data:', error);
                setError(getTranslation('failedToLoadAirQuality', currentLanguage));
            } finally {
                setIsFetchingData(false);
            }
        };

        void loadData();
    }, [location, currentLanguage]);

    const getHeader = () => {
        return (
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    // Track back button press
                    trackBackButton(currentScreen);
                    // Navigate back
                    navigation.goBack();
                }}>
                    <Icon name="chevron-left" size={25} color="yellow"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{getTranslation('airQualityReport', currentLanguage)}</Text>
            </View>
        );
    };

    const getAqiSummary = () => {
        if (isFetchingData) {
            return (
                <View style={styles.aqiContainer}>
                    <ActivityIndicator style={{
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }} size="large" color="#FFD700"/>
                </View>
            );
        }

        if (error || !aqiData) {
            return (
                <View style={styles.aqiContainer}>
                    <Text style={styles.errorText}>{error || getTranslation('noDataAvailable', currentLanguage)}</Text>
                </View>
            );
        }

        const aqiValue = aqiData.PM2_5_AQI;
        const aqiColor = getAqiColor(aqiValue);
        const aqiDescription = getAqiDescription(aqiValue, currentLanguage);

        return (
            <View style={styles.aqiContainer}>
                <View style={styles.aqiDetails}>
                    <Text style={[styles.aqiValue, {color: aqiColor}]}>{getTranslatedNumber(aqiValue, currentLanguage)} {getTranslation('aqi', currentLanguage)}</Text>
                    <Text style={[styles.aqiStatus, {color: aqiColor}]}>{aqiDescription.level}</Text>
                </View>
                <View>
                    <Text style={styles.updateLabel}>{getTranslation('updated', currentLanguage)}</Text>
                    <Text style={styles.updateTime}>{getTranslatedTimeSinceUpdate(lastUpdated, currentLanguage)}</Text>
                </View>
            </View>
        );
    };

    const getPollutantLevels = () => {
        if (isFetchingData) {
            return (
                <View style={styles.pollutantContainer}>
                    <View style={styles.pollutantHeader}>
                        <Text style={styles.pollutantTitle}>{getTranslation('pollutantLevels', currentLanguage)}</Text>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            void trackButton('learn_more', currentScreen, {
                                timestamp: new Date().toISOString(),
                            });
                        }}>
                            <Icon name="question-circle" size={30} color="yellow"/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFD700"/>
                    </View>
                </View>
            );
        }

        if (error || !aqiData) {
            return (
                <View style={styles.pollutantContainer}>
                    <View style={styles.pollutantHeader}>
                        <Text style={styles.pollutantTitle}>{getTranslation('pollutantLevels', currentLanguage)}</Text>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            void trackButton('learn_more', currentScreen, {
                                timestamp: new Date().toISOString(),
                            });
                        }}>
                            <Icon name="question-circle" size={30} color="yellow"/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error || getTranslation('noDataAvailable', currentLanguage)}</Text>
                    </View>
                </View>
            );
        }

        // Map API data to pollutant objects with translations
        const pollutants = [
            {
                pollutantName: Pollutant.PM2_5,
                pollutantValue: aqiData.pm2_5_ug_m3,
                pollutantDescription: getPollutantTranslation(Pollutant.PM2_5, 'description'),
                pollutantUnit: getPollutantTranslation(Pollutant.PM2_5, 'unit'),
                translatedName: getPollutantTranslation(Pollutant.PM2_5, 'name'),
                viewHistoryText: getTranslation('viewHistory', currentLanguage),
            },
            {
                pollutantName: Pollutant.PM10,
                pollutantValue: aqiData.pm10_ug_m3,
                pollutantDescription: getPollutantTranslation(Pollutant.PM10, 'description'),
                pollutantUnit: getPollutantTranslation(Pollutant.PM10, 'unit'),
                translatedName: getPollutantTranslation(Pollutant.PM10, 'name'),
                viewHistoryText: getTranslation('viewHistory', currentLanguage),
            },
            {
                pollutantName: Pollutant.O3,
                pollutantValue: aqiData.o3_ppb,
                pollutantDescription: getPollutantTranslation(Pollutant.O3, 'description'),
                pollutantUnit: getPollutantTranslation(Pollutant.O3, 'unit'),
                translatedName: getPollutantTranslation(Pollutant.O3, 'name'),
                viewHistoryText: getTranslation('viewHistory', currentLanguage),
            },
            {
                pollutantName: Pollutant.SO2,
                pollutantValue: aqiData.so2_ppb,
                pollutantDescription: getPollutantTranslation(Pollutant.SO2, 'description'),
                pollutantUnit: getPollutantTranslation(Pollutant.SO2, 'unit'),
                translatedName: getPollutantTranslation(Pollutant.SO2, 'name'),
                viewHistoryText: getTranslation('viewHistory', currentLanguage),
            },
            {
                pollutantName: Pollutant.NO2,
                pollutantValue: aqiData.no2_ppb,
                pollutantDescription: getPollutantTranslation(Pollutant.NO2, 'description'),
                pollutantUnit: getPollutantTranslation(Pollutant.NO2, 'unit'),
                translatedName: getPollutantTranslation(Pollutant.NO2, 'name'),
                viewHistoryText: getTranslation('viewHistory', currentLanguage),
            },
            {
                pollutantName: Pollutant.CO,
                pollutantValue: aqiData.co_ppm,
                pollutantDescription: getPollutantTranslation(Pollutant.CO, 'description'),
                pollutantUnit: getPollutantTranslation(Pollutant.CO, 'unit'),
                translatedName: getPollutantTranslation(Pollutant.CO, 'name'),
                viewHistoryText: getTranslation('viewHistory', currentLanguage),
            },
        ];

        return (
            <View style={styles.pollutantContainer}>
                <View style={styles.pollutantHeader}>
                    <Text style={styles.pollutantTitle}>{getTranslation('pollutantLevels', currentLanguage)}</Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => {
                        void trackButton('learn_more', currentScreen, {
                            timestamp: new Date().toISOString(),
                        });
                    }}>
                        <Icon name="question-circle" size={30} color="yellow"/>
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
            <LahoreGraph selectedLocation={location}/>
            {getAqiSummary()}
            <View style={styles.divider}/>
            {getPollutantLevels()}
        </View>
    );
}
