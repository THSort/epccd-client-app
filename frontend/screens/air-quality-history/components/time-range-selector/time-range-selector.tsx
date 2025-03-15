import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './time-range-selector.styles';
import { TimeRange, TimeRangeSelectorProps } from './time-range-selector.types';
import { useSelectedLanguage } from '../../../../context/SelectedLanguageContext';
import { getTranslation, Language } from '../../../../utils/translations';

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedTimeRange,
  onTimeRangeSelected,
}) => {
  const { selectedLanguage } = useSelectedLanguage();
  const currentLanguage = (selectedLanguage || 'Eng') as Language;

  // Get translated time range labels
  const getTimeRangeLabel = (timeRange: TimeRange): string => {
    switch (timeRange) {
      case '1d':
        return getTranslation('day', currentLanguage);
      case '1w':
        return getTranslation('week', currentLanguage);
      case '1m':
        return getTranslation('month', currentLanguage);
      case '3m':
        return getTranslation('threeMonths', currentLanguage);
      case '6m':
        return getTranslation('sixMonths', currentLanguage);
      case '1y':
        return getTranslation('year', currentLanguage);
      default:
        return '';
    }
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '1d', label: getTimeRangeLabel('1d') },
    { value: '1w', label: getTimeRangeLabel('1w') },
    { value: '1m', label: getTimeRangeLabel('1m') },
    { value: '3m', label: getTimeRangeLabel('3m') },
    { value: '6m', label: getTimeRangeLabel('6m') },
    { value: '1y', label: getTimeRangeLabel('1y') },
  ];

  return (
    <View style={styles.scrollContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              selectedTimeRange === option.value && styles.selectedOption,
            ]}
            onPress={() => onTimeRangeSelected(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                selectedTimeRange === option.value && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
