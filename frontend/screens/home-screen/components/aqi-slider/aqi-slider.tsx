import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './aqi-slider.styles.ts';

interface AQISliderProps {
    aqi: number;
}

export function AQISlider({ aqi }: AQISliderProps) {
    // Ensure AQI value stays within bounds
    const normalizedAqi = Math.min(Math.max(aqi, 0), 170);

    // Calculate arrow position as a percentage of the track width
    // Limit to 98% to prevent arrow from going beyond the track's right edge
    const arrowPosition = Math.min((normalizedAqi / 170) * 100, 98);

    return (
        <View style={styles.container}>
            <View style={styles.sliderContainer}>
                <LinearGradient
                    colors={['#00E400', '#FFFF00', '#FF7E00', '#FF0000']}
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
