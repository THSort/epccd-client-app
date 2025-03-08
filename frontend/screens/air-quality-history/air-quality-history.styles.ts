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
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'yellow',
        marginLeft: 10,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
});
