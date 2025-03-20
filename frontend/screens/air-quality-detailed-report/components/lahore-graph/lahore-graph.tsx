import React from 'react';
import type {ReactElement} from 'react';
import type {LahoreGraphProps} from './lahore-graph.types';
import {styles} from './lahore-graph.styles';
import MapView, {PROVIDER_GOOGLE, Marker, Circle} from 'react-native-maps';
import {View, Text} from 'react-native';
import {Areas} from '../../../home-screen/components/location-modal/location-modal.types';
import {getAqiColor} from '../../../../utils/aqi-colors.util';

export function LahoreGraph(_props: LahoreGraphProps): ReactElement {
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

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.mapView}
                region={{
                    latitude: 31.5204,
                    longitude: 74.3587,
                    latitudeDelta: 0.2,
                    longitudeDelta: 0.2,
                }}
                zoomEnabled={true}
                zoomControlEnabled={true}
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
