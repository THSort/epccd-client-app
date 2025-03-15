import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './chart-display-toggle.styles';
import { ChartDisplayToggleProps } from './chart-display-toggle.types';
import { useSelectedLanguage } from '../../../../context/SelectedLanguageContext';
import { getTranslation, Language } from '../../../../utils/translations';

export const ChartDisplayToggle: React.FC<ChartDisplayToggleProps> = ({
  selectedMode,
  onModeSelected,
}) => {
  const { selectedLanguage } = useSelectedLanguage();
  const currentLanguage = (selectedLanguage || 'Eng') as Language;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          styles.leftButton,
          selectedMode === 'concentration' && styles.selectedButton,
        ]}
        onPress={() => onModeSelected('concentration')}
      >
        <Text
          style={[
            styles.buttonText,
            selectedMode === 'concentration' && styles.selectedButtonText,
          ]}
        >
          {getTranslation('concentration', currentLanguage)}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          styles.rightButton,
          selectedMode === 'aqi' && styles.selectedButton,
        ]}
        onPress={() => onModeSelected('aqi')}
      >
        <Text
          style={[
            styles.buttonText,
            selectedMode === 'aqi' && styles.selectedButtonText,
          ]}
        >
          {getTranslation('aqi', currentLanguage)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}; 