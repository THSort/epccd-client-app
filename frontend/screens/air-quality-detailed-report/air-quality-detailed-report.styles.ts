import {StyleSheet} from 'react-native';
import {wp, hp, fontScale} from '../../utils/responsive.util';
import {backgrounds, colors} from '../../App.styles.ts';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
        position: 'relative',
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(15),
        backgroundColor: 'black',
        borderBottomColor: colors.secondaryWithDarkBg,
        borderBottomWidth: 1,
        marginBottom: hp(10),
    },
    headerTitle: {
        marginLeft: wp(10),
    },
    scrollableContent: {
        flex: 1,
    },
    scrollableContentContainer: {
        flexGrow: 1,
    },
    locationSelector: {
        paddingHorizontal: wp(10),
    },
    aqiContainer: {
        display: 'flex',
        paddingHorizontal: wp(24),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: hp(60),
        paddingVertical: hp(10),
        marginHorizontal: hp(15),
    },
    aqiDetails: {
        flexDirection: 'row',
    },
    aqiStatus: {
        fontSize: fontScale(14),
        color: colors.primaryWithDarkBg,
    },
    updateLabel: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: colors.primaryWithDarkBg,
        textAlign: 'center',
    },
    updateTime: {
        fontSize: fontScale(12),
        color: colors.primaryWithDarkBg,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: colors.primaryWithDarkBg,
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
        color: colors.primaryWithDarkBg,
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
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: hp(200),
        backgroundColor: backgrounds.dark,
        height: 400,
        marginTop: hp(30),
        marginHorizontal: hp(15),
        borderRadius: 20,
    },
    errorText: {
        textAlign: 'center',
        padding: wp(20),
        fontSize: fontScale(24),
        color: 'red',
    },
    lastUpdatedContainer: {
        padding: 10,
        marginTop: 5,
        // marginBottom: 10,
        alignItems: 'center',
    },
    lastUpdatedText: {
        color: '#FFFFFF',
        fontSize: fontScale(12),
        textAlign: 'center',
    },
    outdatedWarningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: backgrounds.medium,
        padding: 10,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 152, 0, 0.3)',
    },
    outdatedWarningText: {
        color: '#FF9800',
        fontSize: fontScale(12),
        marginLeft: 5,
        fontWeight: '500',
    },
});
