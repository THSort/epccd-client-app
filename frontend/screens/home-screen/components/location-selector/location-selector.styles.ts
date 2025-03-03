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
    selectedText: {
        fontSize: 14,
        color: '#FFD700', // Golden text
        flex: 1,
        marginHorizontal: 5,
    },
    icon: {
        marginRight: 5,
    },
});
