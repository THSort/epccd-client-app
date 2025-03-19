import {ReactElement, useState, useEffect, useCallback} from 'react';
import React from 'react';
import {Text, TouchableOpacity, View, ActivityIndicator, ScrollView, BackHandler, StyleSheet} from 'react-native';
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
import {fetchHistoricalEpaMonitorsData, fetchPollutantDataForTimePeriod, fetchPollutantSummary} from '../../services/api.service.ts';
import {FilteredHistoricalDataResponse, PollutantChartData, PollutantSummaryResponse} from '../../types/epaMonitorsApiResponse.types.ts';
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
    const [isLoadingSummaryData, setIsLoadingSummaryData] = useState<boolean>(true);
    const [summaryData, setSummaryData] = useState<PollutantSummaryResponse | null>(null);

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
            setHistoricalData(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            // Don't set error state here since we're loading in the background
        } finally {
            setIsLoadingAllHistoricalData(false);
        }
    };

    const fetchSummaryData = async (): Promise<void> => {
        if (!selectedLocation) {
            return;
        }

        setIsLoadingSummaryData(true);

        try {
            const data = await fetchPollutantSummary(selectedLocation);
            setSummaryData(data);
        } catch (error) {
            console.error('Error fetching summary data:', error);
            // Don't set error state here since this is supplementary data
        } finally {
            setIsLoadingSummaryData(false);
        }
    };

    // Initial data loading
    useEffect(() => {
        setHistoricalData(null);
        setHistoricalDataForSelectedTimePeriod(null);
        setSummaryData(null);
        setIsLoadingTimePeriodData(true);
        setIsLoadingAllHistoricalData(true);
        setIsLoadingSummaryData(true);

        void fetchTimePeriodData();
        void fetchHistoricalData();
        void fetchSummaryData();
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

    // Helper function to format numbers according to language
    const formatNumberForLanguage = (value: number): string => {
        if (currentLanguage === 'اردو') {
            // Convert digits to Urdu
            return value.toFixed(1).replace(/[0-9]/g, (digit) => {
                const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                return digits[parseInt(digit)];
            }).replace('.', '٫'); // Replace decimal point with Urdu decimal separator
        }
        return value.toFixed(1);
    };

    // Helper function to get pollutant name
    const getPollutantName = (pollutantType: Pollutant): string => {
        switch (pollutantType) {
            case Pollutant.PM2_5:
                return getTranslation('pm25', currentLanguage);
            case Pollutant.PM10:
                return getTranslation('pm10', currentLanguage);
            case Pollutant.O3:
                return getTranslation('o3', currentLanguage);
            case Pollutant.SO2:
                return getTranslation('so2', currentLanguage);
            case Pollutant.NO2:
                return getTranslation('no2', currentLanguage);
            case Pollutant.CO:
                return getTranslation('co', currentLanguage);
            default:
                return '';
        }
    };

    // Helper function to get pollutant value based on current pollutant and display mode
    const getPollutantValue = (data: any): number => {
        if (!data) {
            return 0;
        }

        switch (pollutant) {
            case Pollutant.PM2_5:
                return displayMode === 'concentration' ? data.pm2_5_ug_m3 : data.PM2_5_AQI;
            case Pollutant.PM10:
                return displayMode === 'concentration' ? data.pm10_ug_m3 : data.PM10_AQI;
            case Pollutant.CO:
                return displayMode === 'concentration' ? data.co_ppm : data.CO_AQI;
            case Pollutant.NO2:
                return displayMode === 'concentration' ? data.no2_ppb : data.NO2_AQI;
            case Pollutant.SO2:
                return displayMode === 'concentration' ? data.so2_ppb : data.SO2_AQI;
            case Pollutant.O3:
                return displayMode === 'concentration' ? data.o3_ppb : data.O3_AQI;
            default:
                return 0;
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
                                    ? currentLanguage === 'اردو'
                                        ? `${getPollutantName(pollutant)} کا اوسط (${getPollutantUnit(pollutant)})`
                                        : `Average ${getPollutantName(pollutant)} (${getPollutantUnit(pollutant)})`
                                    : currentLanguage === 'اردو'
                                        ? `${getPollutantName(pollutant)} اے کیو آئی کا اوسط`
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

    const getSummaryContent = (): ReactElement => {
        if (isLoadingSummaryData) {
            return (
                <View style={summaryCardStyles.container}>
                    <View style={summaryCardStyles.cardsContainer}>
                        {/* Skeleton Loader for Current Value */}
                        <View style={summaryCardStyles.card}>
                            <View style={summaryCardStyles.skeletonTitle}/>
                            <View style={summaryCardStyles.skeletonValue}/>
                            <View style={summaryCardStyles.skeletonSubtitle}/>
                        </View>

                        {/* Skeleton Loader for 24h Average */}
                        <View style={summaryCardStyles.card}>
                            <View style={summaryCardStyles.skeletonTitle}/>
                            <View style={summaryCardStyles.skeletonValue}/>
                            <View style={summaryCardStyles.skeletonSubtitle}/>
                        </View>

                        {/* Skeleton Loader for Weekly Average */}
                        <View style={summaryCardStyles.card}>
                            <View style={summaryCardStyles.skeletonTitle}/>
                            <View style={summaryCardStyles.skeletonValue}/>
                            <View style={summaryCardStyles.skeletonSubtitle}/>
                        </View>
                    </View>
                </View>
            );
        }

        if (!summaryData) {
            return <></>;
        }

        const currentValue = getPollutantValue(summaryData.current);
        const dailyAvgValue = getPollutantValue(summaryData.daily_avg);
        const weeklyAvgValue = getPollutantValue(summaryData.weekly_avg);

        const unit = displayMode === 'concentration' ? getPollutantUnit(pollutant) : '';

        return (
            <View style={summaryCardStyles.container}>
                <View style={summaryCardStyles.cardsContainer}>
                    {/* Current Value Card */}
                    <View style={summaryCardStyles.card}>
                        <Text style={summaryCardStyles.cardTitle}>{getTranslation('currentValue', currentLanguage)}</Text>
                        <Text style={summaryCardStyles.cardValue}>
                            {formatNumberForLanguage(currentValue)}{displayMode === 'concentration' ? ` ${unit}` : ''}
                        </Text>
                    </View>

                    {/* 24h Average Card */}
                    <View style={summaryCardStyles.card}>
                        <Text style={summaryCardStyles.cardTitle}>{getTranslation('dailyAverage', currentLanguage)}</Text>
                        <Text style={summaryCardStyles.cardValue}>
                            {formatNumberForLanguage(dailyAvgValue)}{displayMode === 'concentration' ? ` ${unit}` : ''}
                        </Text>
                    </View>

                    {/* Weekly Average Card */}
                    <View style={summaryCardStyles.card}>
                        <Text style={summaryCardStyles.cardTitle}>{getTranslation('weeklyAverage', currentLanguage)}</Text>
                        <Text style={summaryCardStyles.cardValue}>
                            {formatNumberForLanguage(weeklyAvgValue)}{displayMode === 'concentration' ? ` ${unit}` : ''}
                        </Text>
                    </View>
                </View>
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

                            {/* Summary Cards Section */}
                            {getSummaryContent()}
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

// Styles for the summary cards
const summaryCardStyles = StyleSheet.create({
    container: {
        marginTop: 20,
        padding: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 10,
    },
    title: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    card: {
        display: 'flex',
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    cardValue: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardSubtitle: {
        color: '#DDD',
        fontSize: 10,
        marginTop: 3,
        textAlign: 'center',
    },
    // Skeleton loader styles
    skeletonTitle: {
        width: 60,
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        marginBottom: 8,
    },
    skeletonValue: {
        width: 40,
        height: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        marginBottom: 5,
    },
    skeletonSubtitle: {
        width: 50,
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
    },
});
