import type {ReactElement} from 'react';
import React from 'react';
import {Text, View} from 'react-native';
import type {AqiLegendProps} from './aqi-legend.types';
import {styles} from './aqi-legend.styles';
import {getTranslation, TranslationStrings} from '../../utils/translations.ts';
import {getDefaultLanguage} from '../../utils/language.util.ts';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';
import {fontScale} from '../../utils/responsive.util.ts';
import TextWithStroke from '../text-with-stroke/text-with-stroke.tsx';

// AQI categories for the legend with translation keys
type AqiCategory = {
    key: keyof TranslationStrings;
    color: string;
};

const aqiCategories: AqiCategory[] = [
    {key: 'good', color: '#4CAF50'},
    {key: 'satisfactory', color: '#8BC34A'},
    {key: 'moderate', color: '#FFEB3B'},
    {key: 'unhealthyForSensitive', color: '#FF9800'},
    {key: 'unhealthy', color: '#F44336'},
    {key: 'veryUnhealthy', color: '#9C27B0'},
    {key: 'hazardous', color: '#6D4C41'},
];

export function AqiLegend({...props}: AqiLegendProps): ReactElement {
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = getDefaultLanguage(selectedLanguage);

    return (
        <View style={styles.legend}>
            {aqiCategories.map((category, index) => (
                <View style={styles.legendItem} key={index}>
                    <View style={[styles.legendItemDot, {backgroundColor: category.color}]}/>
                    <TextWithStroke bold text={getTranslation(category.key, currentLanguage)} color={'white'} style={styles.legendItemText} size={currentLanguage === 'اردو' ? fontScale(14) : fontScale(12)}/>
                </View>
            ))}
        </View>
    );
}
