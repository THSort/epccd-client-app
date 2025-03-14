import {StyleSheet} from 'react-native';

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
        marginTop: '10%'
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
        color: 'yellow',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    valueLabel: {
        color: 'white',
        fontSize: 14,
    },
});
