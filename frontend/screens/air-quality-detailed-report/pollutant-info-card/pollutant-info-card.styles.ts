import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#40320A',
        height: 95,
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderRadius: 8,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    pollutantName: {
        color: 'yellow',
        fontWeight: 'bold',
        fontSize: 20,
        lineHeight: 20,
    },
    pollutantValue: {
        color: 'yellow',
        fontWeight: 'bold',
        fontSize: 20,
        lineHeight: 20,
    },
    pollutantDescription: {
        color: 'yellow',
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '300',
    },
    pollutantUnits: {
        color: 'yellow',
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '300',
    },
    historyButton: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 6,
    },
    historyIcon: {
        marginRight: 8,
    },
    historyText: {
        color: 'yellow',
        fontSize: 15,
        lineHeight: 15,
    },
});
