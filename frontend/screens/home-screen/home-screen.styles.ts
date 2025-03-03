import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
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
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1C', // Dark background
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#FFD700', // Golden border
        width: 270,
        height: 45,
        justifyContent: 'space-between',
        shadowColor: '#FFD700', // Golden glow effect
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6, // Shadow for Android
    },
    selectedText: {
        fontSize: 14,
        color: '#FFD700', // Golden text
        flex: 1,
        marginHorizontal: 5,
    },
    icon: {
        marginRight: 5,
    },
    homeScreenFooter: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },

});
