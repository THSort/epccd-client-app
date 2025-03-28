import React, {useState, useEffect, useCallback} from 'react';
import type {ReactElement} from 'react';
import {ScrollView, Text, TouchableOpacity, View, ActivityIndicator, BackHandler, RefreshControl} from 'react-native';
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
import {getTranslation, getTranslatedTimeSinceUpdate, getTranslatedNumber} from '../../utils/translations';
import {LahoreGraph} from './components/lahore-graph/lahore-graph';
import {hp} from '../../utils/responsive.util';
import {getDefaultLanguage} from '../../utils/language.util';

const currentScreen = 'AirQualityReport';

export function AirQualityDetailedReport(): ReactElement {
    const navigation = useNavigation();
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const {selectedLocation} = useSelectedLocation();
    const [location, setLocation] = useState<Location | undefined>(selectedLocation);
    const {selectedLanguage} = useSelectedLanguage();
    
    // Use the utility function for default language as Urdu
    const currentLanguage = getDefaultLanguage(selectedLanguage);

    const {trackButton, trackBackButton} = useUserActivity();

    // State for API data
    const [aqiData, setAqiData] = useState<EpaMonitorsApiResponse | null>(null);
    const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [updateTimerKey, setUpdateTimerKey] = useState<number>(0); // Add state for timer refresh
    const [refreshing, setRefreshing] = useState(false);

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

    const onRefresh = useCallback(async () => {
        if (!location) {return;}

        setRefreshing(true);
        try {
            const data = await fetchEpaMonitorsData(location);
            setAqiData(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (error) {
            console.error('Error fetching AQI data:', error);
            setError(getTranslation('failedToLoadAirQuality', currentLanguage));
        } finally {
            setRefreshing(false);
        }
    }, [location, currentLanguage]);

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

    // Add timer to update the "time since update" text every minute
    useEffect(() => {
        // Update timer every minute (60000ms)
        const timer = setInterval(() => {
            setUpdateTimerKey(prev => prev + 1);
        }, 60000);

        // Clear timer on component unmount
        return () => clearInterval(timer);
    }, []);

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
                    <Text
                        key={`update-time-${updateTimerKey}`}
                        style={styles.updateTime}
                    >
                        {getTranslatedTimeSinceUpdate(lastUpdated, currentLanguage)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isModalOpen && (
                <LocationModal
                    selectedLocation={location}
                    onLocationSelected={(newLocation) => {
                        setLocation(newLocation);
                        closeLocationModal();
                    }}
                    visible={isModalOpen}
                    onClose={closeLocationModal}
                />
            )}

            <View style={styles.contentContainer}>
                {getHeader()}

                <View style={styles.locationSelector}>
                    <LocationSelector
                        selectorStyle={{
                            backgroundColor: '#1C1C1C',
                            borderRadius: 10,
                            paddingVertical: 10,
                            paddingHorizontal: 15,
                            marginBottom: 10,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.3,
                            shadowRadius: 3,
                        }}
                        isFullWidth
                        selectedLocation={location}
                        onOpenLocationModal={() => {
                            void trackButton('open_location_modal', currentScreen, {
                                timestamp: new Date().toISOString(),
                            });
                            openLocationModal();
                        }}
                    />
                </View>

                {/* Map outside scrollable area */}
                <View style={{flex: 0}}>
                    <LahoreGraph selectedLocation={location} />
                </View>

                {/* Scrollable area with pull-to-refresh */}
                <ScrollView
                    style={{flex: 1}}
                    contentContainerStyle={{flexGrow: 1}}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#FFD700"
                            colors={['#FFD700']}
                        />
                    }
                >
                    {getAqiSummary()}

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

                        {isFetchingData ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#FFD700"/>
                            </View>
                        ) : error || !aqiData ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error || getTranslation('noDataAvailable', currentLanguage)}</Text>
                            </View>
                        ) : (
                            <View style={{paddingBottom: hp(20)}}>
                                {[
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
                                ].map((p, i) => (
                                    <PollutantInfoCard selectedLocation={location} key={i} {...p} />
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}
