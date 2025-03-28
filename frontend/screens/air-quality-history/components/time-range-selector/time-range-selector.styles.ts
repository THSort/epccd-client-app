import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    scrollContainer: {
        marginVertical: 15,
    },
    container: {
        flexDirection: 'row',
        backgroundColor: '#222',
        borderRadius: 10,
        padding: 5,
    },
    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginHorizontal: 3,
        minWidth: 65,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedOption: {
        backgroundColor: '#FFD700',
    },
    optionText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    selectedOptionText: {
        color: 'black',
        fontWeight: 'bold',
    },
});
