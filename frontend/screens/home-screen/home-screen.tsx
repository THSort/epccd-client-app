import React, {useEffect, useState, useRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './home-screen.styles';
import {LanguageToggle} from './components/language-toggle/language-toggle.tsx';
import {AQISlider} from './components/aqi-slider/aqi-slider.tsx';
import {LocationSelector} from './components/location-selector/location-selector.tsx';
import {useLocationModal} from './components/location-modal/location-modal.types.ts';
import {LocationModal} from './components/location-modal/location-modal.tsx';
import {useSelectedLocation} from '../../context/SelectedLocationContext.tsx';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';
import {getAqiColor} from '../../utils/aqi-colors.util.ts';
import {getAqiDescription} from '../../utils/aqi-description.util.ts';
import {fetchEpaMonitorsData} from '../../services/api.service.ts';
import {useNavigation} from '@react-navigation/native';
import {HomeScreenNavigationProps} from '../../types/navigation.types.ts';
import {useUserActivity} from '../../context/UserActivityContext.tsx';

const DEFAULT_AQI = 0;

const currentScreen = 'HomeScreen';

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProps>();
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const {selectedLocation, isLoadingLocation, setSelectedLocation} = useSelectedLocation();
    const {isLoadingLanguage} = useSelectedLanguage();

    const { trackButton, trackBackButton } = useUserActivity();

    const [aqiValue, setAqiValue] = useState<number>(DEFAULT_AQI);
    const [isFetchingAqi, setIsFetchingAqi] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    const loadAqi = useCallback(async () => {
        if (!selectedLocation) {
            setIsFetchingAqi(false);
            return;
        }

        setIsFetchingAqi(true);
        setError(null);

        try {
            const data = await fetchEpaMonitorsData(selectedLocation);
            setAqiValue(data.PM2_5_AQI);
            setError(null);
        } catch (error) {
            console.error('Error fetching AQI:', error);
            setError('Failed to load air quality data. Please try again later.');
            // Set a default value in case of error
            setAqiValue(DEFAULT_AQI);
        } finally {
            setIsFetchingAqi(false);
        }
    }, [selectedLocation]);

    useEffect(() => {
        // Initial data load
        loadAqi();

        // Set up polling every 5 minutes (300000 ms)
        pollingIntervalRef.current = setInterval(() => {
            console.log('Polling for updated AQI data...');
            loadAqi();
        }, 300000);

        // Clean up interval on component unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [loadAqi]);

    const aqiColor = getAqiColor(aqiValue);
    const aqiDescription = getAqiDescription(aqiValue);

    if (isFetchingAqi || isLoadingLanguage || isLoadingLocation) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFD700"/>
            </View>
        );
    }

    const getFooter = () => {
        return (
            <View style={styles.homeScreenFooter}>
                <LocationSelector selectedLocation={selectedLocation} onOpenLocationModal={() => {
                    openLocationModal();
                    void trackButton('location_selector', currentScreen, {
                        timestamp: new Date().toISOString(),
                    });
                }}/>
                <LanguageToggle/>
            </View>
        );
    };

    const getSettingsButton = () => {
        return (
            <View style={styles.settingsIconContainer}>
                <TouchableOpacity activeOpacity={0.7}>
                    <Icon name="cog" size={40} color="#FFD700"/>
                </TouchableOpacity>
            </View>
        );
    };

    const getViewDetailedReportButton = () => {
        return (
            <View style={styles.viewDetailedReportButtonContainer}>
                <TouchableOpacity onPress={() => {
                    void trackButton('view_detailed_report', currentScreen, {
                        timestamp: new Date().toISOString(),
                    });
                    navigation.navigate('AirQualityDetailedReport');
                }} activeOpacity={0.7}>
                    <View style={styles.viewDetailedReportButton}>
                        <Icon name="info-circle" size={18} color="black" style={styles.viewDetailedReportButtonIcon}/>
                        <Text style={styles.viewDetailedReportButtonText}>View Detailed Report</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const getLocationDisplay = () => {
        return (
            <View style={[styles.locationDisplayContainer]}>
                <Icon name="map-marker" size={20} color="yellow" style={styles.locationDisplayIcon}/>
                <Text style={styles.locationDisplayText}>
                    {selectedLocation ? selectedLocation.locationName : 'Select Location'}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isModalOpen && (
                <LocationModal
                    selectedLocation={selectedLocation}
                    onLocationSelected={(location) => {
                        setSelectedLocation(location);
                        closeLocationModal();
                    }}
                    visible={isModalOpen}
                    onClose={closeLocationModal}
                />
            )}

            {getLocationDisplay()}

            {error ? (
                <View style={[styles.errorContainer, {marginTop: '35%'}]}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <>
                    <View style={[styles.aqiValueContainer, {marginTop: '35%'}]}>
                        <Text style={[styles.aqiValueText, {color: aqiColor}]}>{aqiValue}</Text>
                        <Text style={[styles.aqiText, {color: aqiColor}]}>AQI</Text>
                    </View>

                    <View style={[styles.aqiGradientMeter, {marginTop: 40}]}>
                        <AQISlider aqi={aqiValue}/>
                    </View>

                    <View style={[styles.aqiLevelInfoContainer, {marginTop: 30}]}>
                        <Text style={[styles.aqiLevelInfoText, {color: aqiColor}]}>{aqiDescription.level}</Text>
                        <Text style={[styles.aqiLevelInfoMessageText, {color: aqiColor}]}>
                            {aqiDescription.message}
                        </Text>
                    </View>
                </>
            )}
            {getViewDetailedReportButton()}
            {getSettingsButton()}
            {getFooter()}
        </View>
    );
};

export default HomeScreen;
