import React, {useEffect, useState, useRef, useCallback, ReactElement} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, BackHandler, ScrollView, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './home-screen.styles';
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
import {getTranslation, getTranslatedNumber} from '../../utils/translations';
import {TrackableButton, ELEMENT_NAMES, SCREEN_NAMES} from '../../components/tracking';
import {hp, useResponsiveDimensions} from '../../utils/responsive.util';
import {getDefaultLanguage} from '../../utils/language.util';
import AnimatedGradientBackground from '../../components/animated-gradient-background/animated-gradient-background.tsx';
import {AqiLegend} from '../../components/aqi-legend/aqi-legend.tsx';
import {colors} from '../../App.styles.ts';
import {lightenColor} from '../../utils/colur.util.ts';

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
    const [isFetchingCurrentAqi, setIsFetchingCurrentAqi] = useState<boolean>(true);
    const [currentAqiValueError, setCurrentAqiValueError] = useState<string | null>(null);

    // These state variables are used elsewhere in the component but flagged as unused by linter
    // We're prefixing with _ to indicate they're being kept for future use
    const [futureAQIPrediction, _setFutureAQIPrediction] = useState<number>(450);
    const [_isFetchingFutureAQIPrediction, _setIsFetchingFutureAQIPrediction] = useState<boolean>(true);
    const [futureAQIPredictionError, _setFutureAQIPredictionError] = useState<string | null>(null);

    const [refreshing, setRefreshing] = useState(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [isFuturePredictionSectionExpanded, setIsFuturePredictionSectionExpanded] = useState<boolean>(false);
    const [isCurrentAqiLevelLegendExpanded, setIsCurrentAqiLevelLegendExpanded] = useState<boolean>(false);
    const [isFuturePredictionAqiLevelLegendExpanded, setIsFuturePredictionAqiLevelLegendExpanded] = useState<boolean>(false);

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
            setIsFetchingCurrentAqi(false);
            return;
        }

        setIsFetchingCurrentAqi(true);
        setCurrentAqiValueError(null);

        try {
            console.log('start');
            const data = await fetchEpaMonitorsData(selectedLocation);
            console.log('stop');
            setAqiValue(data.PM2_5_AQI);
        } catch (error) {
            console.error('Error fetching AQI:', error);
            setCurrentAqiValueError(getTranslation('failedToLoadAirQuality', currentLanguage));
            setAqiValue(null);
        } finally {
            setIsFetchingCurrentAqi(false);
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
    const futurePredictionAqiColor = getAqiColor(futureAQIPrediction);
    const futurePredictionAqiDescription = getAqiDescription(futureAQIPrediction, currentLanguage);

    // Define component functions here, before they're used
    const getLocationDisplay = () => {
        return (
            <View style={[styles.locationDisplayContainer]}>
                <LocationSelector
                    selectedLocation={selectedLocation}
                    onOpenLocationModal={() => {
                        openLocationModal();
                        void trackButton('location_selector', currentScreen, {
                            timestamp: new Date().toISOString(),
                        });
                    }}
                />
            </View>
        );
    };

    const getFloatingSettingsButton = (): ReactElement => {
        return (
            <TouchableOpacity
                style={styles.settingsButton}
                activeOpacity={0.7}
                onPress={() => {
                    navigation.navigate('Settings');
                    void trackButton(ELEMENT_NAMES.NAV_SETTINGS, currentScreen, {
                        timestamp: new Date().toISOString(),
                    });
                }}
            >
                <Icon name="cog" size={30} color={colors.secondaryWithDarkBg}/>
            </TouchableOpacity>
        );
    };

    const getAqiErrorDisplay = (): ReactElement => {
        return (
            <TouchableOpacity onPress={() => {
                void onRefresh();
            }} activeOpacity={0.7} style={[styles.errorContainer, {marginTop: '35%'}]}>
                <Text style={styles.errorText}>{currentAqiValueError}</Text>
            </TouchableOpacity>
        );
    };

    const getAqiLevelAndLegendExpander = (expanded: boolean, onTouch: () => void, color: string, aqiDescriptionLevel: string): ReactElement => {
        if (expanded) {
            return (
                <View style={styles.aqiLevelLegendExpanderContainer}>
                    <TrackableButton buttonName={ELEMENT_NAMES.BTN_EXPAND_LEGEND} screenName={SCREEN_NAMES.HOME} onPress={onTouch}>
                        <View style={[styles.aqiLevelLegendExpander, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}>
                            <Text style={[styles.aqiLevelInfoText, {color: color}]}>{aqiDescriptionLevel}</Text>
                            <View style={[styles.infoIconContainer, {borderColor: color}]}>
                                <Icon name={'info'} color={color} size={16}/>
                            </View>
                        </View>

                        <View style={styles.aqiLegend}>
                            <AqiLegend/>
                        </View>
                    </TrackableButton>
                </View>
            );
        }

        return (
            <View style={styles.aqiLevelLegendExpanderContainer}>
                <TrackableButton buttonName={ELEMENT_NAMES.BTN_EXPAND_LEGEND} screenName={SCREEN_NAMES.HOME} onPress={onTouch}>
                    <View style={[styles.aqiLevelLegendExpander]}>
                        <Text style={[styles.aqiLevelInfoText, {color: color}]}>{aqiDescriptionLevel}</Text>
                        <View style={[styles.infoIconContainer, {borderColor: color}]}>
                            <Icon name={'info'} color={color} size={16}/>
                        </View>
                    </View>
                </TrackableButton>
            </View>
        );
    };

    const getAqiDisplayV2 = () => {
        // If on a small screen, apply additional adjustments for better readability
        const messageStyle = isSmallScreen
            ? {...styles.aqiLevelInfoMessageText, fontSize: fontScaleDynamic(18), color: colors.secondaryWithDarkBg}
            : {...styles.aqiLevelInfoMessageText, color: colors.secondaryWithDarkBg};

        // Ensure aqiValue is not null for display
        const displayAqiValue = aqiValue !== null ? aqiValue : 0;

        return (
            <TrackableButton
                buttonName={ELEMENT_NAMES.BTN_VIEW_DETAILED_REPORT}
                screenName={SCREEN_NAMES.HOME}
                onPress={() => navigation.navigate('AirQualityDetailedReport')}
                style={styles.aqiDisplay}
            >
                <View style={styles.aqiValueContainer}>
                    <Text style={styles.aqiText}>
                        {getTranslation('aqi', currentLanguage)}
                    </Text>
                    <Text style={[styles.aqiValueText, {color: lightenColor(aqiColor, 0.2)}]}>
                        {aqiValue !== null ? getTranslatedNumber(Math.floor(aqiValue), currentLanguage) : '-'}
                    </Text>
                </View>

                <View style={styles.aqiGradientMeter}>
                    <AQISlider aqi={displayAqiValue}/>
                </View>

                {getAqiLevelAndLegendExpander(
                    isCurrentAqiLevelLegendExpanded,
                    () => {
                        setIsCurrentAqiLevelLegendExpanded(!isCurrentAqiLevelLegendExpanded);
                    },
                    lightenColor(aqiColor, 0.2),
                    aqiDescription.level)
                }

                <Text style={[messageStyle, {marginTop: hp(15)}]}>{aqiDescription.message}</Text>
            </TrackableButton>
        );
    };

    const getMessageForFuturePrediction = () => {
        if (aqiValue === null) {return '';}

        if (Math.floor(futureAQIPrediction) === Math.floor(aqiValue)) {
            return getTranslation('tomorrowSame', currentLanguage);
        }

        if (Math.floor(futureAQIPrediction) > Math.floor(aqiValue)) {
            return getTranslation('tomorrowWorse', currentLanguage);
        }

        return getTranslation('tomorrowBetter', currentLanguage);
    };

    if (isFetchingCurrentAqi || isLoadingLanguage || isLoadingLocation) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryWithDarkBg}/>
            </View>
        );
    }

    // Show error view if there's an error, even if aqiValue is null
    if (currentAqiValueError) {
        return (
            <AnimatedGradientBackground color={'#808080'}>
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
                        {getAqiErrorDisplay()}
                    </ScrollView>
                </View>

                {getFloatingSettingsButton()}
            </AnimatedGradientBackground>
        );
    }

    const getFuturePredictionDisplay = (): ReactElement => {
        // Safety check to prevent comparison when aqiValue is null
        const safeAqiValue = aqiValue !== null ? aqiValue : 0;
        const isPredictionHigher = futureAQIPrediction > safeAqiValue;
        const arrowIcon = isPredictionHigher ? 'arrow-up' : 'arrow-down';
        const arrowColor = isPredictionHigher ? 'red' : 'green';

        const messageStyle = isSmallScreen
            ? {...styles.aqiLevelInfoMessageText, fontSize: fontScaleDynamic(18), color: colors.secondaryWithDarkBg}
            : {...styles.aqiLevelInfoMessageText, color: colors.secondaryWithDarkBg};

        return (
            <TrackableButton buttonName={ELEMENT_NAMES.BTN_FUTURE_PREDICTION} screenName={SCREEN_NAMES.HOME} onPress={() => {
                setIsFuturePredictionSectionExpanded(!isFuturePredictionSectionExpanded);
            }} activeOpacity={0.7} style={styles.futurePredictionContainer}>
                <Text style={[styles.aqiText]}>
                    {getTranslation('tomorrowPrediction', currentLanguage)}
                </Text>
                <View style={styles.futureAqiValue}>
                    <Text style={[styles.aqiValueText, {color: lightenColor(futurePredictionAqiColor, 0.2)}]}>{getTranslatedNumber(futureAQIPrediction, currentLanguage)}</Text>
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: hp(5), gap: 8}}>
                        <Icon name={arrowIcon} size={20} color={arrowColor}/>
                        <Text style={messageStyle}>{getMessageForFuturePrediction()}</Text>
                    </View>
                </View>
                {
                    isFuturePredictionSectionExpanded ?
                        <>
                            <View style={styles.aqiGradientMeter}>
                                <AQISlider aqi={futureAQIPrediction}/>
                            </View>

                            {getAqiLevelAndLegendExpander(
                                isFuturePredictionAqiLevelLegendExpanded,
                                () => {
                                    setIsFuturePredictionAqiLevelLegendExpanded(!isFuturePredictionAqiLevelLegendExpanded);
                                },
                                lightenColor(futurePredictionAqiColor, 0.2),
                                futurePredictionAqiDescription.level
                            )
                            }
                        </> : null
                }
            </TrackableButton>
        );
    };

    return (
        <AnimatedGradientBackground color={currentAqiValueError ? '#808080' : aqiColor}>
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
                    {currentAqiValueError ? getAqiErrorDisplay() : getAqiDisplayV2()}
                    {!currentAqiValueError && !futureAQIPredictionError ? getFuturePredictionDisplay() : null}
                </ScrollView>
            </View>

            {getFloatingSettingsButton()}
        </AnimatedGradientBackground>
    );
};

export default HomeScreen;
