import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    modalContent: {
        backgroundColor: '#000',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
        position: 'relative',
    },
    title: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    closeButton: {
        position: 'absolute',
        right: 15,
        top: 0,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#FFD700',
        marginVertical: 10,
    },
    areaButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    areaText: {
        color: '#FFD700',
        fontSize: 20,
    },
    locationList: {
        backgroundColor: '#111',
    },
    locationButton: {
        paddingVertical: 15,
        paddingHorizontal: 35,
    },
    locationText: {
        color: '#FFD700',
        fontSize: 18,
    },
    selectedLocation: {
        backgroundColor: '#333', // Brighter background for selected location
        borderRadius: 5,
    },
});
