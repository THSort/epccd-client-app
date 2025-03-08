import type {ReactElement} from 'react';
import React from 'react';
import type {LocationSelectorProps} from './location-selector.types';
import {DropdownSelector} from '../../../../components/dropdown-selector/dropdown-selector.tsx';

const DEFAULT_LOCATION = 'Select an option'; // Define default location here

export function LocationSelector({selectedLocation, onOpenLocationModal, showLocationLabel = false, isFullWidth = false}: LocationSelectorProps): ReactElement {
    return (
        <DropdownSelector
            label="Location"
            text={selectedLocation ? selectedLocation.locationName : DEFAULT_LOCATION}
            iconName="map-marker"
            onPress={onOpenLocationModal}
            isFullWidth={isFullWidth}
            showLabel={showLocationLabel}
        />
    );
}
