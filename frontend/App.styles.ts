import {StyleSheet} from 'react-native';
import {hp} from './utils/responsive.util';

export const styles = StyleSheet.create({
    backgroundStyle: {
        width: '100%',
        height: '100%',
    },
    container: {
        paddingTop: hp(25),
        width: '100%',
        height: '100%',
        paddingBottom: hp(25),
        backgroundColor: 'black',
    },
});

export const colors = {
    primaryWithDarkBg: '#FFD700',
    secondaryWithDarkBg: '#fcd78b',
};

export const backgrounds = {
    dark: 'rgba(0, 0, 0, 0.6)',
    medium: 'rgba(33,33,33,0.82)',
    light: 'rgba(255,255,255,0.7)',
};
