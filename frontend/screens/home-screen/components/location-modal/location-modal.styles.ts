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
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // White overlay with 0.5 opacity
        position: 'absolute',
    },
    modalContent: {
        backgroundColor: '#000',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center', // Center align
        alignItems: 'center',
        position: 'relative',
        paddingBottom: 10,
    },
    title: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center', // Ensure text is centered
    },
    closeButton: {
        position: 'absolute',
        right: 10, // Position close button to the right
        top: 0,
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
