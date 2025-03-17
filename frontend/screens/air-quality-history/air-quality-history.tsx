import {ReactElement, useState, useEffect, useCallback, useMemo} from 'react';
import React from 'react';
import {Text, TouchableOpacity, View, ActivityIndicator, ScrollView, BackHandler, Dimensions} from 'react-native';
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
import {fetchHistoricalEpaMonitorsData, fetchPollutantSummary} from '../../services/api.service.ts';
import {FilteredHistoricalDataResponse, PollutantChartData, PollutantSummaryResponse} from '../../types/epaMonitorsApiResponse.types.ts';
import {TimeRangeSelector} from './components/time-range-selector/time-range-selector.tsx';
import {TimeRange} from './components/time-range-selector/time-range-selector.types.ts';
import {ChartDisplayToggle} from './components/chart-display-toggle/chart-display-toggle.tsx';
import {ChartDisplayMode} from './components/chart-display-toggle/chart-display-toggle.types.ts';
import {LineChart} from 'react-native-chart-kit';
import {PollutantSelector} from './components/pollutant-selector/pollutant-selector.tsx';
import {useUserActivity} from '../../context/UserActivityContext.tsx';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';
import {getTranslation, Language, getTranslatedNumber} from '../../utils/translations';

// Get screen width for responsive charts
const screenWidth = Dimensions.get('window').width;

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
    // const [summaryData, setSummaryData] = useState<PollutantSummaryResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('1m');
    const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('concentration');

    // Map pollutant types to translation keys
    const getPollutantTranslation = useCallback((pollutantType: Pollutant, type: 'name' | 'description' | 'unit'): string => {
        switch (pollutantType) {
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
    }, [currentLanguage]);

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

    const fetchHistoricalData = useCallback(async () => {
        if (!selectedLocation) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchHistoricalEpaMonitorsData(selectedLocation);
            console.log('Historical data fetched for different time periods');
            console.log('One day data (time-based averages):', data.oneDay);
            console.log('One week data (day-based averages):', data.oneWeek);
            console.log('One month data (week-based averages):', data.oneMonth);
            console.log('Three months data (month-based averages):', data.threeMonths);
            console.log('Six months data (month-based averages):', data.sixMonths);
            console.log('One year data (quarterly averages):', data.twelveMonths);
            setHistoricalData(data);
            console.log('-->', data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            setError(getTranslation('failedToLoadHistoricalData', currentLanguage));
        } finally {
            setIsLoading(false);
        }
    }, [selectedLocation, currentLanguage]);

    const fetchSummaryData = useCallback(async () => {
        if (!selectedLocation) {
            return;
        }

        try {
            // const data = await fetchPollutantSummary(selectedLocation);
            // console.log('Summary data fetched:', data);
            // setSummaryData(data);
        } catch (error) {
            // console.error('Error fetching summary data:', error);
            // Don't set error state here to avoid blocking the UI if only summary data fails
        }
    }, [selectedLocation]);

    useEffect(() => {
        void fetchHistoricalData();
        // void fetchSummaryData();
    }, [fetchHistoricalData, fetchSummaryData]);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFD700"/>
            </View>
        );
    }

    const getDataFromPeriod = (): Record<string, PollutantChartData> => {
        if (!historicalData) {
            throw new Error('Historical data is null in getDataFromPeriod');
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

    const getDataForPollutant = (dataForSelectedPeriod: Record<string, PollutantChartData>): number[] => {
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

    const getChartData = (): { labels: string[], values: number[] } => {
        const dataFromPeriodToUse = getDataFromPeriod();
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
                                    setTimeRange(timeRangeSelected);

                                    void trackButton('time_range_toggle', currentScreen, {
                                        timestamp: new Date().toISOString(),
                                        selectedTimeRange: timeRangeSelected,
                                    });
                                }}
                            />

                            {historicalData && getChartData().values.length > 0 ? (
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
                                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                            <LineChart
                                                data={{
                                                    labels: getChartData().labels,
                                                    datasets: [{
                                                        data: getChartData().values,
                                                    }],
                                                }}
                                                width={
                                                    timeRange === '1d'
                                                        ? Math.max(screenWidth * 2, getChartData().labels.length * 120)
                                                        : Math.max(screenWidth * 1.5, getChartData().labels.length * 80)
                                                }
                                                height={275}
                                                chartConfig={{
                                                    backgroundColor: '#1e2923',
                                                    backgroundGradientFrom: '#1e2923',
                                                    backgroundGradientTo: '#08130D',
                                                    decimalPlaces: displayMode === 'concentration' ? 2 : 0,
                                                    color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
                                                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                                    style: {
                                                        borderRadius: 16,
                                                    },
                                                    propsForDots: {
                                                        r: '6',
                                                        strokeWidth: '2',
                                                        stroke: '#FFD700',
                                                    },
                                                    propsForBackgroundLines: {
                                                        strokeDasharray: '', // Solid lines
                                                        stroke: 'rgba(255, 255, 255, 0.2)',
                                                        strokeWidth: 1,
                                                    },
                                                    propsForLabels: {
                                                        fontSize: 10,
                                                    },
                                                }}
                                                bezier
                                                withInnerLines={true}
                                                withOuterLines={true}
                                                withVerticalLines={true}
                                                withHorizontalLines={true}
                                                withDots={true}
                                                withShadow={true}
                                                style={styles.chart}
                                            />
                                        </ScrollView>
                                    </View>

                                    {/* Stats Cards */}
                                    {/*        <View style={styles.statsCardsContainer}>*/}
                                    {/*            /!* Current Value Card *!/*/}
                                    {/*            <View style={styles.statCard}>*/}
                                    {/*                <Text style={styles.statCardTitle}>*/}
                                    {/*                    {getTranslation('currentValue', currentLanguage)}*/}
                                    {/*                </Text>*/}
                                    {/*                <Text style={styles.statCardValue}>*/}
                                    {/*                    {getTranslatedNumber(getCurrentValue().toFixed(1), currentLanguage)} {getUnitForPollutant()}*/}
                                    {/*                </Text>*/}
                                    {/*            </View>*/}
                                    {/*        */}
                                    {/*            /!* 24h Average Card *!/*/}
                                    {/*            <View style={styles.statCard}>*/}
                                    {/*                <Text style={styles.statCardTitle}>*/}
                                    {/*                    {getTranslation('dailyAverage', currentLanguage)}*/}
                                    {/*                </Text>*/}
                                    {/*                <Text style={styles.statCardValue}>*/}
                                    {/*                    {getTranslatedNumber(getDailyAvgValue().toFixed(displayMode === 'concentration' ? 2 : 0), currentLanguage)} {getUnitForPollutant()}*/}
                                    {/*                </Text>*/}
                                    {/*            </View>*/}
                                    {/*        */}
                                    {/*            /!* Weekly Average Card *!/*/}
                                    {/*            <View style={styles.statCard}>*/}
                                    {/*                <Text style={styles.statCardTitle}>*/}
                                    {/*                    {getTranslation('weeklyAverage', currentLanguage)}*/}
                                    {/*                </Text>*/}
                                    {/*                <Text style={styles.statCardValue}>*/}
                                    {/*                    {getTranslatedNumber(getWeeklyAvgValue().toFixed(displayMode === 'concentration' ? 2 : 0), currentLanguage)} {getUnitForPollutant()}*/}
                                    {/*                </Text>*/}
                                    {/*            </View>*/}
                                    {/*        </View>*/}
                                </View>
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Text style={styles.noDataText}>{getTranslation('noHistoricalDataAvailable', currentLanguage)}</Text>
                                </View>
                            )}
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
