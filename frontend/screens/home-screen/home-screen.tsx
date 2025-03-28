import React, {useEffect, useState, useRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, BackHandler, ScrollView, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './home-screen.styles';
import {LanguageToggle} from '../../components/language-toggle/language-toggle.tsx';
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
import {getTranslation, getTranslatedLocationName, getTranslatedNumber} from '../../utils/translations';
import {TrackableButton, ELEMENT_NAMES, SCREEN_NAMES} from '../../components/tracking';
import {useResponsiveDimensions} from '../../utils/responsive.util';
import {getDefaultLanguage} from '../../utils/language.util';

const currentScreen = 'HomeScreen';

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProps>();
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const {selectedLocation, isLoadingLocation, setSelectedLocation} = useSelectedLocation();
    const {selectedLanguage, isLoadingLanguage} = useSelectedLanguage();

    // Use the utility function to get the current language with Urdu as default
    const currentLanguage = getDefaultLanguage(selectedLanguage);

    const {trackButton, trackBackButton} = useUserActivity();

    const [aqiValue, setAqiValue] = useState<number | null>(null);
    const [isFetchingAqi, setIsFetchingAqi] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Get responsive dimensions
    const {isSmallScreen, fontScaleDynamic} = useResponsiveDimensions();

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
            setError(getTranslation('failedToLoadAirQuality', currentLanguage));
            setAqiValue(null);
        } finally {
            setIsFetchingAqi(false);
        }
    }, [selectedLocation, currentLanguage]);

    useEffect(() => {
        // Initial data load
        loadAqi();

        // Set up polling every 5 minutes (300000 ms)
        pollingIntervalRef.current = setInterval(() => {
            loadAqi();
        }, 300000);

        // Clean up interval on component unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [loadAqi]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadAqi();
        setRefreshing(false);
    }, [loadAqi]);

    const aqiColor = aqiValue !== null ? getAqiColor(aqiValue) : '#808080';
    const aqiDescription = aqiValue !== null ? getAqiDescription(aqiValue, currentLanguage) : {level: '', message: ''};

    if (isFetchingAqi || isLoadingLanguage || isLoadingLocation || aqiValue === null) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

    const getLocationDisplay = () => {
        const locationDisplayName = selectedLocation
            ? getTranslatedLocationName(selectedLocation.locationName, currentLanguage)
            : getTranslation('selectLocation', currentLanguage);

        return (
            <View style={[styles.locationDisplayContainer]}>
                <Icon name="map-marker" size={20} color="yellow" style={styles.locationDisplayIcon}/>
                <Text style={styles.locationDisplayText}>
                    {locationDisplayName}
                </Text>
            </View>
        );
    };

    const renderAQILevelInfo = () => {
        // If on a small screen, apply additional adjustments for better readability
        const messageStyle = isSmallScreen 
            ? {...styles.aqiLevelInfoMessageText, fontSize: fontScaleDynamic(20), color: aqiColor} 
            : {...styles.aqiLevelInfoMessageText, color: aqiColor};
            
        return (
            <View style={styles.aqiLevelInfoContainer}>
                <Text style={[styles.aqiLevelInfoText, {color: aqiColor}]}>{aqiDescription.level}</Text>
                <Text style={messageStyle}>{aqiDescription.message}</Text>
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

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#FFD700']}
                        tintColor="#FFD700"
                        progressBackgroundColor="#ffffff"
                    />
                }
            >
                {getLocationDisplay()}

                {error ? (
                    <View style={[styles.errorContainer, {marginTop: '35%'}]}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.aqiValueContainer}>
                            <Text style={[styles.aqiValueText, {color: aqiColor}]}>{getTranslatedNumber(aqiValue, currentLanguage)}</Text>
                            <Text style={[styles.aqiText, {color: aqiColor}]}>
                                {getTranslation('airQualityIndex', currentLanguage)}
                            </Text>
                        </View>

                        <View style={styles.aqiGradientMeter}>
                            <AQISlider aqi={aqiValue}/>
                        </View>

                        {renderAQILevelInfo()}

                        <View style={styles.viewDetailedReportButtonContainer}>
                            <TrackableButton
                                buttonName={ELEMENT_NAMES.BTN_VIEW_DETAILED_REPORT}
                                screenName={SCREEN_NAMES.HOME}
                                style={styles.viewDetailedReportButton}
                                onPress={() => navigation.navigate('AirQualityDetailedReport')}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Icon name="info-circle" size={18} color="black" style={styles.viewDetailedReportButtonIcon}/>
                                    <Text style={styles.viewDetailedReportButtonText}>
                                        {getTranslation('viewDetailedReport', currentLanguage)}
                                    </Text>
                                </View>
                            </TrackableButton>
                        </View>
                    </>
                )}
            </ScrollView>

            <View style={styles.bottomContainer}>
                <View style={styles.settingsIconContainer}>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Icon name="cog" size={40} color="#FFD700"/>
                    </TouchableOpacity>
                </View>

                <View style={styles.homeScreenFooter}>
                    <LocationSelector
                        selectedLocation={selectedLocation}
                        onOpenLocationModal={() => {
                            openLocationModal();
                            void trackButton('location_selector', currentScreen, {
                                timestamp: new Date().toISOString(),
                            });
                        }}
                    />
                    <LanguageToggle/>
                </View>
            </View>
        </View>
    );
};

export default HomeScreen;
