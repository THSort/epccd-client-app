import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LocationModal } from '../home-screen/components/location-modal/location-modal';
import { Location } from '../../App.types';
import { registerUser, submitDemographicSurvey } from '../../services/user.service';
import { storeUserId } from '../../utils/storage.util';

// Dummy FCM token for now
const DUMMY_FCM_TOKEN = 'dummy_fcm_token_for_testing111';

interface RegistrationScreenProps {
  onRegistrationComplete: () => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegistrationComplete }) => {
  // Step tracking (1: location, 2: mobile, 3: asthma)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form data
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [hasAsthma, setHasAsthma] = useState<boolean | null>(null);

  // UI states
  const [locationModalVisible, setLocationModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle location selection
  const handleLocationSelected = (location: Location) => {
    setSelectedLocation(location);
    setLocationModalVisible(false);
    // Move to next step after location is selected
    setCurrentStep(2);
  };

  // Handle mobile number submission
  const handleMobileSubmit = () => {
    // Mobile is optional, so we can proceed regardless
    setCurrentStep(3);
  };

  // Handle asthma selection
  const handleAsthmaSelection = async (value: boolean) => {
    setHasAsthma(value);
    await completeRegistration(value);
  };

  // Complete registration process
  const completeRegistration = async (asthmaValue: boolean) => {
    if (!selectedLocation) {
      setError('Please select a location first');
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Register user
      const userData = await registerUser(
        DUMMY_FCM_TOKEN,
        selectedLocation.locationCode,
        mobileNumber || undefined
      );

      // Step 2: Submit demographic survey
      await submitDemographicSurvey(userData.id_user, asthmaValue);

      // Step 3: Store user ID in local storage
      await storeUserId(userData.id_user);

      // Step 4: Complete registration
      onRegistrationComplete();
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Your Location</Text>
            <Text style={styles.stepDescription}>
              Choose the location for which you want to receive air quality alerts
            </Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setLocationModalVisible(true)}
            >
              <Text style={styles.locationButtonText}>
                {selectedLocation ? selectedLocation.locationName : 'Select Location'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Mobile Number (Optional)</Text>
            <Text style={styles.stepDescription}>
              Provide your mobile number to receive SMS alerts
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter mobile number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={handleMobileSubmit}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Do you have asthma?</Text>
            <Text style={styles.stepDescription}>
              This information helps us provide more relevant alerts
            </Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, hasAsthma === true && styles.selectedOption]}
                onPress={() => handleAsthmaSelection(true)}
                disabled={isLoading}
              >
                <Text style={styles.optionText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, hasAsthma === false && styles.selectedOption]}
                onPress={() => handleAsthmaSelection(false)}
                disabled={isLoading}
              >
                <Text style={styles.optionText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Air Quality App</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Setting up your account...</Text>
        </View>
      ) : (
        renderStep()
      )}

      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSelected={handleLocationSelected}
        selectedLocation={selectedLocation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  locationButton: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.48,
  },
  selectedOption: {
    backgroundColor: '#FFD700',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
});
