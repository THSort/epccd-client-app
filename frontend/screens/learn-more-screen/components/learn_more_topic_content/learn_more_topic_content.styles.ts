import {StyleSheet} from 'react-native';
import {colors} from '../../../../App.styles.ts';
import {hp, fontScale} from '../../../../utils/responsive.util';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: hp(2),
        paddingVertical: hp(20),
    },
    content: {
        color: colors.primaryWithDarkBg,
        fontSize: fontScale(25),
        lineHeight: fontScale(28),
        textAlign: 'justify',
    },
    paragraph: {
        marginBottom: fontScale(30),
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: hp(20),
        width: '100%',
        height: hp(250),
        overflow: 'hidden',
        marginTop: hp(-30),
    },
    image: {
        width: '100%',
        height: '100%',
        transform: [{scale: 1.2}],
    },
    caption: {
        color: colors.primaryWithDarkBg,
        fontSize: fontScale(18),
        lineHeight: fontScale(28),
        textAlign: 'center',
        marginTop: hp(-30),
    },
});
