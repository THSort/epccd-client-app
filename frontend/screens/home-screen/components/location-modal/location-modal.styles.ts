import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end', // Align at the bottom
        alignItems: 'center',
    },
    overlay: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // White overlay with opacity
        position: 'absolute',
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#000',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%', // Limits height for better UX
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        paddingBottom: 10,
    },
    title: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
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
