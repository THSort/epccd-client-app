import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    locationIcon: {
        fontSize: 18,
        lineHeight: 18,
        color: 'yellow',
        textAlign: 'center',
        marginRight: 10,
    },
    button: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'blue',
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    locationDisplayContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationDisplayText: {
        fontSize: 18,
        lineHeight: 18,
        color: 'yellow',
        textAlign: 'center',
    },
    aqiValueContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // justifyContent: 'center',
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
        fontSize: 48,
        fontWeight: 'bold',
        lineHeight: 48,
        color: 'orange',
    },
    aqiLevelInfoMessageText: {
        fontSize: 28,
        lineHeight: 28,
        textAlign: 'center',
        width: '85%',
        color: 'orange',
        marginTop: 30,
        fontWeight: '600',
    },
    aqiGradientMeter: {

    },
    ///////
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20, // Adjust based on layout
    },

    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700', // Yellow background
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20, // Rounded edges
    },

    viewButtonIcon: {
        marginRight: 8, // Space between icon and text
    },

    viewButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    //////////////////////////////////
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1C', // Dark background
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#FFD700', // Golden border
        width: 140,
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

});
