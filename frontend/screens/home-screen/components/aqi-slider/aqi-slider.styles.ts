import {StyleSheet} from 'react-native';
import {wp, hp, fontScale} from '../../../../utils/responsive.util';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    sliderContainer: {
        width: '85%',
        height: hp(25),
        justifyContent: 'center',
    },
    gradientTrack: {
        width: '100%',
        position: 'absolute',
        top: 0,
        height: hp(12),
        borderRadius: wp(10),
    },
    slider: {
        width: '85%',
        height: hp(12),
        position: 'absolute',
        bottom: hp(5),
    },
    arrowContainer: {
        position: 'absolute',
        top: hp(-28),
        transform: [{ translateX: wp(-5) }], // Centers the arrow
    },
    arrow: {
        fontSize: fontScale(24),
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
