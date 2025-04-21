import {StyleSheet} from 'react-native';
import {wp, hp, fontScale} from '../../utils/responsive.util';
import {backgrounds, colors} from '../../App.styles.ts';

export const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: backgrounds.dark, // Dark background
        borderRadius: wp(20),
        paddingVertical: hp(12),
        paddingHorizontal: wp(12),
        borderWidth: 0.5,
        // width: '100%',
        height: hp(50), // Using responsive height
        shadowColor: colors.secondaryWithDarkBg, // Golden glow effect
        justifyContent: 'space-between',
    },
    label: {
        fontSize: fontScale(20),
        fontWeight: 'bold',
        color: colors.secondaryWithDarkBg,
        flex: 1,
    },
    selectedItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedItemText: {
        fontSize: fontScale(18),
        lineHeight: fontScale(20),
        color: colors.secondaryWithDarkBg, // Golden text
        marginLeft: wp(5),
        marginRight: wp(10),
        // maxWidth: wp(220), // Using responsive width
    },
    selectorContextIcon: {
        marginRight: wp(5),
        marginLeft: wp(2),
    },
    dropdownArrowIcon: {
        marginRight: wp(5),
    },
});
