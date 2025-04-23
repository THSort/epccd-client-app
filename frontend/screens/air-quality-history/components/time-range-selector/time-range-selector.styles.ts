import {StyleSheet} from 'react-native';
import {colors} from '../../../../App.styles.ts';
import {hp} from '../../../../utils/responsive.util.ts';

export const styles = StyleSheet.create({
    scrollContainer: {
        marginVertical: hp(15),
    },
    container: {
        flexDirection: 'row',
        backgroundColor: '#222',
        borderRadius: 10,
        padding: 5,
    },
    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginHorizontal: 3,
        minWidth: 65,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedOption: {
        backgroundColor: colors.primaryWithDarkBg,
    },
    optionText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    selectedOptionText: {
        color: 'black',
        fontWeight: 'bold',
    },
});
