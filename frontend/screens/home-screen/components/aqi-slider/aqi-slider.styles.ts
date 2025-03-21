import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    sliderContainer: {
        width: '85%',
        height: 25,
        justifyContent: 'center',
    },
    gradientTrack: {
        width: '100%',
        position: 'absolute',
        top: 0,
        height: 12,
        borderRadius: 10,
    },
    slider: {
        width: '85%',
        height: 12,
        position: 'absolute',
        bottom: 5,
    },
    arrowContainer: {
        position: 'absolute',
        top: -28,
        transform: [{ translateX: -5 }], // Centers the arrow
    },
    arrow: {
        fontSize: 24,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
