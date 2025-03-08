import {ReactElement, useState} from 'react';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useNavigation, useRoute} from '@react-navigation/native';
import {styles} from './air-quality-history.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useLocationModal} from '../home-screen/components/location-modal/location-modal.types.ts';
import {LocationSelector} from '../home-screen/components/location-selector/location-selector.tsx';
import {LocationModal} from '../home-screen/components/location-modal/location-modal.tsx';
import {DropdownSelector} from '../../components/dropdown-selector/dropdown-selector.tsx';
import {Pollutant} from '../air-quality-detailed-report/air-quality-detailed-report.types';
import {PollutantModal} from './pollutant-modal/pollutant-modal.tsx';
import {Location} from '../../App.types.ts';
import {AirQualityHistoryNavigationProps} from '../../types/navigation.types.ts';

type RootStackParamList = {
    AirQualityHistory: {
        selectedLocation?: Location;
        selectedPollutant: Pollutant;
    };
};

type Props = NativeStackScreenProps<RootStackParamList, 'AirQualityHistory'>;

export function AirQualityHistory({route}: Props): ReactElement {
    const navigation = useNavigation<AirQualityHistoryNavigationProps>();

    const {selectedLocation, selectedPollutant} = route.params;
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();

    const [isPollutantModalOpen, setIsPollutantModalOpen] = useState(false);
    const [pollutant, setPollutant] = useState<Pollutant>(selectedPollutant);

    const openPollutantModal = () => {
        setIsPollutantModalOpen(true);
    };

    const closePollutantModal = () => {
        setIsPollutantModalOpen(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={25} color="yellow" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Air Quality History</Text>
            </View>

            <View style={styles.content}>
                <LocationSelector
                    isFullWidth
                    showLocationLabel
                    selectedLocation={selectedLocation}
                    onOpenLocationModal={openLocationModal}
                />
                <DropdownSelector
                    label="Pollutant"
                    text={pollutant}
                    onPress={openPollutantModal}
                    isFullWidth
                    showLabel
                />
            </View>

            {isModalOpen && (
                <LocationModal
                    selectedLocation={selectedLocation}
                    onLocationSelected={(location) => {
                        navigation.setParams({ selectedLocation: location });
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
                    selectedPollutant={pollutant}
                    onPollutantSelected={(pollutantToSelect) => {
                        setPollutant(pollutantToSelect);
                        closePollutantModal();
                    }}
                />
            )}
        </View>
    );
}
