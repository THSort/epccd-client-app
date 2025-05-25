import {StyleSheet} from 'react-native';
import {backgrounds, colors} from '../../../../App.styles.ts';
import {hp, fontScale, wp} from '../../../../utils/responsive.util';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: hp(2),
        paddingVertical: hp(20),
    },
    content: {
        color: colors.primaryWithDarkBg,
        fontSize: fontScale(25),
        lineHeight: fontScale(28),
        textAlign: 'justify',
    },
    paragraph: {
        marginBottom: fontScale(30),
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: hp(20),
        width: '100%',
        height: hp(250),
        overflow: 'hidden',
        marginTop: hp(-30),
    },
    image: {
        width: '100%',
        height: '100%',
        transform: [{scale: 1.2}],
    },
    caption: {
        color: colors.primaryWithDarkBg,
        fontSize: fontScale(18),
        lineHeight: fontScale(28),
        textAlign: 'center',
        marginTop: hp(-30),
    },
    tableContainer: {
        marginVertical: hp(20),
        width: '100%',
        paddingHorizontal: hp(10),
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(25),
        width: '100%',
    },
    tableIcon: {
        width: wp(80),
        height: wp(80),
        marginRight: wp(15),
        resizeMode: 'contain',
    },
    tableText: {
        color: colors.primaryWithDarkBg,
        fontSize: fontScale(22),
        flex: 1,
        flexWrap: 'wrap',
        textAlign: 'left',
    },
    // AQI Card styles
    aqiCardContainer: {
        width: '100%',
        marginVertical: hp(10),
    },
    aqiCard: {
        width: '100%',
        marginBottom: hp(15),
        borderRadius: hp(10),
        overflow: 'hidden',
    },
    aqiCardRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        height: 'auto',
    },
    aqiLevelBox: {
        width: wp(80),
        justifyContent: 'center',
        alignItems: 'center',
        padding: hp(5),
    },
    aqiLevelText: {
        color: '#000',
        fontSize: fontScale(16),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    aqiInfoContainer: {
        flex: 1,
        backgroundColor: backgrounds.medium,
        padding: hp(15),
    },
    aqiTitle: {
        color: '#FFCC00',
        fontSize: fontScale(20),
        fontWeight: 'bold',
        marginBottom: hp(5),
        textAlign: 'center',
    },
    aqiDescription: {
        color: '#FFCC00',
        fontSize: fontScale(16),
        textAlign: 'center',
    },
    aqiIcon: {
        width: wp(25),
        height: wp(25),
        marginLeft: wp(10),
        resizeMode: 'contain',
    },
    // AQI color levels
    aqi_0_50: {
        backgroundColor: '#80e636', // Bright green
    },
    aqi_51_100: {
        backgroundColor: '#ffdd00', // Yellow
    },
    aqi_101_150: {
        backgroundColor: '#ff9a00', // Orange
    },
    aqi_151_200: {
        backgroundColor: '#ee5a34', // Light red
    },
    aqi_201_300: {
        backgroundColor: '#e53210', // Red
    },
    aqi_301_400: {
        backgroundColor: '#99004c', // Purple
    },
    aqi_401_500: {
        backgroundColor: '#7e0023', // Dark red
    },
    // Bullet point styles
    bulletPoint: {
        color: colors.primaryWithDarkBg,
        fontSize: fontScale(25),
        marginRight: wp(10),
        lineHeight: fontScale(28),
        width: wp(20),
    },
    bulletText: {
        flex: 1,
        flexWrap: 'wrap',
        marginBottom: hp(15),
        textAlign: 'left',
        paddingRight: wp(10),
    },
});
