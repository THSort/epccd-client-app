import React, {ReactElement} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {styles} from './home-screen.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {LanguageToggle} from './components/language-toggle/language-toggle.tsx';
import {AQISlider} from './components/aqi-slider/aqi-slider.tsx';

const HomeScreen = () => {
    const getLocationDisplay = () => {
        return (
            <View style={styles.locationDisplayContainer}>
                <Icon name="map-marker" size={18} color="yellow" style={styles.locationIcon}/>
                <Text style={styles.locationDisplayText}>Location Display</Text>
            </View>
        );
    };

    const getAqiValue = () => {
        return (
            <View style={styles.aqiValueContainer}>
                <Text style={styles.aqiValueText}>156</Text>
                <Text style={styles.aqiText}>AQI</Text>
            </View>
        );
    };

    const getAqiGradientMeter = () => {
        return (
            <View style={styles.aqiGradientMeter}>
                <AQISlider/>
            </View>
        );
    };

    const getAqiLevelInfo = () => {
        return (
            <View style={styles.aqiLevelInfoContainer}>
                <Text style={styles.aqiLevelInfoText}>Moderate</Text>
                <Text style={styles.aqiLevelInfoMessageText}>Do not be outdoors for more than 2 hours today</Text>
            </View>
        );
    };

    const getViewDetailedReportButton = (): ReactElement => {
        return (
            <View style={styles.buttonContainer}>
                <TouchableOpacity activeOpacity={0.7}>
                    <View style={styles.viewButton}>
                        <Icon name="info-circle" size={18} color="black" style={styles.viewButtonIcon}/>
                        <Text style={styles.viewButtonText}>View Detailed Report</Text>
                    </View>
                </TouchableOpacity>

            </View>
        );
    };

    const getSettingsIcon = () => {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <TouchableOpacity activeOpacity={0.7}>
                    <Icon name="cog" size={40} color="#FFD700"/>
                </TouchableOpacity>
            </View>
        );
    };

    const getDropdownSelector = (): ReactElement => {
        return (
            <TouchableOpacity style={styles.selector} onPress={() => {
            }}>
                <Icon name="map-marker" size={16} color="#FFD700" style={styles.icon}/>
                <Text style={styles.selectedText} numberOfLines={1} ellipsizeMode="tail">
                    {'Select an option'}
                </Text>
                <Icon name="chevron-down" size={12} color="#FFD700"/>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {getLocationDisplay()}
            {getAqiValue()}
            {getAqiGradientMeter()}
            {getAqiLevelInfo()}
            {getViewDetailedReportButton()}
            {getSettingsIcon()}
            <LanguageToggle/>
            {getDropdownSelector()}
        </View>
    );
};

export default HomeScreen;
