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
import {fetchEpaMonitorsData, isDataOutdated as checkDataOutdated} from '../../services/api.service.ts';
import {EpaMonitorsApiResponse} from '../../types/epaMonitorsApiResponse.types.ts';
import {getAqiColor} from '../../utils/aqi-colors.util.ts';
import {getAqiDescription} from '../../utils/aqi-description.util.ts';
import {useUserActivity} from '../../context/UserActivityContext.tsx';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';
import {getTranslation, getTranslatedNumber} from '../../utils/translations';
import {LahoreGraph} from './components/lahore-graph/lahore-graph';
import {getDefaultLanguage} from '../../utils/language.util';
import AnimatedGradientBackground from '../../components/animated-gradient-background/animated-gradient-background.tsx';
import {AQISlider} from '../home-screen/components/aqi-slider/aqi-slider.tsx';
import {fontScale, hp} from '../../utils/responsive.util.ts';
import TextWithStroke from '../../components/text-with-stroke/text-with-stroke.tsx';
import {colors} from '../../App.styles.ts';
import {lightenColor} from '../../utils/colur.util.ts';
import {AirQualityDetailedReportNavigationProps} from '../../types/navigation.types.ts';

const currentScreen = 'AirQualityReport';

export function AirQualityDetailedReport(): ReactElement {
    const navigation = useNavigation<AirQualityDetailedReportNavigationProps>();
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
    const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
    const [isDataOutdated, setIsDataOutdated] = useState<boolean>(false);
    const [_refreshing, setRefreshing] = useState(false);

    // Format date to a readable format
    const formatLastUpdatedTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Last updated time and outdated warning display
    const getLastUpdatedTimeDisplay = (): ReactElement | null => {
        if (!lastUpdatedTime) {return null;}

        return (
            <View style={styles.lastUpdatedContainer}>
                <Text style={styles.lastUpdatedText}>
                    {getTranslation('lastUpdated', currentLanguage)}: {formatLastUpdatedTime(lastUpdatedTime)}
                </Text>
                {isDataOutdated && (
                    <View style={styles.outdatedWarningContainer}>
                        <Icon style={{ marginLeft: 10 }} name="exclamation-triangle" size={16} color="#FF9800" />
                        <TextWithStroke
                            text={getTranslation('outdatedDataWarning', currentLanguage)}
                            color="#FF9800"
                            strokeColor="#000000"
                            strokeWidth={0.5}
                            size={fontScale(14)}
                            style={{ marginLeft: 5 }}
                        />
                    </View>
                )}
            </View>
        );
    };

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
        if (!location) {
            return;
        }

        setRefreshing(true);
        try {
            const data = await fetchEpaMonitorsData(location);
            setAqiData(data);
            // Set last updated time and check if data is outdated
            if (data.report_date_time) {
                setLastUpdatedTime(data.report_date_time);
                setIsDataOutdated(checkDataOutdated(data.report_date_time));
            }
            setError(null);
        } catch (error) {
            console.error('Error fetching AQI data:', error);
            setError(getTranslation('failedToLoadAirQuality', currentLanguage));
            setLastUpdatedTime(null);
            setIsDataOutdated(false);
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
                // Set last updated time and check if data is outdated
                if (data.report_date_time) {
                    setLastUpdatedTime(data.report_date_time);
                    setIsDataOutdated(checkDataOutdated(data.report_date_time));
                }
                setError(null);
            } catch (error) {
                console.error('Error fetching AQI data:', error);
                setError(getTranslation('failedToLoadAirQuality', currentLanguage));
                setLastUpdatedTime(null);
                setIsDataOutdated(false);
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
                    void trackBackButton(currentScreen);
                    // Navigate back
                    navigation.goBack();
                }}>
                    <Icon name="chevron-left" size={25} color={colors.primaryWithDarkBg}/>
                </TouchableOpacity>

                <TextWithStroke strokeWidth={1.2} style={styles.headerTitle} text={getTranslation('airQualityReport', currentLanguage)} color={colors.primaryWithDarkBg} size={fontScale(25)} bold={true}/>

                <TouchableOpacity style={{
                    position: 'absolute',
                    right: 20,
                }} activeOpacity={0.7} onPress={() => {
                    void trackButton('learn_more', currentScreen, {
                        timestamp: new Date().toISOString(),
                    });
                    navigation.navigate('LearnMore');
                }}>
                    <Icon name="question-circle" size={35} color={colors.primaryWithDarkBg}/>
                </TouchableOpacity>
            </View>
        );
    };

    const getAqiSummary = (data: EpaMonitorsApiResponse) => {
        if (isFetchingData) {
            return (
                <View style={styles.aqiContainer}>
                    <ActivityIndicator style={{
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }} size="large" color={colors.primaryWithDarkBg}/>
                </View>
            );
        }

        const aqiValue = data.PM2_5_AQI;
        const aqiColor = getAqiColor(aqiValue);
        const aqiDescription = getAqiDescription(aqiValue, currentLanguage);

        return (
            <View style={styles.aqiContainer}>
                <TextWithStroke text={`${getTranslatedNumber(aqiValue, currentLanguage)} ${getTranslation('aqi', currentLanguage)}`} color={lightenColor(aqiColor, 0.3)} size={fontScale(24)} bold={true}/>

                {/*<Text style={[styles.aqiStatus, {color: aqiColor}]}>{aqiDescription.level}</Text>*/}
                <View style={{flex: 2, width: '100%', marginTop: hp(15)}}>
                    <AQISlider aqi={aqiValue}/>
                </View>

                <TextWithStroke strokeWidth={0.8} text={aqiDescription.level} color={lightenColor(aqiColor, 0.3)} size={fontScale(24)} bold={true}/>

                {getLastUpdatedTimeDisplay()}

            </View>
        );
    };

    const getPollutantInfoCards = (data: EpaMonitorsApiResponse): ReactElement => {
        if (isFetchingData) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primaryWithDarkBg}/>
                </View>
            );
        }

        return (
            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 12}}>
                {[
                    {
                        pollutantName: Pollutant.PM2_5,
                        pollutantValue: data.pm2_5_ug_m3,
                        pollutantDescription: getPollutantTranslation(Pollutant.PM2_5, 'description'),
                        pollutantUnit: getPollutantTranslation(Pollutant.PM2_5, 'unit'),
                        translatedName: getPollutantTranslation(Pollutant.PM2_5, 'name'),
                    },
                    {
                        pollutantName: Pollutant.PM10,
                        pollutantValue: data.pm10_ug_m3,
                        pollutantDescription: getPollutantTranslation(Pollutant.PM10, 'description'),
                        pollutantUnit: getPollutantTranslation(Pollutant.PM10, 'unit'),
                        translatedName: getPollutantTranslation(Pollutant.PM10, 'name'),
                    },
                    {
                        pollutantName: Pollutant.O3,
                        pollutantValue: data.o3_ppb,
                        pollutantDescription: getPollutantTranslation(Pollutant.O3, 'description'),
                        pollutantUnit: getPollutantTranslation(Pollutant.O3, 'unit'),
                        translatedName: getPollutantTranslation(Pollutant.O3, 'name'),
                    },
                    {
                        pollutantName: Pollutant.SO2,
                        pollutantValue: data.so2_ppb,
                        pollutantDescription: getPollutantTranslation(Pollutant.SO2, 'description'),
                        pollutantUnit: getPollutantTranslation(Pollutant.SO2, 'unit'),
                        translatedName: getPollutantTranslation(Pollutant.SO2, 'name'),
                    },
                    {
                        pollutantName: Pollutant.NO2,
                        pollutantValue: data.no2_ppb,
                        pollutantDescription: getPollutantTranslation(Pollutant.NO2, 'description'),
                        pollutantUnit: getPollutantTranslation(Pollutant.NO2, 'unit'),
                        translatedName: getPollutantTranslation(Pollutant.NO2, 'name'),
                    },
                    {
                        pollutantName: Pollutant.CO,
                        pollutantValue: data.co_ppm,
                        pollutantDescription: getPollutantTranslation(Pollutant.CO, 'description'),
                        pollutantUnit: getPollutantTranslation(Pollutant.CO, 'unit'),
                        translatedName: getPollutantTranslation(Pollutant.CO, 'name'),
                    },
                ].map((p, i) => (
                    <PollutantInfoCard selectedLocation={location} key={i} {...p} />
                ))}
            </View>
        );
    };

    return (
        <AnimatedGradientBackground color={!aqiData ? '#808080' : getAqiColor(aqiData.PM2_5_AQI)}>
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

                    <ScrollView
                        style={styles.scrollableContent}
                        contentContainerStyle={styles.scrollableContentContainer}
                        // refreshControl={
                        //     <RefreshControl
                        //         refreshing={refreshing}
                        //         onRefresh={onRefresh}
                        //         tintColor={colors.primaryWithDarkBg}
                        //         colors={[colors.primaryWithDarkBg]}
                        //     />
                        // }
                    >
                        {
                            isFetchingData ?
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={colors.primaryWithDarkBg}/>
                                </View> :
                                error || !aqiData ? (
                                    <TouchableOpacity onPress={onRefresh} activeOpacity={0.7} style={styles.errorContainer}>
                                        <Text style={styles.errorText}>{error || getTranslation('noDataAvailable', currentLanguage)}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <View style={styles.locationSelector}>
                                            <LocationSelector
                                                selectedLocation={location}
                                                onOpenLocationModal={() => {
                                                    void trackButton('open_location_modal', currentScreen, {
                                                        timestamp: new Date().toISOString(),
                                                    });
                                                    openLocationModal();
                                                }}
                                            />
                                        </View>

                                        {getAqiSummary(aqiData)}

                                        {getPollutantInfoCards(aqiData)}

                                        <View style={{marginTop: hp(10), marginBottom: hp(10), paddingHorizontal: hp(15)}}>
                                            <LahoreGraph selectedLocation={location}/>
                                        </View>
                                    </>
                                )
                        }
                    </ScrollView>
                </View>
            </View>
        </AnimatedGradientBackground>
    );
}
