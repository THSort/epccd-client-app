import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './home-screen.styles';
import {LanguageToggle} from './components/language-toggle/language-toggle.tsx';
import {AQISlider} from './components/aqi-slider/aqi-slider.tsx';
import {LocationSelector} from './components/location-selector/location-selector.tsx';
import {useLocationModal} from './components/location-modal/location-modal.types.ts';
import {LocationModal} from './components/location-modal/location-modal.tsx';
import {useSelectedLocation} from '../../context/SelectedLocationContext.tsx';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';
import {getAqiColor} from '../../utils/aqi-colors.util.ts';
import {getAqiDescription} from '../../utils/aqi-description.util.ts';
import {fetchEpaMonitorsData} from '../../services/api.service.ts';
import {useNavigation} from '@react-navigation/native';
import {HomeScreenNavigationProps} from '../../types/navigation.types.ts';

const DEFAULT_AQI = 0;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProps>();
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const {selectedLocation, isLoadingLocation, setSelectedLocation} = useSelectedLocation();
    const {isLoadingLanguage} = useSelectedLanguage();

    const [aqiValue, setAqiValue] = useState<number>(DEFAULT_AQI);
    const [isFetchingAqi, setIsFetchingAqi] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAqi = async () => {
            if (!selectedLocation) {
                setIsFetchingAqi(false);
                return;
            }

            setIsFetchingAqi(true);
            setError(null);

            try {
                const data = await fetchEpaMonitorsData(selectedLocation);
                setAqiValue(data.PM2_5_AQI);
            } catch (error) {
                console.error('Error fetching AQI:', error);
                setError('Failed to load air quality data. Please try again later.');
                // Set a default value in case of error
                setAqiValue(DEFAULT_AQI);
            } finally {
                setIsFetchingAqi(false);
            }
        };

        loadAqi();
    }, [selectedLocation]);

    const aqiColor = getAqiColor(aqiValue);
    const aqiDescription = getAqiDescription(aqiValue);

    if (isFetchingAqi || isLoadingLanguage || isLoadingLocation) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFD700"/>
            </View>
        );
    }

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

            <View style={[styles.locationDisplayContainer, {marginTop: '35%'}]}>
                <Icon name="map-marker" size={20} color="yellow" style={styles.locationDisplayIcon}/>
                <Text style={styles.locationDisplayText}>
                    {selectedLocation ? selectedLocation.locationName : 'Select Location'}
                </Text>
            </View>

            {error ? (
                <View style={[styles.errorContainer, {marginTop: 30}]}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <>
                    <View style={[styles.aqiValueContainer, {marginTop: 30}]}>
                        <Text style={[styles.aqiValueText, {color: aqiColor}]}>{aqiValue}</Text>
                        <Text style={[styles.aqiText, {color: aqiColor}]}>AQI</Text>
                    </View>

                    <View style={[styles.aqiGradientMeter, {marginTop: 40}]}>
                        <AQISlider aqi={aqiValue}/>
                    </View>

                    <View style={[styles.aqiLevelInfoContainer, {marginTop: 30}]}>
                        <Text style={[styles.aqiLevelInfoText, {color: aqiColor}]}>{aqiDescription.level}</Text>
                        <Text style={[styles.aqiLevelInfoMessageText, {color: aqiColor}]}>
                            {aqiDescription.message}
                        </Text>
                    </View>
                </>
            )}

            <View style={[styles.viewDetailedReportButtonContainer, {marginTop: 70}]}>
                <TouchableOpacity onPress={() => {
                    navigation.navigate('AirQualityDetailedReport');
                }} activeOpacity={0.7}>
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
