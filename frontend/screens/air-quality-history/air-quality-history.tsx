import {ReactElement, useState} from 'react';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import type {AirQualityHistoryProps} from './air-quality-history.types';
import {styles} from './air-quality-history.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useLocationModal} from '../home-screen/components/location-modal/location-modal.types.ts';
import {LocationSelector} from '../home-screen/components/location-selector/location-selector.tsx';
import {LocationModal} from '../home-screen/components/location-modal/location-modal.tsx';
import {DropdownSelector} from '../../components/dropdown-selector/dropdown-selector.tsx';
import {Pollutant} from '../air-quality-detailed-report/air-quality-detailed-report.types';
import {PollutantModal} from './pollutant-modal/pollutant-modal.tsx';

export function AirQualityHistory({...props}: AirQualityHistoryProps): ReactElement {
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const [selectedLocation, setSelectedLocation] = useState(props.selectedLocation);
    const [isPollutantModalOpen, setIsPollutantModalOpen] = useState(false);
    const [selectedPollutant, setSelectedPollutant] = useState<Pollutant>(Pollutant.PM2_5);

    const openPollutantModal = () => {
        setIsPollutantModalOpen(true);
    };

    const closePollutantModal = () => {
        setIsPollutantModalOpen(false);
    };

    const getHeader = () => {
        return (
            <View style={styles.header}>
                <TouchableOpacity onPress={() => console.log('Back pressed')}>
                    <Icon name="chevron-left" size={25} color="yellow" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Air Quality History</Text>
            </View>
        );
    };

    const getLocationSelector = () => {
        return (
            <LocationSelector isFullWidth showLocationLabel selectedLocation={selectedLocation} onOpenLocationModal={openLocationModal}/>
        );
    };

    const getPollutantSelector = () => {
        return (
            <View style={{marginTop: 12}}>
                <DropdownSelector
                    label="Pollutant"
                    text={selectedPollutant}
                    onPress={openPollutantModal}
                    isFullWidth
                    showLabel
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isModalOpen && (
                <LocationModal
                    selectedLocation={selectedLocation}
                    onLocationSelected={(location) => {
                        setSelectedLocation(location);
                        closeLocationModal();
                    }}
                    visible={isModalOpen}
                    onClose={closeLocationModal}
                />
            )}
            {isPollutantModalOpen && (
                <PollutantModal
                    visible={isPollutantModalOpen}
                    onClose={closePollutantModal}
                    selectedPollutant={selectedPollutant}
                    onPollutantSelected={(pollutant) => {
                        setSelectedPollutant(pollutant);
                        closePollutantModal();
                    }}
                />
            )}
            {getHeader()}
            <View style={styles.content}>
                {getLocationSelector()}
                {getPollutantSelector()}
            </View>
        </View>
    );
}
