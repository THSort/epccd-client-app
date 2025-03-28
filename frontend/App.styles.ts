import {StyleSheet} from 'react-native';
import {hp} from './utils/responsive.util';

export const styles = StyleSheet.create({
    backgroundStyle: {
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
    },
    container: {
        paddingTop: hp(25),
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        paddingBottom: hp(25),
    },
});
