import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './aqi-slider.styles.ts';

interface AQISliderProps {
    aqi: number;
}

export function AQISlider({ aqi }: AQISliderProps) {
    // Ensure AQI value stays within bounds (0-500)
    const normalizedAqi = Math.min(Math.max(aqi, 0), 500);

    // Calculate arrow position as a percentage of the track width
    // Limit to 98% to prevent arrow from going beyond the track's right edge
    const arrowPosition = Math.min((normalizedAqi / 500) * 100, 98);

    return (
        <View style={styles.container}>
            <View style={styles.sliderContainer}>
                <LinearGradient
                    colors={[
                        '#4CAF50', // Good (0-50)
                        '#8BC34A', // Satisfactory (51-100)
                        '#FFEB3B', // Moderate (101-150)
                        '#FF9800', // Unhealthy for sensitive group (151-200)
                        '#F44336', // Unhealthy (201-300)
                        '#9C27B0', // Very Unhealthy (301-400)
                        '#6D4C41'  // Hazardous (401-500+)
                    ]}
                    locations={[0, 0.2, 0.3, 0.4, 0.6, 0.8, 1]} // Position stops to match AQI ranges
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.gradientTrack}
                />
                {/* Arrow Indicator */}
                <View style={[styles.arrowContainer, { left: `${arrowPosition}%` }]}>
                    <Text style={styles.arrow}>▼</Text>
                </View>
            </View>
        </View>
    );
}
