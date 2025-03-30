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
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'yellow',
        marginLeft: 10,
    },
    headerRightPlaceholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'yellow',
        marginTop: 24,
        marginBottom: 12,
        width: 250,
        textAlign: 'center',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 16,
        marginBottom: 28,
    },
    settingLabel: {
        flex: 1,
        fontSize: 17,
        color: '#FFFFFF',
        alignSelf: 'center',
    },
    settingValue: {
        fontSize: 17,
        color: '#FFD700',
    },
    languageContainer: {
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    dropdownContainer: {
        width: '100%',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        marginBottom: 16,
        padding: 5,
    },
    dropdownButton: {
        backgroundColor: '#1E1E1E',
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 8,
    },
    dropdownButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    dropdownRow: {
        backgroundColor: '#1E1E1E',
        borderBottomColor: '#333',
    },
    dropdownRowText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    toast: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1001,
    },
    errorToast: {
        backgroundColor: '#F44336',
    },
    toastText: {
        color: 'white',
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    },
    thresholdOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    thresholdColor: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 16,
    },
    thresholdText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
});
