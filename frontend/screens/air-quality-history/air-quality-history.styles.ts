import {StyleSheet} from 'react-native';
import {backgrounds, colors} from '../../App.styles.ts';
import {hp, wp} from '../../utils/responsive.util.ts';

export const styles = StyleSheet.create({
    container: {
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
    content: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
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
        color: 'red',
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
    },
    dataContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#222',
        borderRadius: 10,
    },
    dataText: {
        color: 'white',
        fontSize: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    noDataContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#222',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    noDataText: {
        color: '#888',
        fontSize: 16,
        marginBottom: 15,
    },
    timePointsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    timePoint: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8,
        margin: 5,
        width: '45%',
        alignItems: 'center',
        marginBottom: 10,
    },
    timeLabel: {
        color: colors.primaryWithDarkBg,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    valueLabel: {
        color: 'white',
        fontSize: 14,
    },
    chartContainer: {
        marginTop: hp(10),
        backgroundColor: '#222',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    chartWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        // height: 500,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        alignSelf: 'center',
    },
});
