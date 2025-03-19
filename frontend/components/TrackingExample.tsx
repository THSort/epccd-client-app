import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TrackableButton, TrackableInput } from './tracking';
import { ELEMENT_NAMES, SCREEN_NAMES } from '../utils/trackingConstants';

/**
 * Example component demonstrating how to use the activity tracking
 */
const TrackingExample: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const currentScreen = SCREEN_NAMES.HOME;

  // Handle button press
  const handleButtonPress = () => {
    // Your actual button logic here
    Alert.alert('Button Pressed', `Button pressed with input: ${inputValue}`);
  };

  // Handle input change
  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Tracking Example</Text>

      <TrackableInput
        inputName={ELEMENT_NAMES.INP_NAME}
        screenName={currentScreen}
        style={styles.input}
        value={inputValue}
        onChangeText={handleInputChange}
        placeholder="Type something..."
        additionalTrackingData={{
          component: 'TrackingExample'
        }}
      />

      <TrackableButton
        buttonName={ELEMENT_NAMES.BTN_SUBMIT}
        screenName={currentScreen}
        onPress={handleButtonPress}
        label="Track This Click"
        additionalTrackingData={{
          input_value: inputValue,
          component: 'TrackingExample'
        }}
      />

      <Text style={styles.note}>
        Every interaction with this component is being tracked!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default TrackingExample;
