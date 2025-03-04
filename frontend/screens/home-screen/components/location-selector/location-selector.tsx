import type { ReactElement } from 'react';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { LocationSelectorProps } from './location-selector.types';
import { styles } from './location-selector.styles';
import Icon from 'react-native-vector-icons/FontAwesome';

const DEFAULT_LOCATION = 'Select an option'; // Define default location here

export function LocationSelector({ selectedLocation, onOpenLocationModal }: LocationSelectorProps): ReactElement {
    return (
        <View>
            <TouchableOpacity style={styles.selector} onPress={onOpenLocationModal}>
                <Icon name="map-marker" size={18} color="#FFD700" style={styles.icon} />
                <Text style={styles.selectedText} numberOfLines={1} ellipsizeMode="tail">
                    {selectedLocation ?? DEFAULT_LOCATION}
                </Text>
                <Icon name="chevron-down" size={12} color="#FFD700" />
            </TouchableOpacity>
        </View>
    );
}
