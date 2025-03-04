import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './home-screen.styles';
import {LanguageToggle} from './components/language-toggle/language-toggle.tsx';
import {AQISlider} from './components/aqi-slider/aqi-slider.tsx';
import {LocationSelector} from './components/location-selector/location-selector.tsx';
import {useLocationModal} from './components/location-modal/location-modal.types.ts';
import {LocationModal} from './components/location-modal/location-modal.tsx';
import {useSelectedLocation} from '../../context/SelectedLocationContext.tsx';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';

const DEFAULT_AQI = 156;

const getAqiColor = (aqi: number) => {
    if (aqi <= 50) {
        return '#00E400';
    }
    if (aqi <= 100) {
        return '#FFFF00';
    }
    if (aqi <= 150) {
        return '#FF7E00';
    }
    if (aqi <= 200) {
        return '#FF0000';
    }
    if (aqi <= 300) {
        return '#8F3F97';
    }
    return '#7E0023';
};

const HomeScreen = () => {
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const {selectedLocation, isLoadingLocation} = useSelectedLocation();
    const {isLoadingLanguage} = useSelectedLanguage();

    const [aqiValue, setAqiValue] = useState<number>(DEFAULT_AQI);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadUserSettings = async () => {
            try {
                const storedAqi = await AsyncStorage.getItem('aqiValue');

                if (storedAqi !== null) {
                    setAqiValue(parseInt(storedAqi, 10));
                }
            } catch (error) {
                console.error('Error fetching user settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserSettings();
    }, []);

    const aqiColor = getAqiColor(aqiValue);

    if (loading || isLoadingLanguage || isLoadingLocation) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFD700"/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {isModalOpen && <LocationModal onLocationSelected={() => {
                closeLocationModal();
            }} visible={isModalOpen} onClose={closeLocationModal}/>}
            <View style={[styles.locationDisplayContainer, {marginTop: '35%'}]}>
                <Icon name="map-marker" size={20} color="yellow" style={styles.locationDisplayIcon}/>
                <Text style={styles.locationDisplayText}>{selectedLocation}</Text>
            </View>

            <View style={[styles.aqiValueContainer, {marginTop: 30}]}>
                <Text style={[styles.aqiValueText, {color: aqiColor}]}>{aqiValue}</Text>
                <Text style={[styles.aqiText, {color: aqiColor}]}>AQI</Text>
            </View>

            <View style={[styles.aqiGradientMeter, {marginTop: 30}]}>
                <AQISlider/>
            </View>

            <View style={[styles.aqiLevelInfoContainer, {marginTop: 30}]}>
                <Text style={[styles.aqiLevelInfoText, {color: aqiColor}]}>Moderate</Text>
                <Text style={[styles.aqiLevelInfoMessageText, {color: aqiColor}]}>
                    Do not be outdoors for more than 2 hours today
                </Text>
            </View>

            <View style={[styles.viewDetailedReportButtonContainer, {marginTop: 70}]}>
                <TouchableOpacity activeOpacity={0.7}>
                    <View style={styles.viewDetailedReportButton}>
                        <Icon name="info-circle" size={18} color="black" style={styles.viewDetailedReportButtonIcon}/>
                        <Text style={styles.viewDetailedReportButtonText}>View Detailed Report</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={[styles.settingsIconContainer, {marginTop: 60}]}>
                <TouchableOpacity activeOpacity={0.7}>
                    <Icon name="cog" size={40} color="#FFD700"/>
                </TouchableOpacity>
            </View>

            <View style={[styles.homeScreenFooter, {marginTop: 50}]}>
                <LocationSelector selectedLocation={selectedLocation} onOpenLocationModal={openLocationModal}/>
                <LanguageToggle/>
            </View>
        </View>
    );
};

export default HomeScreen;
