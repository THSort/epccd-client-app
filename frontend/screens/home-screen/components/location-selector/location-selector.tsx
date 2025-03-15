import type {ReactElement} from 'react';
import React from 'react';
import type {LocationSelectorProps} from './location-selector.types';
import {DropdownSelector} from '../../../../components/dropdown-selector/dropdown-selector.tsx';
import {useSelectedLanguage} from '../../../../context/SelectedLanguageContext.tsx';
import {getTranslation, Language, getTranslatedLocationName} from '../../../../utils/translations';

export function LocationSelector({selectedLocation, onOpenLocationModal, showLocationLabel = false, isFullWidth = false}: LocationSelectorProps): ReactElement {
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = (selectedLanguage || 'Eng') as Language;
    
    // Get translated location name if a location is selected
    const locationDisplayName = selectedLocation 
        ? getTranslatedLocationName(selectedLocation.locationName, currentLanguage)
        : getTranslation('selectLocation', currentLanguage);
    
    return (
        <DropdownSelector
            label={getTranslation('selectLocation', currentLanguage)}
            text={locationDisplayName}
            iconName="map-marker"
            onPress={onOpenLocationModal}
            isFullWidth={isFullWidth}
            showLabel={showLocationLabel}
        />
    );
}
