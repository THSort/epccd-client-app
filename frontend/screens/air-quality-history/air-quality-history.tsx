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
import {fetchHistoricalEpaMonitorsData} from '../../services/api.service.ts';
import {FilteredHistoricalDataResponse} from '../../types/epaMonitorsApiResponse.types.ts';
import {TimeRangeSelector} from './components/time-range-selector/time-range-selector.tsx';
import {TimeRange} from './components/time-range-selector/time-range-selector.types.ts';
import {ChartDisplayToggle} from './components/chart-display-toggle/chart-display-toggle.tsx';
import {ChartDisplayMode} from './components/chart-display-toggle/chart-display-toggle.types.ts';
import {PollutantSelector} from './components/pollutant-selector/pollutant-selector.tsx';
import {useUserActivity} from '../../context/UserActivityContext.tsx';

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
                    time // Add the time as a property for easier access
                }));
            case '1w':
                // For oneWeek, we'll handle it directly in the UI
                return [];
            case '1m':
                // For oneMonth, we'll handle it directly in the UI
                return [];
            case '3m':
                // For threeMonths, we'll handle it directly in the UI
                return [];
            case '6m':
                // For sixMonths, we'll handle it directly in the UI
                return [];
            case '1y':
                // For oneYear, we'll handle it directly in the UI
                return [];
            default:
                return [];
        }
    }, [historicalData, timeRange]);

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

                            {historicalData ? (
                                <View style={styles.noDataContainer}>
                                    <Text style={styles.noDataText}>
                                        {timeRange === '1d' 
                                            ? `Showing ${Object.keys(historicalData.oneDay).length} time points for the day` 
                                            : timeRange === '1w'
                                                ? `Showing ${Object.keys(historicalData.oneWeek).length} days of the week`
                                                : timeRange === '1m'
                                                    ? `Showing ${Object.keys(historicalData.oneMonth).length} weeks of the month`
                                                    : timeRange === '3m'
                                                        ? `Showing ${Object.keys(historicalData.threeMonths).length} months (3-month period)`
                                                        : timeRange === '6m'
                                                            ? `Showing ${Object.keys(historicalData.sixMonths).length} months (6-month period)`
                                                            : timeRange === '1y'
                                                                ? `Showing ${Object.keys(historicalData.oneYear).length} quarters of the year`
                                                                : `Showing ${getDataForTimeRange().length} data points for ${timeRange} period`}
                                    </Text>
                                    
                                    {timeRange === '1d' && (
                                        <View style={styles.timePointsContainer}>
                                            {Object.entries(historicalData.oneDay)
                                                .sort((a, b) => {
                                                    // Sort by time (12 AM, 4 AM, 8 AM, 12 PM, 4 PM, 8 PM)
                                                    const timeOrder: Record<string, number> = {
                                                        '12 AM': 0,
                                                        '4 AM': 1,
                                                        '8 AM': 2,
                                                        '12 PM': 3,
                                                        '4 PM': 4,
                                                        '8 PM': 5
                                                    };
                                                    return (timeOrder[a[0]] || 0) - (timeOrder[b[0]] || 0);
                                                })
                                                .map(([time, data]) => (
                                                    <View key={time} style={styles.timePoint}>
                                                        <Text style={styles.timeLabel}>{time}</Text>
                                                        <Text style={styles.valueLabel}>
                                                            {displayMode === 'concentration' 
                                                                ? `${pollutant === Pollutant.PM2_5 
                                                                    ? data.pm2_5_ug_m3.toFixed(2) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.pm10_ug_m3.toFixed(2)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.o3_ppb.toFixed(2)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.no2_ppb.toFixed(2)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.so2_ppb.toFixed(2)
                                                                                    : data.co_ppm.toFixed(2)
                                                                    } ${pollutant === Pollutant.PM2_5 || pollutant === Pollutant.PM10 
                                                                        ? 'μg/m³' 
                                                                        : pollutant === Pollutant.CO 
                                                                            ? 'ppm' 
                                                                            : 'ppb'}`
                                                                : `${pollutant === Pollutant.PM2_5 
                                                                    ? data.PM2_5_AQI.toFixed(0) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.PM10_AQI.toFixed(0)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.O3_AQI.toFixed(0)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.NO2_AQI.toFixed(0)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.SO2_AQI.toFixed(0)
                                                                                    : data.CO_AQI.toFixed(0)
                                                                    } AQI`}
                                                        </Text>
                                                    </View>
                                                ))}
                                        </View>
                                    )}
                                    
                                    {timeRange === '1w' && (
                                        <View style={styles.timePointsContainer}>
                                            {Object.entries(historicalData.oneWeek)
                                                .sort((a, b) => {
                                                    // Sort by day of week (Sunday, Monday, Tuesday, etc.)
                                                    const dayOrder: Record<string, number> = {
                                                        'Sunday': 0,
                                                        'Monday': 1,
                                                        'Tuesday': 2,
                                                        'Wednesday': 3,
                                                        'Thursday': 4,
                                                        'Friday': 5,
                                                        'Saturday': 6
                                                    };
                                                    return (dayOrder[a[0]] || 0) - (dayOrder[b[0]] || 0);
                                                })
                                                .map(([day, data]) => (
                                                    <View key={day} style={styles.timePoint}>
                                                        <Text style={styles.timeLabel}>{day}</Text>
                                                        <Text style={styles.valueLabel}>
                                                            {displayMode === 'concentration' 
                                                                ? `${pollutant === Pollutant.PM2_5 
                                                                    ? data.pm2_5_ug_m3.toFixed(2) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.pm10_ug_m3.toFixed(2)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.o3_ppb.toFixed(2)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.no2_ppb.toFixed(2)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.so2_ppb.toFixed(2)
                                                                                    : data.co_ppm.toFixed(2)
                                                                    } ${pollutant === Pollutant.PM2_5 || pollutant === Pollutant.PM10 
                                                                        ? 'μg/m³' 
                                                                        : pollutant === Pollutant.CO 
                                                                            ? 'ppm' 
                                                                            : 'ppb'}`
                                                                : `${pollutant === Pollutant.PM2_5 
                                                                    ? data.PM2_5_AQI.toFixed(0) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.PM10_AQI.toFixed(0)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.O3_AQI.toFixed(0)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.NO2_AQI.toFixed(0)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.SO2_AQI.toFixed(0)
                                                                                    : data.CO_AQI.toFixed(0)
                                                                    } AQI`}
                                                        </Text>
                                                    </View>
                                                ))}
                                        </View>
                                    )}
                                    
                                    {timeRange === '3m' && (
                                        <View style={styles.timePointsContainer}>
                                            {Object.entries(historicalData.threeMonths)
                                                .sort((a, b) => {
                                                    // Sort months chronologically
                                                    const getDate = (monthYear: string) => {
                                                        const [month, year] = monthYear.split(' ');
                                                        const monthIndex = [
                                                            'January', 'February', 'March', 'April', 'May', 'June',
                                                            'July', 'August', 'September', 'October', 'November', 'December'
                                                        ].indexOf(month);
                                                        return new Date(parseInt(year), monthIndex, 1);
                                                    };
                                                    
                                                    return getDate(a[0]).getTime() - getDate(b[0]).getTime();
                                                })
                                                .map(([monthYear, data]) => (
                                                    <View key={monthYear} style={styles.timePoint}>
                                                        <Text style={styles.timeLabel}>{monthYear}</Text>
                                                        <Text style={styles.valueLabel}>
                                                            {displayMode === 'concentration' 
                                                                ? `${pollutant === Pollutant.PM2_5 
                                                                    ? data.pm2_5_ug_m3.toFixed(2) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.pm10_ug_m3.toFixed(2)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.o3_ppb.toFixed(2)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.no2_ppb.toFixed(2)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.so2_ppb.toFixed(2)
                                                                                    : data.co_ppm.toFixed(2)
                                                                    } ${pollutant === Pollutant.PM2_5 || pollutant === Pollutant.PM10 
                                                                        ? 'μg/m³' 
                                                                        : pollutant === Pollutant.CO 
                                                                            ? 'ppm' 
                                                                            : 'ppb'}`
                                                                : `${pollutant === Pollutant.PM2_5 
                                                                    ? data.PM2_5_AQI.toFixed(0) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.PM10_AQI.toFixed(0)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.O3_AQI.toFixed(0)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.NO2_AQI.toFixed(0)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.SO2_AQI.toFixed(0)
                                                                                    : data.CO_AQI.toFixed(0)
                                                                    } AQI`}
                                                        </Text>
                                                    </View>
                                                ))}
                                        </View>
                                    )}
                                    
                                    {timeRange === '6m' && (
                                        <View style={styles.timePointsContainer}>
                                            {Object.entries(historicalData.sixMonths)
                                                .sort((a, b) => {
                                                    // Sort months chronologically
                                                    const getDate = (monthYear: string) => {
                                                        const [month, year] = monthYear.split(' ');
                                                        const monthIndex = [
                                                            'January', 'February', 'March', 'April', 'May', 'June',
                                                            'July', 'August', 'September', 'October', 'November', 'December'
                                                        ].indexOf(month);
                                                        return new Date(parseInt(year), monthIndex, 1);
                                                    };
                                                    
                                                    return getDate(a[0]).getTime() - getDate(b[0]).getTime();
                                                })
                                                .map(([monthYear, data]) => (
                                                    <View key={monthYear} style={styles.timePoint}>
                                                        <Text style={styles.timeLabel}>{monthYear}</Text>
                                                        <Text style={styles.valueLabel}>
                                                            {displayMode === 'concentration' 
                                                                ? `${pollutant === Pollutant.PM2_5 
                                                                    ? data.pm2_5_ug_m3.toFixed(2) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.pm10_ug_m3.toFixed(2)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.o3_ppb.toFixed(2)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.no2_ppb.toFixed(2)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.so2_ppb.toFixed(2)
                                                                                    : data.co_ppm.toFixed(2)
                                                                    } ${pollutant === Pollutant.PM2_5 || pollutant === Pollutant.PM10 
                                                                        ? 'μg/m³' 
                                                                        : pollutant === Pollutant.CO 
                                                                            ? 'ppm' 
                                                                            : 'ppb'}`
                                                                : `${pollutant === Pollutant.PM2_5 
                                                                    ? data.PM2_5_AQI.toFixed(0) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.PM10_AQI.toFixed(0)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.O3_AQI.toFixed(0)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.NO2_AQI.toFixed(0)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.SO2_AQI.toFixed(0)
                                                                                    : data.CO_AQI.toFixed(0)
                                                                    } AQI`}
                                                        </Text>
                                                    </View>
                                                ))}
                                        </View>
                                    )}
                                    
                                    {timeRange === '1m' && (
                                        <View style={styles.timePointsContainer}>
                                            {Object.entries(historicalData.oneMonth)
                                                .sort((a, b) => {
                                                    // Sort by week chronologically
                                                    // Extract start dates from the format "MM/DD - MM/DD"
                                                    const getStartDate = (weekLabel: string) => {
                                                        const startDateStr = weekLabel.split(' - ')[0];
                                                        const [month, day] = startDateStr.split('/').map(Number);
                                                        // Create a date object (using current year)
                                                        const date = new Date();
                                                        date.setMonth(month - 1); // Months are 0-indexed
                                                        date.setDate(day);
                                                        return date;
                                                    };
                                                    
                                                    const dateA = getStartDate(a[0]);
                                                    const dateB = getStartDate(b[0]);
                                                    
                                                    return dateA.getTime() - dateB.getTime();
                                                })
                                                .map(([week, data]) => (
                                                    <View key={week} style={styles.timePoint}>
                                                        <Text style={styles.timeLabel}>{week}</Text>
                                                        <Text style={styles.valueLabel}>
                                                            {displayMode === 'concentration' 
                                                                ? `${pollutant === Pollutant.PM2_5 
                                                                    ? data.pm2_5_ug_m3.toFixed(2) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.pm10_ug_m3.toFixed(2)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.o3_ppb.toFixed(2)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.no2_ppb.toFixed(2)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.so2_ppb.toFixed(2)
                                                                                    : data.co_ppm.toFixed(2)
                                                                    } ${pollutant === Pollutant.PM2_5 || pollutant === Pollutant.PM10 
                                                                        ? 'μg/m³' 
                                                                        : pollutant === Pollutant.CO 
                                                                            ? 'ppm' 
                                                                            : 'ppb'}`
                                                                : `${pollutant === Pollutant.PM2_5 
                                                                    ? data.PM2_5_AQI.toFixed(0) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.PM10_AQI.toFixed(0)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.O3_AQI.toFixed(0)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.NO2_AQI.toFixed(0)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.SO2_AQI.toFixed(0)
                                                                                    : data.CO_AQI.toFixed(0)
                                                                    } AQI`}
                                                        </Text>
                                                    </View>
                                                ))}
                                        </View>
                                    )}
                                    
                                    {timeRange === '1y' && (
                                        <View style={styles.timePointsContainer}>
                                            {Object.entries(historicalData.oneYear)
                                                .sort((a, b) => {
                                                    // Sort quarters chronologically based on standard quarters
                                                    const quarterOrder: Record<string, number> = {
                                                        'January - March': 0,
                                                        'April - June': 1,
                                                        'July - September': 2,
                                                        'October - December': 3
                                                    };
                                                    
                                                    return (quarterOrder[a[0]] ?? 0) - (quarterOrder[b[0]] ?? 0);
                                                })
                                                .map(([quarter, data]) => (
                                                    <View key={quarter} style={styles.timePoint}>
                                                        <Text style={styles.timeLabel}>{quarter}</Text>
                                                        <Text style={styles.valueLabel}>
                                                            {displayMode === 'concentration' 
                                                                ? `${pollutant === Pollutant.PM2_5 
                                                                    ? data.pm2_5_ug_m3.toFixed(2) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.pm10_ug_m3.toFixed(2)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.o3_ppb.toFixed(2)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.no2_ppb.toFixed(2)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.so2_ppb.toFixed(2)
                                                                                    : data.co_ppm.toFixed(2)
                                                                    } ${pollutant === Pollutant.PM2_5 || pollutant === Pollutant.PM10 
                                                                        ? 'μg/m³' 
                                                                        : pollutant === Pollutant.CO 
                                                                            ? 'ppm' 
                                                                            : 'ppb'}`
                                                                : `${pollutant === Pollutant.PM2_5 
                                                                    ? data.PM2_5_AQI.toFixed(0) 
                                                                    : pollutant === Pollutant.PM10 
                                                                        ? data.PM10_AQI.toFixed(0)
                                                                        : pollutant === Pollutant.O3
                                                                            ? data.O3_AQI.toFixed(0)
                                                                            : pollutant === Pollutant.NO2
                                                                                ? data.NO2_AQI.toFixed(0)
                                                                                : pollutant === Pollutant.SO2
                                                                                    ? data.SO2_AQI.toFixed(0)
                                                                                    : data.CO_AQI.toFixed(0)
                                                                    } AQI`}
                                                        </Text>
                                                    </View>
                                                ))}
                                        </View>
                                    )}
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
