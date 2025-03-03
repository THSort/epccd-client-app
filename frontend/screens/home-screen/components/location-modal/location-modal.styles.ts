import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
    },
    modalContent: {
        backgroundColor: '#000',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    title: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    closeButtonText: {
        color: '#FFD700',
        fontSize: 18,
    },
    areaButton: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FFD700',
    },
    areaText: {
        color: '#FFD700',
        fontSize: 16,
    },
    locationButton: {
        padding: 10,
        paddingLeft: 20,
    },
    locationText: {
        color: '#FFD700',
        fontSize: 14,
    },
});
