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
import {FilteredHistoricalDataResponse, PollutantSummaryResponse} from '../../types/epaMonitorsApiResponse.types.ts';
import {TimeRangeSelector} from './components/time-range-selector/time-range-selector.tsx';
import {TimeRange} from './components/time-range-selector/time-range-selector.types.ts';
import {ChartDisplayToggle} from './components/chart-display-toggle/chart-display-toggle.tsx';
import {ChartDisplayMode} from './components/chart-display-toggle/chart-display-toggle.types.ts';
import {PollutantSelector} from './components/pollutant-selector/pollutant-selector.tsx';
import {useUserActivity} from '../../context/UserActivityContext.tsx';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';
import {getTranslation, Language, getTranslatedNumber} from '../../utils/translations';
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
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = (selectedLanguage || 'Eng') as Language;

    const {selectedLocation, selectedPollutant} = route.params;
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();

    const [pollutant, setPollutant] = useState<Pollutant>(selectedPollutant);
    const [historicalData, setHistoricalData] = useState<FilteredHistoricalDataResponse | null>(null);
    const [summaryData, setSummaryData] = useState<PollutantSummaryResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('1m');
    const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('concentration');

    // Map pollutant types to translation keys
    const getPollutantTranslation = useCallback((pollutantType: Pollutant, type: 'name' | 'description' | 'unit'): string => {
        switch (pollutantType) {
            case Pollutant.PM2_5:
                if (type === 'name') return getTranslation('pm25', currentLanguage);
                if (type === 'description') return getTranslation('pm25Description', currentLanguage);
                return getTranslation('ugm3', currentLanguage);
            case Pollutant.PM10:
                if (type === 'name') return getTranslation('pm10', currentLanguage);
                if (type === 'description') return getTranslation('pm10Description', currentLanguage);
                return getTranslation('ugm3', currentLanguage);
            case Pollutant.O3:
                if (type === 'name') return getTranslation('o3', currentLanguage);
                if (type === 'description') return getTranslation('o3Description', currentLanguage);
                return getTranslation('ppb', currentLanguage);
            case Pollutant.SO2:
                if (type === 'name') return getTranslation('so2', currentLanguage);
                if (type === 'description') return getTranslation('so2Description', currentLanguage);
                return getTranslation('ppb', currentLanguage);
            case Pollutant.NO2:
                if (type === 'name') return getTranslation('no2', currentLanguage);
                if (type === 'description') return getTranslation('no2Description', currentLanguage);
                return getTranslation('ppb', currentLanguage);
            case Pollutant.CO:
                if (type === 'name') return getTranslation('co', currentLanguage);
                if (type === 'description') return getTranslation('coDescription', currentLanguage);
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
            console.log('One year data (quarterly averages):', data.oneYear);
            setHistoricalData(data);
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
            const data = await fetchPollutantSummary(selectedLocation);
            console.log('Summary data fetched:', data);
            setSummaryData(data);
        } catch (error) {
            console.error('Error fetching summary data:', error);
            // Don't set error state here to avoid blocking the UI if only summary data fails
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
                    return getTranslation('ugm3', currentLanguage);
                case Pollutant.CO:
                    return getTranslation('ppm', currentLanguage);
                default:
                    return getTranslation('ppb', currentLanguage);
            }
        } else {
            return getTranslation('aqi', currentLanguage);
        }
    }, [pollutant, displayMode, currentLanguage]);

    // Get the current value from summary data based on selected pollutant and display mode
    const getCurrentValue = useCallback(() => {
        if (!summaryData) return 0;
        
        return getValueForPollutant(summaryData.current);
    }, [summaryData, getValueForPollutant]);

    // Get the 24h average value from summary data based on selected pollutant and display mode
    const getDailyAvgValue = useCallback(() => {
        if (!summaryData) return 0;
        
        return getValueForPollutant(summaryData.daily_avg);
    }, [summaryData, getValueForPollutant]);

    // Get the weekly average value from summary data based on selected pollutant and display mode
    const getWeeklyAvgValue = useCallback(() => {
        if (!summaryData) return 0;
        
        return getValueForPollutant(summaryData.weekly_avg);
    }, [summaryData, getValueForPollutant]);

    // Sort data chronologically based on time range
    const getSortedData = useCallback(() => {
        const data = getDataForTimeRange();

        if (timeRange === '1d') {
            // Define the expected order of time slots (now with 3-hour intervals)
            const timeOrder: Record<string, number> = {
                '12 AM': 0,
                '3 AM': 1,
                '6 AM': 2,
                '9 AM': 3,
                '12 PM': 4,
                '3 PM': 5,
                '6 PM': 6,
                '9 PM': 7,
            };
            
            // Sort by time, but only include time slots that exist in the data
            // This handles the case where future time slots are filtered out by the backend
            return [...data].sort((a, b) => {
                const orderA = timeOrder[a.time] !== undefined ? timeOrder[a.time] : Number.MAX_SAFE_INTEGER;
                const orderB = timeOrder[b.time] !== undefined ? timeOrder[b.time] : Number.MAX_SAFE_INTEGER;
                return orderA - orderB;
            });
        } else if (timeRange === '1w') {
            // For the 1-week view, we want to sort chronologically from oldest to newest
            // The backend now sends data for the past 7 days with "Today" and "Yesterday" labels
            // and the rest as day names (e.g., "Mon", "Tue", etc.)
            
            // Create a mapping to determine the order
            // We'll use numbers to represent days ago (0 = today, 1 = yesterday, etc.)
            const today = new Date();
            const dayMapping: Record<string, number> = {
                'Today': 0,
                'Yesterday': 1
            };
            
            // For the other days, calculate how many days ago they were
            for (let i = 2; i < 7; i++) {
                const pastDate = new Date(today);
                pastDate.setDate(pastDate.getDate() - i);
                const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][pastDate.getDay()];
                dayMapping[dayName] = i;
            }
            
            // Sort the data by days ago (oldest first)
            return [...data].sort((a, b) => {
                const daysAgoA = dayMapping[a.time] !== undefined ? dayMapping[a.time] : Number.MAX_SAFE_INTEGER;
                const daysAgoB = dayMapping[b.time] !== undefined ? dayMapping[b.time] : Number.MAX_SAFE_INTEGER;
                return daysAgoB - daysAgoA; // Reverse order (oldest first)
            });
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
                    // Use the custom labels (Today, Yesterday, Sun, Mon, etc.)
                    return item.time;
                } else if (timeRange === '1m') {
                    // Format week ranges as dd/mm/yy for start date
                    // Example: "5/15 - 5/21" becomes "15/05/23"
                    try {
                        const startDateStr = item.time.split(' - ')[0];
                        const [month, day] = startDateStr.split('/').map(Number);
                        const date = new Date();
                        date.setMonth(month - 1);
                        date.setDate(day);
                        // Format as dd/mm/yy with Urdu numerals
                        const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
                        return getTranslatedNumber(formattedDate, currentLanguage);
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
                        const formattedDate = `${monthIndex.toString().padStart(2, '0')}/${year.slice(-2)}`;
                        return getTranslatedNumber(formattedDate, currentLanguage);
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
                        const formattedDate = `${monthIndex.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
                        return getTranslatedNumber(formattedDate, currentLanguage);
                    } catch (e) {
                        return item.time;
                    }
                }
                
                // If the time is already in a date format like "15/02/25", translate it directly
                if (/^\d{2}\/\d{2}\/\d{2}$/.test(item.time)) {
                    return getTranslatedNumber(item.time, currentLanguage);
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
            legend: [`${getPollutantTranslation(pollutant, 'name')} ${getUnitForPollutant()}`],
        };
    }, [getSortedData, getValueForPollutant, getUnitForPollutant, pollutant, timeRange, getPollutantTranslation, currentLanguage]);

    const chartData = useMemo(() => {
        return prepareChartData();
    }, [prepareChartData]);

    useEffect(() => {
        fetchHistoricalData();
        fetchSummaryData();
    }, [fetchHistoricalData, fetchSummaryData]);

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

                            {historicalData && getSortedData().length > 0 ? (
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

                                        <LineChart
                                            data={chartData}
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
                                                formatYLabel: (label) => getTranslatedNumber(label, currentLanguage),
                                                formatXLabel: (label) => {
                                                    // Check if the label is a date in format dd/mm/yy
                                                    if (/^\d{2}\/\d{2}\/\d{2}$/.test(label)) {
                                                        return getTranslatedNumber(label, currentLanguage);
                                                    }
                                                    
                                                    // Check if the label is already translated (contains Urdu numerals)
                                                    if (/[\u0660-\u0669\u06F0-\u06F9]/.test(label)) {
                                                        return label;
                                                    }
                                                    
                                                    // For time labels like "12 AM", "3 PM", etc.
                                                    if (timeRange === '1d' && /\d+\s+(AM|PM)/.test(label)) {
                                                        return label.replace(/\d+/, (match) => getTranslatedNumber(match, currentLanguage));
                                                    }
                                                    
                                                    // For day labels in 1w view (Today, Yesterday, Mon, Tue, etc.)
                                                    if (timeRange === '1w') {
                                                        return label; // Keep as is since these are text labels
                                                    }
                                                    
                                                    return label;
                                                },
                                                propsForLabels: {
                                                    fontSize: 10,
                                                },
                                            }}
                                            bezier
                                            style={styles.chart}
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
                                    <View style={styles.statsCardsContainer}>
                                        {/* Current Value Card */}
                                        <View style={styles.statCard}>
                                            <Text style={styles.statCardTitle}>
                                                {getTranslation('currentValue', currentLanguage)}
                                            </Text>
                                            <Text style={styles.statCardValue}>
                                                {getTranslatedNumber(getCurrentValue().toFixed(1), currentLanguage)} {getUnitForPollutant()}
                                            </Text>
                                        </View>

                                        {/* 24h Average Card */}
                                        <View style={styles.statCard}>
                                            <Text style={styles.statCardTitle}>
                                                {getTranslation('dailyAverage', currentLanguage)}
                                            </Text>
                                            <Text style={styles.statCardValue}>
                                                {getTranslatedNumber(getDailyAvgValue().toFixed(displayMode === 'concentration' ? 2 : 0), currentLanguage)} {getUnitForPollutant()}
                                            </Text>
                                        </View>

                                        {/* Weekly Average Card */}
                                        <View style={styles.statCard}>
                                            <Text style={styles.statCardTitle}>
                                                {getTranslation('weeklyAverage', currentLanguage)}
                                            </Text>
                                            <Text style={styles.statCardValue}>
                                                {getTranslatedNumber(getWeeklyAvgValue().toFixed(displayMode === 'concentration' ? 2 : 0), currentLanguage)} {getUnitForPollutant()}
                                            </Text>
                                        </View>
                                    </View>
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
