import {StyleSheet} from 'react-native';
import {fontScale} from '../../utils/responsive.util.ts';

export const styles = StyleSheet.create({
    legend: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    legendItem: {
        gap: 2,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    legendItemDot: {
        width: 15,
        height: 15,
        borderRadius: '50%',
        borderColor: 'white',
        borderWidth: 1,
    },
    legendItemText: {
        textAlign: 'center',
    },
});
