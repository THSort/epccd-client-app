import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    sliderContainer: {
        width: '85%',
        height: 20,
        justifyContent: 'center',
    },
    gradientTrack: {
        width: '100%',
        position: 'absolute',
        top: 0,
        height: 10,
        borderRadius: 10,
    },
    slider: {
        width: '85%',
        height: 10,
        position: 'absolute',
        bottom: 5,
    },
    arrowContainer: {
        position: 'absolute',
        top: -28, // Adjust this to position the arrow below the gradient bar
        transform: [{ translateX: -5 }], // Centers the arrow
    },
    arrow: {
        fontSize: 24,
        color: 'white',
    },
});
