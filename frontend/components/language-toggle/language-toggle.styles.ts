import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        borderRadius: 100,
        width: 110,
        height: 45,
        position: 'relative',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    toggleCircle: {
        width: 45,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 2,
        left: 5, // Initial position
    },
    toggleText: {
        color: '#FFD700',
        fontSize: 20,
        fontWeight: 'bold',
    },
    languageText: {
        fontSize: 20,
        color: 'black',
        zIndex: -1, // Keeps text in the background
    },
    toggleOn: {
        backgroundColor: 'black',
    },
});
