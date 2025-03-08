import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'yellow',
        marginLeft: 10,
    },
    locationSelector: {
        paddingHorizontal: 24,
    },
    aqiContainer: {
        paddingHorizontal: 24,
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    aqiDetails: {
        flexDirection: 'column',
    },
    aqiValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'yellow',
    },
    aqiStatus: {
        fontSize: 14,
        color: 'yellow',
    },
    updateLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'yellow',
        textAlign: 'center',
    },
    updateTime: {
        fontSize: 12,
        color: 'yellow',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'yellow',
        marginVertical: 10,
    },
    pollutantContainer: {
        paddingHorizontal: 25,
    },
    pollutantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    pollutantTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'yellow',
    },
    pollutantList: {
        backgroundColor: 'red',
        height: 400,
    },
    pollutantListContent: {
        alignItems: 'center',
        gap: 10,
    },
});
