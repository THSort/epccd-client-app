import {ReactElement, useState, useEffect, useCallback} from 'react';
import React from 'react';
import {Text, TouchableOpacity, View, ActivityIndicator, ScrollView} from 'react-native';
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
import {EpaMonitorsApiResponse} from '../../types/epaMonitorsApiResponse.types.ts';
import {TimeRangeSelector} from './components/time-range-selector/time-range-selector.tsx';
import {TimeRange} from './components/time-range-selector/time-range-selector.types.ts';
import {ChartDisplayToggle} from './components/chart-display-toggle/chart-display-toggle.tsx';
import {ChartDisplayMode} from './components/chart-display-toggle/chart-display-toggle.types.ts';
import {PollutantSelector} from './components/pollutant-selector/pollutant-selector.tsx';

type RootStackParamList = {
    AirQualityHistory: {
        selectedLocation?: Location;
        selectedPollutant: Pollutant;
    };
};

type Props = NativeStackScreenProps<RootStackParamList, 'AirQualityHistory'>;

export function AirQualityHistory({route}: Props): ReactElement {
    const navigation = useNavigation<AirQualityHistoryNavigationProps>();

    const {selectedLocation, selectedPollutant} = route.params;
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();

    const [pollutant, setPollutant] = useState<Pollutant>(selectedPollutant);
    const [historicalData, setHistoricalData] = useState<EpaMonitorsApiResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('1m');
    const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('concentration');

    const fetchHistoricalData = useCallback(async () => {
        if (!selectedLocation) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchHistoricalEpaMonitorsData(selectedLocation);
            console.log('Historical data fetched:', data.length, 'records', data);
            setHistoricalData(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            setError('Failed to load historical air quality data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedLocation]);

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
                <TouchableOpacity onPress={() => navigation.goBack()}>
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
                        onOpenLocationModal={openLocationModal}
                    />
                    <PollutantSelector
                        selectedPollutant={pollutant}
                        onPollutantSelected={setPollutant}
                    />

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : (
                        <>
                            <TimeRangeSelector
                                selectedTimeRange={timeRange}
                                onTimeRangeSelected={setTimeRange}
                            />

                            <ChartDisplayToggle
                                selectedMode={displayMode}
                                onModeSelected={setDisplayMode}
                            />

                            {historicalData.length > 0 ? (
                                <View style={styles.noDataContainer}>
                                    <Text style={styles.noDataText}>historical data here in chart</Text>
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
