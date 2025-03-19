import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './chart-display-toggle.styles';
import { ChartDisplayToggleProps } from './chart-display-toggle.types';
import { useSelectedLanguage } from '../../../../context/SelectedLanguageContext';
import { getTranslation, Language } from '../../../../utils/translations';
import { TrackableTouchable, ELEMENT_NAMES, SCREEN_NAMES, ACTION_TYPES } from '../../../../components/tracking';

export const ChartDisplayToggle: React.FC<ChartDisplayToggleProps> = ({
  selectedMode,
  onModeSelected,
}) => {
  const { selectedLanguage } = useSelectedLanguage();
  const currentLanguage = (selectedLanguage || 'Eng') as Language;

  return (
    <View style={styles.container}>
      <TrackableTouchable
        actionName={ELEMENT_NAMES.TOG_CHART_DISPLAY}
        actionType={ACTION_TYPES.TOGGLE}
        screenName={SCREEN_NAMES.HISTORY}
        style={[
          styles.toggleButton,
          styles.leftButton,
          selectedMode === 'concentration' && styles.selectedButton,
        ]}
        onPress={() => onModeSelected('concentration')}
        additionalTrackingData={{
          to_mode: 'concentration',
          from_mode: selectedMode
        }}
      >
        <Text
          style={[
            styles.buttonText,
            selectedMode === 'concentration' && styles.selectedButtonText,
          ]}
        >
          {getTranslation('concentration', currentLanguage)}
        </Text>
      </TrackableTouchable>
      <TrackableTouchable
        actionName={ELEMENT_NAMES.TOG_CHART_DISPLAY}
        actionType={ACTION_TYPES.TOGGLE}
        screenName={SCREEN_NAMES.HISTORY}
        style={[
          styles.toggleButton,
          styles.rightButton,
          selectedMode === 'aqi' && styles.selectedButton,
        ]}
        onPress={() => onModeSelected('aqi')}
        additionalTrackingData={{
          to_mode: 'aqi',
          from_mode: selectedMode
        }}
      >
        <Text
          style={[
            styles.buttonText,
            selectedMode === 'aqi' && styles.selectedButtonText,
          ]}
        >
          {getTranslation('aqi', currentLanguage)}
        </Text>
      </TrackableTouchable>
    </View>
  );
}; 