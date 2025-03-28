import { StyleSheet } from 'react-native';
import { wp, hp, fontScale } from '../../../../utils/responsive.util';

export const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#40320A',
        height: hp(95),
        width: '100%',
        paddingHorizontal: wp(12),
        paddingVertical: hp(14),
        borderRadius: 8,
        marginBottom: hp(10),
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
        fontSize: fontScale(20),
        lineHeight: fontScale(22),
        flex: 1,
    },
    pollutantValue: {
        color: 'yellow',
        fontWeight: 'bold',
        fontSize: fontScale(20),
        lineHeight: fontScale(22),
        textAlign: 'right',
    },
    pollutantDescription: {
        color: 'yellow',
        fontSize: fontScale(15),
        lineHeight: fontScale(20),
        fontWeight: '300',
        flex: 2,
        paddingRight: wp(5),
    },
    pollutantUnits: {
        color: 'yellow',
        fontSize: fontScale(15),
        lineHeight: fontScale(20),
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
        fontSize: fontScale(15),
    },
    historyText: {
        color: 'yellow',
        fontSize: fontScale(15),
        lineHeight: fontScale(15),
    },
});
