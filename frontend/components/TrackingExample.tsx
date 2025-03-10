import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { useUserActivity } from '../context/UserActivityContext';

/**
 * Example component demonstrating how to use the activity tracking
 */
const TrackingExample: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { trackButton, trackInput } = useUserActivity();
  const currentScreen = 'TrackingExample';

  // Handle button press with tracking
  const handleButtonPress = () => {
    // Track the button click
    trackButton('example_button', currentScreen, {
      input_value: inputValue,
      timestamp: new Date().toISOString(),
    });

    // Your actual button logic here
    Alert.alert('Button Pressed', `Button pressed with input: ${inputValue}`);
  };

  // Handle input change with tracking
  const handleInputChange = (text: string) => {
    setInputValue(text);

    // Track the input change
    trackInput('example_input', currentScreen, {
      value_length: text.length,
      has_special_chars: /[!@#$%^&*(),.?":{}|<>]/.test(text),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Tracking Example</Text>

      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={handleInputChange}
        placeholder="Type something..."
      />

      <Button
        title="Track This Click"
        onPress={handleButtonPress}
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
