import { StyleSheet } from 'react-native';
import { wp, hp, fontScale } from '../../utils/responsive.util';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(15),
    },
    headerTitle: {
        fontSize: fontScale(25),
        fontWeight: 'bold',
        color: 'yellow',
        marginLeft: wp(10),
    },
    locationSelector: {
        paddingHorizontal: wp(10),
    },
    aqiContainer: {
        paddingHorizontal: wp(24),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(10),
        minHeight: hp(60),
    },
    aqiDetails: {
        flexDirection: 'column',
    },
    aqiValue: {
        fontSize: fontScale(20),
        fontWeight: 'bold',
        color: 'yellow',
    },
    aqiStatus: {
        fontSize: fontScale(14),
        color: 'yellow',
    },
    updateLabel: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: 'yellow',
        textAlign: 'center',
    },
    updateTime: {
        fontSize: fontScale(12),
        color: 'yellow',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'yellow',
        marginVertical: hp(10),
    },
    pollutantContainer: {
        flex: 1,
        paddingHorizontal: wp(25),
    },
    pollutantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(10),
    },
    pollutantTitle: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: 'yellow',
    },
    pollutantList: {
        flex: 1,
    },
    pollutantListContent: {
        alignItems: 'center',
        paddingVertical: hp(10),
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: hp(200),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: hp(200),
    },
    errorText: {
        color: 'red',
        fontSize: fontScale(16),
        textAlign: 'center',
        padding: wp(20),
    },
});
