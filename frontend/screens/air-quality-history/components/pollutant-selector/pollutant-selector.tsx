import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './pollutant-selector.styles';
import { PollutantSelectorProps } from './pollutant-selector.types';
import { Pollutant } from '../../../air-quality-detailed-report/air-quality-detailed-report.types';

const pollutantOptions = Object.values(Pollutant).map(value => ({
  value,
  label: value,
}));

export const PollutantSelector: React.FC<PollutantSelectorProps> = ({
  selectedPollutant,
  onPollutantSelected,
}) => {
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