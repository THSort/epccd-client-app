import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    locationDisplayContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationDisplayText: {
        fontSize: 20,
        lineHeight: 20,
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
        marginTop: 20, // Adjust based on layout
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
        backgroundColor: '#000', // Match your theme
    },
});
