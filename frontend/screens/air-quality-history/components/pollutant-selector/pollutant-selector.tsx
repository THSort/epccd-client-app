import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './pollutant-selector.styles';
import { PollutantSelectorProps } from './pollutant-selector.types';
import { Pollutant } from '../../../air-quality-detailed-report/air-quality-detailed-report.types';
import { useSelectedLanguage } from '../../../../context/SelectedLanguageContext';
import { getTranslation, Language } from '../../../../utils/translations';

export const PollutantSelector: React.FC<PollutantSelectorProps> = ({
  selectedPollutant,
  onPollutantSelected,
}) => {
  const { selectedLanguage } = useSelectedLanguage();
  const currentLanguage = (selectedLanguage || 'Eng') as Language;

  // Get translated pollutant name
  const getTranslatedPollutantName = (pollutant: Pollutant): string => {
    switch (pollutant) {
      case Pollutant.PM2_5:
        return getTranslation('pm25', currentLanguage);
      case Pollutant.PM10:
        return getTranslation('pm10', currentLanguage);
      case Pollutant.O3:
        return getTranslation('o3', currentLanguage);
      case Pollutant.SO2:
        return getTranslation('so2', currentLanguage);
      case Pollutant.NO2:
        return getTranslation('no2', currentLanguage);
      case Pollutant.CO:
        return getTranslation('co', currentLanguage);
      default:
        return pollutant;
    }
  };

  const pollutantOptions = Object.values(Pollutant).map(value => ({
    value,
    label: getTranslatedPollutantName(value),
  }));

  return ( 
    <View>
      <View style={styles.scrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {pollutantOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                selectedPollutant === option.value && styles.selectedOption,
              ]}
              onPress={() => onPollutantSelected(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedPollutant === option.value && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}; 