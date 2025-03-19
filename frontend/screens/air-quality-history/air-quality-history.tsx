import {ReactElement, useState, useEffect, useCallback} from 'react';
import React from 'react';
import {Text, TouchableOpacity, View, ActivityIndicator, ScrollView, BackHandler} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {styles} from './air-quality-history.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useLocationModal} from '../home-screen/components/location-modal/location-modal.types.ts';
import {LocationSelector} from '../home-screen/components/location-selector/location-selector.tsx';
import {LocationModal} from '../home-screen/components/location-modal/location-modal.tsx';
import {Pollutant} from '../air-quality-detailed-report/air-quality-detailed-report.types';
import {Location} from '../../App.types.ts';
import {AirQualityHistoryNavigationProps} from '../../types/navigation.types.ts';
import {fetchHistoricalEpaMonitorsData, fetchPollutantDataForTimePeriod} from '../../services/api.service.ts';
import {FilteredHistoricalDataResponse, PollutantChartData} from '../../types/epaMonitorsApiResponse.types.ts';
import {TimeRangeSelector} from './components/time-range-selector/time-range-selector.tsx';
import {TimeRange} from './components/time-range-selector/time-range-selector.types.ts';
import {ChartDisplayToggle} from './components/chart-display-toggle/chart-display-toggle.tsx';
import {ChartDisplayMode} from './components/chart-display-toggle/chart-display-toggle.types.ts';
import {PollutantSelector} from './components/pollutant-selector/pollutant-selector.tsx';
import {useUserActivity} from '../../context/UserActivityContext.tsx';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';
import {getTranslation, Language} from '../../utils/translations';
import {Chart} from './components/chart/chart.tsx';

type RootStackParamList = {
    AirQualityHistory: {
        selectedLocation?: Location;
        selectedPollutant: Pollutant;
    };
};

const currentScreen = 'AirQualityHistory';

type Props = NativeStackScreenProps<RootStackParamList, 'AirQualityHistory'>;

export function AirQualityHistory({route}: Props): ReactElement {
    const navigation = useNavigation<AirQualityHistoryNavigationProps>();
    const {trackButton, trackBackButton} = useUserActivity();
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = (selectedLanguage || 'Eng') as Language;

    const {selectedLocation, selectedPollutant} = route.params;
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();

    const [pollutant, setPollutant] = useState<Pollutant>(selectedPollutant);

    const [historicalData, setHistoricalData] = useState<FilteredHistoricalDataResponse | null>(null);
    const [historicalDataForSelectedTimePeriod, setHistoricalDataForSelectedTimePeriod] = useState<Record<string, PollutantChartData> | null>(null);
    const [isLoadingTimePeriodData, setIsLoadingTimePeriodData] = useState<boolean>(true);
    const [isLoadingAllHistoricalData, setIsLoadingAllHistoricalData] = useState<boolean>(true);

    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('1d');
    const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('concentration');

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

    const fetchTimePeriodData = async (): Promise<void> => {
        if (!selectedLocation) {
            return;
        }

        setError(null);

        try {
            const historicalDataForSelectedTime = await fetchPollutantDataForTimePeriod(selectedLocation, timeRange);
            setHistoricalDataForSelectedTimePeriod(historicalDataForSelectedTime);
        } catch (error) {
            console.error('Error fetching time period data:', error);
            setError(getTranslation('failedToLoadHistoricalData', currentLanguage));
        } finally {
            setIsLoadingTimePeriodData(false);
        }
    };

    const fetchHistoricalData = async (): Promise<void> => {
        if (!selectedLocation) {
            return;
        }

        try {
            const data = await fetchHistoricalEpaMonitorsData(selectedLocation);
            console.log('all data', data);
            setHistoricalData(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            // Don't set error state here since we're loading in the background
        } finally {
            setIsLoadingAllHistoricalData(false);
        }
    };

    // Initial data loading
    useEffect(() => {
        setHistoricalData(null);
        setHistoricalDataForSelectedTimePeriod(null);
        setIsLoadingTimePeriodData(true);
        setIsLoadingAllHistoricalData(true);

        void fetchTimePeriodData();
        // Load historical data in the background
        void fetchHistoricalData();
        // void fetchSummaryData();
    }, [selectedLocation]);

    const getDataFromPeriod = (): Record<string, PollutantChartData> => {
        if (!historicalData) {
            throw new Error('historicalData is null in getDataFromPeriod');
        }

        switch (timeRange) {
            case '1d':
                return historicalData.oneDay;
            case '1w':
                return historicalData.oneWeek;
            case '1m':
                return historicalData.oneMonth;
            case '3m':
                return historicalData.threeMonths;
            case '6m':
                return historicalData.sixMonths;
            case '1y':
                return historicalData.twelveMonths;
            default:
                throw new Error(`Unhandled timeRange ${timeRange}`);
        }
    };

    const getLabelsForDataToUse = (dataForSelectedPeriod: Record<string, PollutantChartData>): string[] => {
        return Object.values(dataForSelectedPeriod).map((dataPoint) => {
            return dataPoint.label;
        });
    };

    const getDataForPollutant = (dataForSelectedPeriod: Record<string, PollutantChartData>): (number | undefined)[] => {
        switch (pollutant) {
            case Pollutant.PM2_5:
                return Object.values(dataForSelectedPeriod).map((dataPoint) => {
                    if (displayMode === 'concentration') {
                        return dataPoint.pm2_5_ug_m3;
                    }
                    return dataPoint.PM2_5_AQI;
                });
            case Pollutant.PM10:
                return Object.values(dataForSelectedPeriod).map((dataPoint) => {
                    if (displayMode === 'concentration') {
                        return dataPoint.pm10_ug_m3;
                    }
                    return dataPoint.PM10_AQI;
                });
            case Pollutant.CO:
                return Object.values(dataForSelectedPeriod).map((dataPoint) => {
                    if (displayMode === 'concentration') {
                        return dataPoint.co_ppm;
                    }
                    return dataPoint.CO_AQI;
                });
            case Pollutant.NO2:
                return Object.values(dataForSelectedPeriod).map((dataPoint) => {
                    if (displayMode === 'concentration') {
                        return dataPoint.no2_ppb;
                    }
                    return dataPoint.NO2_AQI;
                });
            case Pollutant.SO2:
                return Object.values(dataForSelectedPeriod).map((dataPoint) => {
                    if (displayMode === 'concentration') {
                        return dataPoint.so2_ppb;
                    }
                    return dataPoint.SO2_AQI;
                });
            case Pollutant.O3:
                return Object.values(dataForSelectedPeriod).map((dataPoint) => {
                    if (displayMode === 'concentration') {
                        return dataPoint.o3_ppb;
                    }
                    return dataPoint.O3_AQI;
                });
            default:
                throw new Error(`Unhandled pollutant ${pollutant}`);
        }
    };

    const getChartData = (): { labels: string[], values: (number | undefined)[] } => {
        const dataFromPeriodToUse = historicalDataForSelectedTimePeriod ?? getDataFromPeriod();
        const labels = getLabelsForDataToUse(dataFromPeriodToUse);
        const dataValues = getDataForPollutant(dataFromPeriodToUse);

        return {
            labels,
            values: dataValues,
        };
    };

    // Helper function to get unit for pollutant
    const getPollutantUnit = (pollutantType: Pollutant): string => {
        switch (pollutantType) {
            case Pollutant.PM2_5:
            case Pollutant.PM10:
                return 'µg/m³';
            case Pollutant.O3:
            case Pollutant.SO2:
            case Pollutant.NO2:
                return 'ppb';
            case Pollutant.CO:
                return 'ppm';
            default:
                return '';
        }
    };

    // Helper function to get pollutant name
    const getPollutantName = (pollutantType: Pollutant): string => {
        switch (pollutantType) {
            case Pollutant.PM2_5:
                return 'PM₂.₅';
            case Pollutant.PM10:
                return 'PM₁₀';
            case Pollutant.O3:
                return 'O₃';
            case Pollutant.SO2:
                return 'SO₂';
            case Pollutant.NO2:
                return 'NO₂';
            case Pollutant.CO:
                return 'CO';
            default:
                return '';
        }
    };

    const getLoader = (): ReactElement => {
        return (
            <View style={styles.chartContainer}>
                <ActivityIndicator size="large" color="#FFD700"/>
                <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
                    {getTranslation('loading', currentLanguage)}
                </Text>
            </View>
        );
    };

    const getHistoricalDataContent = (): ReactElement => {
        if (isLoadingTimePeriodData) {
            return getLoader();
        }

        if (!isLoadingTimePeriodData && !historicalDataForSelectedTimePeriod) {
            if (isLoadingAllHistoricalData) {
                return getLoader();
            }
        }

        let data;
        data = getChartData();

        if (data) {
            return (
                <View style={styles.chartContainer}>
                    {/* Concentration/AQI Toggle */}
                    <ChartDisplayToggle
                        selectedMode={displayMode}
                        onModeSelected={(mode) => {
                            setDisplayMode(mode);

                            void trackButton('chart_display_mode_toggle', currentScreen, {
                                timestamp: new Date().toISOString(),
                                selectedMode: mode,
                            });
                        }}
                    />

                    {/* Historical Data Chart */}
                    <View style={styles.chartWrapper}>
                        <View style={{marginBottom: 10, alignItems: 'center'}}>
                            <Text style={{color: 'white', fontSize: 14, fontWeight: 'bold'}}>
                                {displayMode === 'concentration'
                                    ? `Average ${getPollutantName(pollutant)} (${getPollutantUnit(pollutant)})`
                                    : `Average ${getPollutantName(pollutant)} AQI`}
                            </Text>
                        </View>
                        <Chart selectedTimePeriod={timeRange} data={data}/>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>{getTranslation('noHistoricalDataAvailable', currentLanguage)}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    void trackBackButton(currentScreen);
                    navigation.goBack();
                }}>
                    <Icon name="chevron-left" size={25} color="yellow"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{getTranslation('airQualityHistory', currentLanguage)}</Text>
            </View>

            <ScrollView style={styles.scrollContainer}>
                <View style={styles.content}>
                    <LocationSelector
                        isFullWidth
                        showLocationLabel
                        selectedLocation={selectedLocation}
                        onOpenLocationModal={() => {
                            void trackButton('location_selector', currentScreen, {
                                timestamp: new Date().toISOString(),
                            });

                            openLocationModal();
                        }}
                    />
                    <PollutantSelector
                        selectedPollutant={pollutant}
                        onPollutantSelected={(pollutantToSelect) => {
                            setPollutant(pollutantToSelect);
                            void trackButton('pollutant_toggle', currentScreen, {
                                timestamp: new Date().toISOString(),
                                selectedPollutant: pollutantToSelect,
                            });
                        }}
                    />

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : (
                        <>
                            <TimeRangeSelector
                                selectedTimeRange={timeRange}
                                onTimeRangeSelected={(timeRangeSelected) => {
                                    // Clear current time period data and show loading state
                                    setHistoricalDataForSelectedTimePeriod(null);

                                    setTimeRange(timeRangeSelected);

                                    void trackButton('time_range_toggle', currentScreen, {
                                        timestamp: new Date().toISOString(),
                                        selectedTimeRange: timeRangeSelected,
                                    });
                                }}
                            />

                            {getHistoricalDataContent()}
                        </>
                    )}
                </View>
            </ScrollView>

            {isModalOpen && (
                <LocationModal
                    selectedLocation={selectedLocation}
                    onLocationSelected={(location) => {
                        navigation.setParams({selectedLocation: location});
                        closeLocationModal();
                    }}
                    visible={isModalOpen}
                    onClose={closeLocationModal}
                />
            )}
        </View>
    );
}
