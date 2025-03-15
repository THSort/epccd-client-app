import {ReactElement, useState, useEffect, useCallback} from 'react';
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
import {fetchHistoricalEpaMonitorsData} from '../../services/api.service.ts';
import {FilteredHistoricalDataResponse} from '../../types/epaMonitorsApiResponse.types.ts';
import {TimeRangeSelector} from './components/time-range-selector/time-range-selector.tsx';
import {TimeRange} from './components/time-range-selector/time-range-selector.types.ts';
import {ChartDisplayToggle} from './components/chart-display-toggle/chart-display-toggle.tsx';
import {ChartDisplayMode} from './components/chart-display-toggle/chart-display-toggle.types.ts';
import {PollutantSelector} from './components/pollutant-selector/pollutant-selector.tsx';
import {useUserActivity} from '../../context/UserActivityContext.tsx';
// Import Chart Kit components
import {
    LineChart,
} from 'react-native-chart-kit';

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

    const {selectedLocation, selectedPollutant} = route.params;
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();

    const [pollutant, setPollutant] = useState<Pollutant>(selectedPollutant);
    const [historicalData, setHistoricalData] = useState<FilteredHistoricalDataResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('1m');
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
            console.log('One year data (quarterly averages):', data.oneYear);
            setHistoricalData(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            setError('Failed to load historical air quality data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedLocation]);

    // Get the appropriate data based on the selected time range
    const getDataForTimeRange = useCallback(() => {
        if (!historicalData) {
            return [];
        }

        switch (timeRange) {
            case '1d':
                // Convert the oneDay object to an array for consistency
                return Object.entries(historicalData.oneDay).map(([time, data]) => ({
                    ...data,
                    time, // Add the time as a property for easier access
                }));
            case '1w':
                return Object.entries(historicalData.oneWeek).map(([day, data]) => ({
                    ...data,
                    time: day,
                }));
            case '1m':
                return Object.entries(historicalData.oneMonth).map(([week, data]) => ({
                    ...data,
                    time: week,
                }));
            case '3m':
                return Object.entries(historicalData.threeMonths).map(([month, data]) => ({
                    ...data,
                    time: month,
                }));
            case '6m':
                return Object.entries(historicalData.sixMonths).map(([month, data]) => ({
                    ...data,
                    time: month,
                }));
            case '1y':
                return Object.entries(historicalData.oneYear).map(([quarter, data]) => ({
                    ...data,
                    time: quarter,
                }));
            default:
                return [];
        }
    }, [historicalData, timeRange]);

    // Helper function to get the appropriate value based on pollutant and display mode
    const getValueForPollutant = useCallback((dataPoint: Record<string, any>) => {
        if (displayMode === 'concentration') {
            switch (pollutant) {
                case Pollutant.PM2_5:
                    return dataPoint.pm2_5_ug_m3;
                case Pollutant.PM10:
                    return dataPoint.pm10_ug_m3;
                case Pollutant.O3:
                    return dataPoint.o3_ppb;
                case Pollutant.NO2:
                    return dataPoint.no2_ppb;
                case Pollutant.SO2:
                    return dataPoint.so2_ppb;
                case Pollutant.CO:
                    return dataPoint.co_ppm;
                default:
                    return 0;
            }
        } else {
            switch (pollutant) {
                case Pollutant.PM2_5:
                    return dataPoint.PM2_5_AQI;
                case Pollutant.PM10:
                    return dataPoint.PM10_AQI;
                case Pollutant.O3:
                    return dataPoint.O3_AQI;
                case Pollutant.NO2:
                    return dataPoint.NO2_AQI;
                case Pollutant.SO2:
                    return dataPoint.SO2_AQI;
                case Pollutant.CO:
                    return dataPoint.CO_AQI;
                default:
                    return 0;
            }
        }
    }, [pollutant, displayMode]);

    // Helper function to get the appropriate unit based on pollutant and display mode
    const getUnitForPollutant = useCallback(() => {
        if (displayMode === 'concentration') {
            switch (pollutant) {
                case Pollutant.PM2_5:
                case Pollutant.PM10:
                    return 'μg/m³';
                case Pollutant.CO:
                    return 'ppm';
                default:
                    return 'ppb';
            }
        } else {
            return 'AQI';
        }
    }, [pollutant, displayMode]);

    // Sort data chronologically based on time range
    const getSortedData = useCallback(() => {
        const data = getDataForTimeRange();

        if (timeRange === '1d') {
            // Sort by time (12 AM, 4 AM, 8 AM, 12 PM, 4 PM, 8 PM)
            const timeOrder: Record<string, number> = {
                '12 AM': 0,
                '4 AM': 1,
                '8 AM': 2,
                '12 PM': 3,
                '4 PM': 4,
                '8 PM': 5,
            };
            return [...data].sort((a, b) => (timeOrder[a.time] || 0) - (timeOrder[b.time] || 0));
        } else if (timeRange === '1w') {
            // Sort by day of week
            const dayOrder: Record<string, number> = {
                'Sunday': 0,
                'Monday': 1,
                'Tuesday': 2,
                'Wednesday': 3,
                'Thursday': 4,
                'Friday': 5,
                'Saturday': 6,
            };
            return [...data].sort((a, b) => (dayOrder[a.time] || 0) - (dayOrder[b.time] || 0));
        } else if (timeRange === '1m') {
            // Sort by week chronologically (assuming format "MM/DD - MM/DD")
            return [...data].sort((a, b) => {
                const getStartDate = (weekLabel: string) => {
                    const startDateStr = weekLabel.split(' - ')[0];
                    const [month, day] = startDateStr.split('/').map(Number);
                    const date = new Date();
                    date.setMonth(month - 1);
                    date.setDate(day);
                    return date;
                };

                const dateA = getStartDate(a.time);
                const dateB = getStartDate(b.time);

                return dateA.getTime() - dateB.getTime();
            });
        } else if (timeRange === '3m' || timeRange === '6m') {
            // Sort months chronologically
            return [...data].sort((a, b) => {
                const getDate = (monthYear: string) => {
                    const [month, year] = monthYear.split(' ');
                    const monthIndex = [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December',
                    ].indexOf(month);
                    return new Date(parseInt(year), monthIndex, 1);
                };

                return getDate(a.time).getTime() - getDate(b.time).getTime();
            });
        } else if (timeRange === '1y') {
            // Sort quarters chronologically
            const quarterOrder: Record<string, number> = {
                'January - March': 0,
                'April - June': 1,
                'July - September': 2,
                'October - December': 3,
            };

            return [...data].sort((a, b) => (quarterOrder[a.time] ?? 0) - (quarterOrder[b.time] ?? 0));
        }

        return data;
    }, [getDataForTimeRange, timeRange]);

    // Prepare data for Chart Kit
    const prepareChartData = useCallback(() => {
        const sortedData = getSortedData();

        return {
            labels: sortedData.map(item => {
                // Format based on time range
                if (timeRange === '1d') {
                    // Keep time labels as is (12 AM, 4 AM, etc.)
                    return item.time;
                } else if (timeRange === '1w') {
                    // Truncate day names to three letters (Sun, Mon, Tue, etc.)
                    const dayMap: Record<string, string> = {
                        'Sunday': 'Sun',
                        'Monday': 'Mon',
                        'Tuesday': 'Tue',
                        'Wednesday': 'Wed',
                        'Thursday': 'Thu',
                        'Friday': 'Fri',
                        'Saturday': 'Sat',
                    };
                    return dayMap[item.time] || item.time;
                } else if (timeRange === '1m') {
                    // Format week ranges as dd/mm/yy for start date
                    // Example: "5/15 - 5/21" becomes "15/05/23"
                    try {
                        const startDateStr = item.time.split(' - ')[0];
                        const [month, day] = startDateStr.split('/').map(Number);
                        const date = new Date();
                        date.setMonth(month - 1);
                        date.setDate(day);
                        // Format as dd/mm/yy
                        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
                    } catch (e) {
                        return item.time;
                    }
                } else if (timeRange === '3m' || timeRange === '6m') {
                    // Format month and year as mm/yy
                    // Example: "January 2023" becomes "01/23"
                    try {
                        const [month, year] = item.time.split(' ');
                        const monthIndex = [
                            'January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December',
                        ].indexOf(month) + 1;
                        return `${monthIndex.toString().padStart(2, '0')}/${year.slice(-2)}`;
                    } catch (e) {
                        return item.time;
                    }
                } else if (timeRange === '1y') {
                    // For quarters, use the first month of the quarter in mm/yy format
                    // Example: "January - March" becomes "01/23"
                    try {
                        const quarterStartMonths: Record<string, number> = {
                            'January - March': 1,
                            'April - June': 4,
                            'July - September': 7,
                            'October - December': 10,
                        };
                        const monthIndex = quarterStartMonths[item.time] || 1;
                        const year = new Date().getFullYear();
                        return `${monthIndex.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
                    } catch (e) {
                        return item.time;
                    }
                }
                return item.time;
            }),
            datasets: [
                {
                    data: sortedData.map(item => getValueForPollutant(item)),
                    color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`, // Yellow color
                    strokeWidth: 2,
                },
            ],
            legend: [`${pollutant} ${getUnitForPollutant()}`],
        };
    }, [getSortedData, getValueForPollutant, getUnitForPollutant, pollutant, timeRange]);

    useEffect(() => {
        fetchHistoricalData();
    }, [fetchHistoricalData]);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFD700"/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    void trackBackButton(currentScreen);
                    navigation.goBack();
                }}>
                    <Icon name="chevron-left" size={25} color="yellow"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Air Quality History</Text>
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

                            {historicalData && getSortedData().length > 0 ? (
                                <View style={{
                                    marginTop: 20,
                                    // padding: 15,
                                    backgroundColor: '#222',
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    minHeight: 200,
                                }}>
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
                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                    }}>

                                        <LineChart
                                            data={prepareChartData()}
                                            width={screenWidth - 60}
                                            height={220}
                                            chartConfig={{
                                                backgroundColor: '#222',
                                                backgroundGradientFrom: '#222',
                                                backgroundGradientTo: '#333',
                                                decimalPlaces: displayMode === 'concentration' ? 2 : 0,
                                                color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
                                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                                style: {
                                                    borderRadius: 16,
                                                },
                                                propsForDots: {
                                                    r: '6',
                                                    strokeWidth: '2',
                                                    stroke: '#ffd700',
                                                },
                                                horizontalLabelRotation: 45,
                                                formatXLabel: (label) => label,
                                                propsForLabels: {
                                                    fontSize: 10,
                                                },
                                            }}
                                            bezier
                                            style={{
                                                marginVertical: 8,
                                                borderRadius: 16,
                                                alignSelf: 'center',
                                            }}
                                            yAxisLabel=""
                                            yAxisSuffix=""
                                            fromZero={true}
                                            withDots={true}
                                            withShadow={false}
                                            withInnerLines={true}
                                            withOuterLines={false}
                                            withHorizontalLabels={true}
                                            withVerticalLabels={true}
                                            segments={5}
                                        />
                                    </View>

                                    {/* Stats Cards */}
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        marginTop: 20,
                                        marginBottom: 10,
                                        paddingHorizontal: 5,
                                    }}>
                                        {/* Current Value Card */}
                                        <View style={{
                                            backgroundColor: '#111',
                                            borderRadius: 10,
                                            padding: 10,
                                            width: '31%',
                                            alignItems: 'center',
                                        }}>
                                            <Text style={{
                                                color: 'yellow',
                                                fontSize: 12,
                                                fontWeight: 'bold',
                                                marginBottom: 5,
                                                textAlign: 'center',
                                            }}>
                                                Current Value
                                            </Text>
                                            <Text style={{
                                                color: 'white',
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}>
                                                45 μg/m³
                                            </Text>
                                        </View>

                                        {/* 24h Average Card */}
                                        <View style={{
                                            backgroundColor: '#111',
                                            borderRadius: 10,
                                            padding: 10,
                                            width: '31%',
                                            alignItems: 'center',
                                        }}>
                                            <Text style={{
                                                color: 'yellow',
                                                fontSize: 12,
                                                fontWeight: 'bold',
                                                marginBottom: 5,
                                                textAlign: 'center',
                                            }}>
                                                24h Average
                                            </Text>
                                            <Text style={{
                                                color: 'white',
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}>
                                                31 μg/m³
                                            </Text>
                                        </View>

                                        {/* Weekly Average Card */}
                                        <View style={{
                                            backgroundColor: '#111',
                                            borderRadius: 10,
                                            padding: 10,
                                            width: '31%',
                                            alignItems: 'center',
                                        }}>
                                            <Text style={{
                                                color: 'yellow',
                                                fontSize: 12,
                                                fontWeight: 'bold',
                                                marginBottom: 5,
                                                textAlign: 'center',
                                            }}>
                                                Weekly Average
                                            </Text>
                                            <Text style={{
                                                color: 'white',
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}>
                                                54 μg/m³
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Text style={styles.noDataText}>No historical data available</Text>
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
