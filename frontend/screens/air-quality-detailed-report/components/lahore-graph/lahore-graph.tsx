import React from 'react';
import type {ReactElement} from 'react';
import type {LahoreGraphProps} from './lahore-graph.types';
import {styles} from './lahore-graph.styles';
import MapView, {PROVIDER_GOOGLE, Marker, Circle, Region} from 'react-native-maps';
import {View, Text} from 'react-native';
import {Areas} from '../../../home-screen/components/location-modal/location-modal.types';
import {getAqiColor} from '../../../../utils/aqi-colors.util';
import {useUserActivity} from '../../../../context/UserActivityContext';
import {ACTION_TYPES, ELEMENT_NAMES, SCREEN_NAMES} from '../../../../utils/trackingConstants';

export function LahoreGraph(props: LahoreGraphProps): ReactElement {
    // Use the activity tracking context
    const {trackActivity} = useUserActivity();

    // Hardcoded AQI values for each location - these will be replaced with real data later
    const locationAqiData: Record<string, number> = {
        '1': 45,  // Good
        '2': 85,  // Moderate
        '3': 145, // Unhealthy for Sensitive Groups
        '4': 175, // Unhealthy
        '5': 220, // Very Unhealthy
    };

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
        <View style={styles.container}>
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
                            {/* Colored circle for each location */}
                            <Circle
                                center={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                }}
                                radius={1000}
                                fillColor={`${color}80`} // Add transparency
                                strokeColor={color}
                                strokeWidth={2}
                            />

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

            {/* New Legend - Horizontal dark bar with colored dots */}
            <View style={styles.newLegend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: '#00E400'}]} />
                    <Text style={styles.legendItemText}>Good</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: '#FFFF00'}]} />
                    <Text style={styles.legendItemText}>Moderate</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: '#FF0000'}]} />
                    <Text style={styles.legendItemText}>Poor</Text>
                </View>
            </View>
        </View>
    );
}
