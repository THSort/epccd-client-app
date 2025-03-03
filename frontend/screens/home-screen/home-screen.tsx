import React, {ReactElement} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {styles} from './home-screen.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {LanguageToggle} from './components/language-toggle/language-toggle.tsx';
import {AQISlider} from './components/aqi-slider/aqi-slider.tsx';
import {LocationSelector} from './components/location-selector/location-selector.tsx';
import { useLocationModal } from './components/location-modal/location-modal.types.ts';
import { LocationModal } from './components/location-modal/location-modal.tsx';

const HomeScreen = () => {
    const { isModalOpen, openLocationModal, closeLocationModal } = useLocationModal();

    const getLocationDisplay = () => {
        return (
            <View style={[styles.locationDisplayContainer, {marginTop: '35%'}]}>
                <Icon name="map-marker" size={20} color="yellow" style={styles.locationDisplayIcon}/>
                <Text style={styles.locationDisplayText}>Location Display</Text>
            </View>
        );
    };

    const getAqiValue = () => {
        return (
            <View style={[styles.aqiValueContainer, {marginTop: 30}]}>
                <Text style={styles.aqiValueText}>156</Text>
                <Text style={styles.aqiText}>AQI</Text>
            </View>
        );
    };

    const getAqiGradientMeter = () => {
        return (
            <View style={[styles.aqiGradientMeter, {marginTop: 30}]}>
                <AQISlider/>
            </View>
        );
    };

    const getAqiLevelInfo = () => {
        return (
            <View style={[styles.aqiLevelInfoContainer, {marginTop: 30}]}>
                <Text style={styles.aqiLevelInfoText}>Moderate</Text>
                <Text style={styles.aqiLevelInfoMessageText}>Do not be outdoors for more than 2 hours today</Text>
            </View>
        );
    };

    const getViewDetailedReportButton = (): ReactElement => {
        return (
            <View style={[styles.viewDetailedReportButtonContainer, {marginTop: 70}]}>
                <TouchableOpacity activeOpacity={0.7}>
                    <View style={styles.viewDetailedReportButton}>
                        <Icon name="info-circle" size={18} color="black" style={styles.viewDetailedReportButtonIcon}/>
                        <Text style={styles.viewDetailedReportButtonText}>View Detailed Report</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const getSettingsIcon = () => {
        return (
            <View style={[styles.settingsIconContainer, {marginTop: 60}]}>
                <TouchableOpacity activeOpacity={0.7}>
                    <Icon name="cog" size={40} color="#FFD700"/>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isModalOpen && <LocationModal visible={isModalOpen} onClose={closeLocationModal} />}
            {getLocationDisplay()}
            {getAqiValue()}
            {getAqiGradientMeter()}
            {getAqiLevelInfo()}
            {getViewDetailedReportButton()}
            {getSettingsIcon()}
            <View style={[styles.homeScreenFooter, {marginTop: 50}]}>
                <LocationSelector onOpenLocationModal={openLocationModal}/>
                <LanguageToggle/>
            </View>
        </View>
    );
};

export default HomeScreen;
