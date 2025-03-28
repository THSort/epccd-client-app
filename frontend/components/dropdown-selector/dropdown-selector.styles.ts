import {StyleSheet} from 'react-native';
import {wp, hp, fontScale} from '../../utils/responsive.util';

export const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1C', // Dark background
        borderRadius: wp(20),
        paddingVertical: hp(8),
        paddingHorizontal: wp(12),
        borderWidth: 1,
        borderColor: '#FFD700', // Golden border
        width: wp(255), // Using responsive width
        height: hp(45), // Using responsive height
        justifyContent: 'space-between',
        shadowColor: '#FFD700', // Golden glow effect
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
    },
    label: {
        fontSize: fontScale(20),
        fontWeight: 'bold',
        color: '#FFD700', // Golden text
        flex: 1,
    },
    selectedItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedItemText: {
        fontSize: fontScale(18),
        color: '#FFD700', // Golden text
        marginLeft: wp(5),
        marginRight: wp(10),
        maxWidth: wp(190), // Using responsive width
    },
    icon: {
        marginRight: wp(3),
    },
});
