import {StyleSheet} from 'react-native';
import {wp, hp, fontScale} from '../../utils/responsive.util';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'black',
        position: 'relative',
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    locationDisplayContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(30), // Using responsive height
    },
    locationDisplayText: {
        fontSize: fontScale(20),
        lineHeight: fontScale(22),
        color: 'yellow',
        textAlign: 'center',
    },
    locationDisplayIcon: {
        fontSize: fontScale(20),
        lineHeight: fontScale(20),
        color: 'yellow',
        textAlign: 'center',
        marginRight: wp(10),
    },
    aqiValueContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: hp(110), // Using responsive height
    },
    aqiValueText: {
        alignSelf: 'center',
        fontSize: fontScale(72),
        fontWeight: 'bold',
        lineHeight: fontScale(72),
        color: 'orange',
    },
    aqiText: {
        fontSize: fontScale(32),
        lineHeight: fontScale(32),
        color: 'orange',
    },
    aqiLevelInfoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: hp(25), // Using responsive height
    },
    aqiLevelInfoText: {
        fontSize: fontScale(42),
        lineHeight: fontScale(42),
        color: 'orange',
        fontWeight: '600',
        textAlign: 'center',
    },
    aqiLevelInfoMessageText: {
        fontSize: fontScale(24),
        lineHeight: fontScale(30), // Increased line height for better text wrapping
        textAlign: 'center',
        width: '90%', // Slightly wider to accommodate text better
        color: 'orange',
        marginTop: hp(15), // Using responsive height
        flexWrap: 'wrap', // Ensures proper text wrapping
    },
    aqiGradientMeter: {
        marginTop: hp(30), // Using responsive height
    },
    bottomContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        paddingBottom: hp(30), // Using responsive height
    },
    viewDetailedReportButtonContainer: {
        alignItems: 'center',
        width: '100%',
        marginTop: hp(50), // Using responsive height
    },
    viewDetailedReportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingVertical: hp(10),
        paddingHorizontal: wp(30),
        borderRadius: 20,
    },
    viewDetailedReportButtonIcon: {
        marginRight: wp(8),
    },
    viewDetailedReportButtonText: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: 'black',
    },
    settingsIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: hp(25), // Using responsive height
    },
    homeScreenFooter: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
    },
    loadingText: {
        color: '#FFD700',
        fontSize: fontScale(16),
        marginTop: hp(10),
        fontWeight: '500',
    },
    errorContainer: {
        padding: wp(20),
        borderRadius: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        marginHorizontal: wp(20),
        alignItems: 'center',
    },
    errorText: {
        color: '#FF0000',
        fontSize: fontScale(16),
        textAlign: 'center',
        fontWeight: '500',
    },
});
