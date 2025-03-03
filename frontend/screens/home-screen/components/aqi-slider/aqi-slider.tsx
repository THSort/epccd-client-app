import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import {styles} from './aqi-slider.styles.ts';

export function AQISlider() {
    return (
        <View style={styles.container}>
            <View style={styles.sliderContainer}>
                <LinearGradient
                    colors={['#00E400', '#FFFF00', '#FF7E00', '#FF0000']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.gradientTrack}
                />
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue= {300}
                    step={1}
                    value={40}
                    onValueChange={()=>{}}
                    minimumTrackTintColor="transparent"
                    maximumTrackTintColor="transparent"
                    thumbTintColor="#fff"
                />
            </View>
        </View>
    );
}
