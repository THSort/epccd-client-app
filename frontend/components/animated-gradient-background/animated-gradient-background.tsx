import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './animated-gradient-background.styles';
import { darkenColor, lightenColor } from '../../utils/colur.util';
import { AnimatedGradientBackgroundProps } from './animated-gradient-background.types';

const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({ color, children }) => {
    const animation = useRef(new Animated.Value(0)).current;

    const lightColor = lightenColor(color, 0.2);
    const darkColor = darkenColor(color, 0.2);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 10000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ]),
        ).start();
    }, [animation]);

    return (
        <View style={{ flex: 1 }}>
            <Animated.View style={[styles.container]}>
                {/* Gradient 1: Light */}
                <LinearGradient
                    colors={['#000000', lightColor]}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                {/* Gradient 2: Dark (on top) */}
                <Animated.View style={[styles.gradientOverlay, { opacity: animation }]}>
                    <LinearGradient
                        colors={['#000000', darkColor]}
                        style={styles.gradient}
                        start={{ x: 1, y: 1 }}
                        end={{ x: 0, y: 0 }}
                    />
                </Animated.View>
            </Animated.View>

            {/* Children content */}
            {children}
        </View>
    );
};

export default AnimatedGradientBackground;
