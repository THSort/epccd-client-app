import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalOverlay: {
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
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
        position: 'relative',
    },
    modalTitle: {
        color: 'yellow',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    modalCloseButton: {
        position: 'absolute',
        right: 15,
        top: 0,
    },
    modalDivider: {
        width: '100%',
        height: 1,
        backgroundColor: 'yellow',
        marginVertical: 10,
    },
    pollutantItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    selectedPollutantItem: {
        backgroundColor: '#333',
        borderRadius: 5,
    },
    pollutantItemText: {
        color: 'yellow',
        fontSize: 18,
    },
});
