import React, { useState, useEffect } from 'react';
import type {ReactElement} from 'react';
import type {LahoreGraphProps} from './lahore-graph.types';
import {styles} from './lahore-graph.styles';
import MapView, {PROVIDER_GOOGLE, Marker, Region} from 'react-native-maps';
import {View, Text, ActivityIndicator} from 'react-native';
import {Areas} from '../../../home-screen/components/location-modal/location-modal.types';
import {getAqiColor} from '../../../../utils/aqi-colors.util';
import {useUserActivity} from '../../../../context/UserActivityContext';
import {ACTION_TYPES, ELEMENT_NAMES, SCREEN_NAMES} from '../../../../utils/trackingConstants';
import {getTranslation, Language, TranslationStrings} from '../../../../utils/translations';
import {useSelectedLanguage} from '../../../../context/SelectedLanguageContext';

export function LahoreGraph(props: LahoreGraphProps): ReactElement {
    // Add state for the skeleton loader
    const [isLoading, setIsLoading] = useState(true);

    // Use effect to hide the skeleton loader after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 10000); // 10 seconds

        return () => clearTimeout(timer);
    }, []);

    // Use the activity tracking context
    const {trackActivity} = useUserActivity();
    const {selectedLanguage} = useSelectedLanguage();

    // Default to English if no language is selected
    const currentLanguage = (selectedLanguage || 'Eng') as Language;

    // Hardcoded AQI values for each location - these will be replaced with real data later
    const locationAqiData: Record<string, number> = {
        '1': 45,  // Good
        '2': 85,  // Satisfactory
        '3': 125, // Moderate
        '4': 175, // Unhealthy for Sensitive Group
        '5': 250, // Unhealthy
    };

    // AQI categories for the legend with translation keys
    type AqiCategory = {
        key: keyof TranslationStrings;
        color: string;
    };

    const aqiCategories: AqiCategory[] = [
        { key: 'good', color: '#4CAF50' },
        { key: 'satisfactory', color: '#8BC34A' },
        { key: 'moderate', color: '#FFEB3B' },
        { key: 'unhealthyForSensitive', color: '#FF9800' },
        { key: 'unhealthy', color: '#F44336' },
        { key: 'veryUnhealthy', color: '#9C27B0' },
        { key: 'hazardous', color: '#6D4C41' },
    ];

    // Split categories into two rows for better display
    const firstRowCategories = aqiCategories.slice(0, 4); // first 4 items
    const secondRowCategories = aqiCategories.slice(4); // remaining items

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
                aqi: locationAqiData[location.locationCode],
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
                    <View style={[styles.mapView, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                        <ActivityIndicator size="large" color="black" />
                        <Text style={[
                            { marginTop: 10, color: '#666' },
                            currentLanguage === 'اردو' && {fontSize: 14},
                        ]}>
                            {getTranslation('loading', currentLanguage)}
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
                        {/* Display circles for each location with colors based on AQI value */}
                        {Areas[0].locations.map(location => {
                            const aqi = locationAqiData[location.locationCode];
                            const color = getAqiColor(aqi);
                            const locationName = getLocationName(location.locationName);

                            return (
                                <React.Fragment key={location.locationCode}>
                                    {/*/!* Colored circle for each location *!/*/}
                                    {/*<Circle*/}
                                    {/*    center={{*/}
                                    {/*        latitude: location.latitude,*/}
                                    {/*        longitude: location.longitude,*/}
                                    {/*    }}*/}
                                    {/*    radius={1000}*/}
                                    {/*    fillColor={`${color}80`} // Add transparency*/}
                                    {/*    strokeColor={color}*/}
                                    {/*    strokeWidth={2}*/}
                                    {/*/>*/}

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

            {/* Legend below the map */}
            <View style={styles.belowMapLegend}>
                {/* First row of categories */}
                <View style={styles.legendBelowRow}>
                    {firstRowCategories.map((category, index) => (
                        <View key={index} style={styles.legendBelowItem}>
                            <View style={[styles.legendBelowDot, {backgroundColor: category.color}]} />
                            <Text style={[
                                styles.legendBelowText,
                                currentLanguage === 'اردو' && {fontSize: 14},
                            ]}>
                                {getTranslation(category.key, currentLanguage)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Second row of categories */}
                <View style={styles.legendBelowRow}>
                    {secondRowCategories.map((category, index) => (
                        <View key={index} style={styles.legendBelowItem}>
                            <View style={[styles.legendBelowDot, {backgroundColor: category.color}]} />
                            <Text style={[
                                styles.legendBelowText,
                                currentLanguage === 'اردو' && {fontSize: 14},
                            ]}>
                                {getTranslation(category.key, currentLanguage)}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
