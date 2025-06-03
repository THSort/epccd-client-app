import { StyleSheet } from 'react-native';
import { wp, hp, fontScale } from '../../../../utils/responsive.util';
import {backgrounds} from '../../../../App.styles.ts';

export const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: backgrounds.dark,
        height: hp(70),
        width: '45%',
        paddingHorizontal: wp(12),
        paddingVertical: hp(14),
        borderRadius: 8,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    pollutantName: {
        color: 'yellow',
        fontWeight: 'bold',
        fontSize: fontScale(16),
        lineHeight: fontScale(18),
        flex: 1,
    },
    pollutantValue: {
        color: 'yellow',
        fontWeight: 'bold',
        fontSize: fontScale(14),
        lineHeight: fontScale(16),
        textAlign: 'right',
    },
    pollutantDescription: {
        color: 'yellow',
        fontSize: fontScale(12),
        lineHeight: fontScale(14),
        fontWeight: '300',
        flex: 2,
        paddingRight: wp(5),
    },
    pollutantUnits: {
        color: 'yellow',
        fontSize: fontScale(12),
        lineHeight: fontScale(14),
        fontWeight: '300',
        textAlign: 'right',
        flex: 1,
    },
    historyButton: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: hp(6),
        alignSelf: 'center',
    },
    historyIcon: {
        marginRight: wp(8),
        fontSize: fontScale(12),
    },
    historyText: {
        color: 'yellow',
        fontSize: fontScale(12),
        lineHeight: fontScale(12),
    },
});
