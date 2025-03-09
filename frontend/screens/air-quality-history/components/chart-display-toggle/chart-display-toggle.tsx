import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './chart-display-toggle.styles';
import { ChartDisplayMode, ChartDisplayToggleProps } from './chart-display-toggle.types';

export const ChartDisplayToggle: React.FC<ChartDisplayToggleProps> = ({
  selectedMode,
  onModeSelected,
}) => {
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
          Concentration
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
          AQI
        </Text>
      </TouchableOpacity>
    </View>
  );
}; 