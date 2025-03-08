import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1C', // Dark background
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#FFD700', // Golden border
        width: 270,
        height: 45,
        justifyContent: 'space-between',
        shadowColor: '#FFD700', // Golden glow effect
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6, // Shadow for Android
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700', // Golden text
        flex: 1,
    },
    selectedItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'red',
    },
    selectedItemText: {
        fontSize: 18,
        color: '#FFD700', // Golden text
        marginLeft: 5,
        marginRight: 10,
    },
    icon: {
        marginRight: 3,
    },
});
