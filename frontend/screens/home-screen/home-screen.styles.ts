import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'black',
        position: 'relative',
    },
    locationDisplayContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        top: 30,
    },
    locationDisplayText: {
        fontSize: 20,
        lineHeight: 22,
        color: 'yellow',
        textAlign: 'center',
    },
    locationDisplayIcon: {
        fontSize: 20,
        lineHeight: 20,
        color: 'yellow',
        textAlign: 'center',
        marginRight: 10,
    },
    aqiValueContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    aqiValueText: {
        alignSelf: 'center',
        fontSize: 72,
        fontWeight: 'bold',
        lineHeight: 72,
        color: 'orange',
    },
    aqiText: {
        fontSize: 32,
        lineHeight: 32,
        color: 'orange',
    },
    aqiLevelInfoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    aqiLevelInfoText: {
        fontSize: 42,
        lineHeight: 42,
        color: 'orange',
        fontWeight: '600',
        textAlign: 'center',
    },
    aqiLevelInfoMessageText: {
        fontSize: 24,
        lineHeight: 24,
        textAlign: 'center',
        width: '85%',
        color: 'orange',
        marginTop: 30,
    },
    aqiGradientMeter: {

    },
    viewDetailedReportButtonContainer: {
        alignItems: 'center',
        position: 'absolute',
        bottom: 250, // 70px + 30px (footer bottom margin) + some spacing
        left: 0,
        right: 0,
        width: '100%',
    },
    viewDetailedReportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700', // Yellow background
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20, // Rounded edges
    },
    viewDetailedReportButtonIcon: {
        marginRight: 8, // Space between icon and text
    },
    viewDetailedReportButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    settingsIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 100, // Between detailed report and footer
        left: 0,
        right: 0,
        width: '100%',
    },
    homeScreenFooter: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        width: '100%',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
    },
    errorContainer: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        marginHorizontal: 20,
        alignItems: 'center',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
});
