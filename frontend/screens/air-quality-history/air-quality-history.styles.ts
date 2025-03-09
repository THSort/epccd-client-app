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
    },
    noDataContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#222',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
    },
    noDataText: {
        color: '#888',
        fontSize: 16,
    },
});
