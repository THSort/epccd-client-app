import type { ReactElement } from 'react';
import React from 'react';
import { Text, View } from 'react-native';
import type { PollutantInfoCardProps } from './pollutant-info-card.types.ts';
import { styles } from './pollutant-info-card.styles.ts';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {AirQualityDetailedReportNavigationProps} from '../../../../types/navigation.types.ts';
import {Pollutant} from '../../air-quality-detailed-report.types.ts';
import {useSelectedLanguage} from '../../../../context/SelectedLanguageContext.tsx';
import {Language, getTranslatedNumber} from '../../../../utils/translations.ts';
import { TrackableButton, ELEMENT_NAMES, SCREEN_NAMES } from '../../../../components/tracking';
import { useResponsiveDimensions, fontScale } from '../../../../utils/responsive.util';

// Define units for each pollutant type (fallback if not provided in props)
const POLLUTANT_UNITS = {
    [Pollutant.PM2_5]: 'µg/m³',
    [Pollutant.PM10]: 'µg/m³',
    [Pollutant.O3]: 'ppb',
    [Pollutant.SO2]: 'ppb',
    [Pollutant.NO2]: 'ppb',
    [Pollutant.CO]: 'ppm',
};

export function PollutantInfoCard({ ...props }: PollutantInfoCardProps): ReactElement {
    const navigation = useNavigation<AirQualityDetailedReportNavigationProps>();
    const { selectedLanguage } = useSelectedLanguage();
    const currentLanguage = (selectedLanguage || 'Eng') as Language;
    const { isSmallScreen, fontScaleDynamic } = useResponsiveDimensions();

    // Get the appropriate unit for the pollutant
    const getUnit = (pollutantName: Pollutant) => {
        return POLLUTANT_UNITS[pollutantName] || 'µg/m³';
    };

    const getPollutantDetails = (pollutantName: Pollutant, pollutantValue: number, pollutantDescription: string) => {
        const unit = getUnit(pollutantName);

        // Adjust font sizes for small screens
        const nameStyle = isSmallScreen 
            ? {...styles.pollutantName, fontSize: fontScaleDynamic(18)} 
            : styles.pollutantName;
        
        const valueStyle = isSmallScreen 
            ? {...styles.pollutantValue, fontSize: fontScaleDynamic(18)} 
            : styles.pollutantValue;
            
        const descriptionStyle = isSmallScreen 
            ? {...styles.pollutantDescription, fontSize: fontScaleDynamic(13)} 
            : styles.pollutantDescription;
            
        const unitStyle = isSmallScreen 
            ? {...styles.pollutantUnits, fontSize: fontScaleDynamic(13)} 
            : styles.pollutantUnits;

        return (
            <View>
                <View style={styles.row}>
                    <Text style={nameStyle} numberOfLines={1} ellipsizeMode="tail">
                        {props.translatedName || pollutantName}
                    </Text>
                    <Text style={valueStyle}>
                        {getTranslatedNumber(pollutantValue.toFixed(1), currentLanguage)}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={descriptionStyle} numberOfLines={1} ellipsizeMode="tail">
                        {pollutantDescription}
                    </Text>
                    <Text style={unitStyle}>
                        {props.pollutantUnit || unit}
                    </Text>
                </View>
            </View>
        );
    };

    const getHistoryButton = () => {
        const historyTextStyle = [
            styles.historyText,
            currentLanguage === 'اردو' && { fontSize: fontScale(17) },  // Increase font size for Urdu
            isSmallScreen && { fontSize: fontScaleDynamic(14) }
        ];

        return (
            <TrackableButton
                buttonName={ELEMENT_NAMES.BTN_VIEW_HISTORY}
                screenName={SCREEN_NAMES.DETAILED_REPORT}
                style={styles.historyButton}
                onPress={() => navigation.navigate('AirQualityHistory', {
                    selectedLocation: props.selectedLocation,
                    selectedPollutant: props.pollutantName,
                })}
                additionalTrackingData={{
                    pollutant: props.pollutantName,
                }}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="line-chart" size={15} color="yellow" style={styles.historyIcon} />
                    <Text style={historyTextStyle}>
                        {props.viewHistoryText || 'View History'}
                    </Text>
                </View>
            </TrackableButton>
        );
    };

    return (
        <View style={styles.container}>
            {getPollutantDetails(props.pollutantName, props.pollutantValue, props.pollutantDescription)}
            {getHistoryButton()}
        </View>
    );
}
