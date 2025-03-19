import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useUserActivity } from '../context/UserActivityContext';

interface TrackableInputProps extends TextInputProps {
  inputName: string;      // Consistent key for tracking
  screenName: string;     // Current screen name
  additionalTrackingData?: Record<string, any>; // Additional data to track
}

/**
 * A text input component that automatically tracks user input
 * 
 * Usage:
 * <TrackableInput
 *   inputName="search_input"
 *   screenName="SearchScreen"
 *   placeholder="Search..."
 *   onChangeText={handleSearch}
 * />
 */
export const TrackableInput: React.FC<TrackableInputProps> = ({
  inputName,
  screenName,
  onChangeText,
  additionalTrackingData = {},
  style,
  ...rest
}) => {
  const { trackInput } = useUserActivity();

  const handleTextChange = (text: string) => {
    // Track the input change with standardized naming
    void trackInput(
      inputName,
      screenName,
      {
        value_length: text.length,
        has_special_chars: /[!@#$%^&*(),.?":{}|<>]/.test(text),
        ...additionalTrackingData
      }
    );

    // Call the original onChangeText handler if provided
    if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <TextInput
      style={[styles.input, style]}
      onChangeText={handleTextChange}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    // Basic styling - will usually be overridden by style prop
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  }
}); 