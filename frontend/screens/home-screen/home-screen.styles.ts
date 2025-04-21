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
    scrollView: {
        flex: 1,
        width: '100%',
    },
    locationDisplayContainer: {
        display: 'flex',
        flexDirection: 'column',
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
    aqiDisplay: {
        marginTop: hp(60), // Using responsive height
        marginHorizontal: hp(20),
        backgroundColor: backgrounds.dark,
        padding: 20,
        borderRadius: 25,
    },
    aqiValueContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    aqiValueText: {
        marginTop: hp(5), // Using responsive height
        alignSelf: 'center',
        fontSize: fontScale(45),
        fontWeight: 'bold',
        lineHeight: fontScale(47),
    },
    aqiText: {
        fontSize: fontScale(18),
        lineHeight: fontScale(18),
        textAlign: 'center',
        color: colors.secondaryWithDarkBg,
        fontWeight: '600',
    },
    aqiLevelInfoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    aqiLevelInfoText: {
        fontSize: fontScale(20),
        lineHeight: fontScale(20),
        color: 'orange',
        fontWeight: '600',
        textAlign: 'center',
    },
    aqiLevelInfoMessageText: {
        fontSize: fontScale(16),
        lineHeight: fontScale(20), // Increased line height for better text wrapping
        textAlign: 'center',
        color: 'orange',
        flexWrap: 'wrap', // Ensures proper text wrapping
    },
    aqiGradientMeter: {
        marginTop: hp(20), // Using responsive height
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
    homeScreenFooter: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
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
        backgroundColor: 'rgba(255, 0, 0, 0.6)',
        marginHorizontal: wp(20),
        alignItems: 'center',
    },
    errorText: {
        color: 'white',
        fontSize: fontScale(16),
        textAlign: 'center',
        fontWeight: '500',
    },
    futurePredictionContainer: {
        marginTop: hp(50),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginHorizontal: hp(60),
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        padding: 20,
        marginBottom: hp(10),
    },
    futureAqiValue: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    aqiLevelLegendExpanderContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    infoIconContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: '50%',
        width: 21,
        height: 21,
    },
    aqiLevelLegendExpander: {
        display: 'flex',
        gap: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255, 0.15)',
        padding:  10,
        borderRadius: 6,
        textAlign: 'center',
    },
    aqiLegend: {
        backgroundColor: 'rgba(255,255,255, 0.15)',
        padding: 10,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
    },
    settingsButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        right: 10,
        bottom: 10,
        borderRadius: '50%',
        borderWidth: 1,
        borderColor: colors.secondaryWithDarkBg,
        width: 50,
        height: 50,
    },
    iconWrapper: {
        position: 'relative',
    },
    iconOutline: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    iconInner: {
        position: 'absolute',
        top: 3,
        left: 2,
    },
});
