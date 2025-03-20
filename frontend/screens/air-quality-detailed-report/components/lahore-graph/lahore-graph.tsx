import type {ReactElement} from 'react';
import type {LahoreGraphProps} from './lahore-graph.types';
import {styles} from './lahore-graph.styles';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';

export function LahoreGraph({...props}: LahoreGraphProps): ReactElement {
    return (
        <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapView}
            region={{
                latitude: 31.5204,
                longitude: 74.3587,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
            }}
        />
    );
}
