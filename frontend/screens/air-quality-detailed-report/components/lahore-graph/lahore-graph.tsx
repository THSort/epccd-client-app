import React, {useState, useEffect} from 'react';
import type {ReactElement} from 'react';
import type {LahoreGraphProps} from './lahore-graph.types';
import {styles} from './lahore-graph.styles';
import MapView, {PROVIDER_GOOGLE, Marker, Region} from 'react-native-maps';
import {View, Text, ActivityIndicator} from 'react-native';
import {Areas} from '../../../home-screen/components/location-modal/location-modal.types';
import {getAqiColor} from '../../../../utils/aqi-colors.util';
import {useUserActivity} from '../../../../context/UserActivityContext';
import {ACTION_TYPES, ELEMENT_NAMES, SCREEN_NAMES} from '../../../../utils/trackingConstants';
import {getTranslation, Language} from '../../../../utils/translations';
import {useSelectedLanguage} from '../../../../context/SelectedLanguageContext';
import {fetchLahoreLocationsAqi, LahoreLocationAqiData} from '../../../../services/api.service';
import {AqiLegend} from '../../../../components/aqi-legend/aqi-legend.tsx';

export function LahoreGraph(props: LahoreGraphProps): ReactElement {
    // Replace hardcoded data with state loaded from API
    const [isLoading, setIsLoading] = useState(true);
    const [locationsAqiData, setLocationsAqiData] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);

    // Use the activity tracking context
    const {trackActivity} = useUserActivity();
    const {selectedLanguage} = useSelectedLanguage();

    // Default to English if no language is selected
    const currentLanguage = (selectedLanguage || 'Eng') as Language;

    // Fetch Lahore locations AQI data from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const data = await fetchLahoreLocationsAqi();

                // Convert the array of location data to the record format we need
                const aqiDataRecord: Record<string, number> = {};
                data.forEach((location: LahoreLocationAqiData) => {
                    aqiDataRecord[location.locationCode] = location.aqi;
                });

                setLocationsAqiData(aqiDataRecord);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching Lahore locations AQI data:', err);
                setError(getTranslation('failedToLoadMap', currentLanguage));
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentLanguage]);

    // Function to get location name without ", Lahore" suffix
    const getLocationName = (fullName: string): string => {
        return fullName.replace(', Lahore', '');
    };

    // Handle map region change (dragging, zooming)
    const handleRegionChange = (region: Region) => {
        trackActivity(
            ACTION_TYPES.NAVIGATION,
            {
                action_name: ELEMENT_NAMES.MAP_REGION_CHANGE,
                screen_name: SCREEN_NAMES.DETAILED_REPORT,
                latitude: region.latitude,
                longitude: region.longitude,
                latitudeDelta: region.latitudeDelta,
                longitudeDelta: region.longitudeDelta,
                timestamp: new Date().toISOString(),
            }
        );
    };

    // Handle map press
    const handleMapPress = (event: any) => {
        trackActivity(
            ACTION_TYPES.SELECTION,
            {
                action_name: ELEMENT_NAMES.MAP_PRESS,
                screen_name: SCREEN_NAMES.DETAILED_REPORT,
                latitude: event.nativeEvent.coordinate.latitude,
                longitude: event.nativeEvent.coordinate.longitude,
                timestamp: new Date().toISOString(),
            }
        );
    };

    // Handle marker press
    const handleMarkerPress = (location: any) => {
        trackActivity(
            ACTION_TYPES.SELECTION,
            {
                action_name: ELEMENT_NAMES.MAP_MARKER_PRESS,
                screen_name: SCREEN_NAMES.DETAILED_REPORT,
                location_code: location.locationCode,
                location_name: location.locationName,
                aqi: locationsAqiData[location.locationCode] || 0,
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: new Date().toISOString(),
            }
        );
    };

    return (
        <View style={styles.containerWithLegend}>
            <View style={styles.mapContainer}>
                {isLoading ? (
                    <View style={[styles.mapView, {backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center'}]}>
                        <ActivityIndicator size="large" color="#FFEB3B"/>
                        <Text style={[
                            {marginTop: 10, color: '#666'},
                            currentLanguage === 'اردو' && {fontSize: 14},
                        ]}>
                            {getTranslation('loading', currentLanguage)}
                        </Text>
                    </View>
                ) : error ? (
                    <View style={[styles.mapView, {backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center'}]}>
                        <Text style={[
                            {color: '#F44336'},
                            currentLanguage === 'اردو' && {fontSize: 14},
                        ]}>
                            {getTranslation('failedToLoadMap', currentLanguage)}
                        </Text>
                    </View>
                ) : (
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.mapView}
                        region={{
                            latitude: props.selectedLocation?.latitude ?? 31.5204,
                            longitude: props.selectedLocation?.longitude ?? 74.3587,
                            latitudeDelta: 0.03,
                            longitudeDelta: 0.03,
                        }}
                        zoomEnabled={true}
                        zoomControlEnabled={true}
                        onRegionChangeComplete={handleRegionChange}
                        onPress={handleMapPress}
                    >
                        {/* Display markers for each location with colors based on AQI value */}
                        {Areas[0].locations.map(location => {
                            const aqi = locationsAqiData[location.locationCode] || 0;
                            const color = getAqiColor(aqi);
                            const locationName = getLocationName(location.locationName);

                            return (
                                <React.Fragment key={location.locationCode}>
                                    {/* Default marker */}
                                    <Marker
                                        title={locationName}
                                        description={`AQI: ${aqi}`}
                                        coordinate={{
                                            latitude: location.latitude,
                                            longitude: location.longitude,
                                        }}
                                        pinColor={color}
                                        onPress={() => handleMarkerPress(location)}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </MapView>
                )}
            </View>

            <View style={styles.legendContainer}>
                <AqiLegend/>
            </View>
        </View>
    );
}
