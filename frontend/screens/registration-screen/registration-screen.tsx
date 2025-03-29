import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LocationModal } from '../home-screen/components/location-modal/location-modal';
import { Location } from '../../App.types';
import { registerUser, submitDemographicSurvey } from '../../services/user.service';
import { storeUserId } from '../../utils/storage.util';
import { useSelectedLocation } from '../../context/SelectedLocationContext';
import { RegistrationScreenProps, RegistrationStep } from './registration-screen.types';
import { styles } from './registration-screen.styles';
import { useNotification } from '../../hooks/useNotification';
import { LanguageToggle } from '../../components/language-toggle/language-toggle.tsx';
import { useSelectedLanguage } from '../../context/SelectedLanguageContext';
import { getTranslation } from '../../utils/translations';
import { getDefaultLanguage } from '../../utils/language.util';

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegistrationComplete }) => {
  // Step tracking
  const [currentStep, setCurrentStepState] = useState<number>(RegistrationStep.Location);

  // Get the setSelectedLocation function from context
  const { setSelectedLocation: setGlobalSelectedLocation } = useSelectedLocation();

  // Get FCM token using the hook
  const { fcmToken, loading: fcmTokenLoading } = useNotification();

  // Get selected language
  const { selectedLanguage } = useSelectedLanguage();
  const currentLanguage = getDefaultLanguage(selectedLanguage);

  // Form data
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [mobileNumber, setMobileNumber] = useState<string>('');

  // UI states
  const [locationModalVisible, setLocationModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add state to track registration completion
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(false);

  // Wrapper for setCurrentStep to clear errors when changing steps
  const setCurrentStep = (step: number) => {
    // Clear any error messages when changing steps
    setError(null);
    setCurrentStepState(step);
  };

  // Handle location selection
  const handleLocationSelected = (location: Location) => {
    setSelectedLocation(location);
    // Also set the location in the global context, which will save it to AsyncStorage
    setGlobalSelectedLocation(location);
    setLocationModalVisible(false);
    // Clear any error messages
    setError(null);
    // Move to next step after location is selected
    setCurrentStep(RegistrationStep.MobileNumber);
  };

  // Handle mobile number submission
  const handleMobileSubmit = () => {
    // Clear any error messages
    setError(null);
    // Mobile is optional, so we can proceed regardless
    setCurrentStep(RegistrationStep.Asthma);
  };

  // Handle skip all button
  const handleSkipAll = async () => {
    // Double-check that we have a location selected
    if (!selectedLocation) {
      setError(getTranslation('pleaseSelectLocation', currentLanguage));
      setCurrentStep(RegistrationStep.Location);
      return;
    }

    // Clear any error messages
    setError(null);

    try {
      // Show loading indicator
      setIsLoading(true);

      // Skip to the end and complete registration with default values
      // If we're on the mobile number step, use the entered mobile number
      // Otherwise, use an empty string
      if (currentStep === RegistrationStep.MobileNumber && mobileNumber) {
        // Keep the entered mobile number
      } else {
        setMobileNumber('');
      }

      await completeRegistration(false); // Default to "No" for asthma
    } catch (error) {
      console.error('Error in skip all flow:', error);
      setError(getTranslation('registrationError', currentLanguage));
      setIsLoading(false);
    }
  };

  // Handle asthma selection
  const handleAsthmaSelection = async (value: boolean) => {
    // Clear any error messages
    setError(null);
    await completeRegistration(value);
  };

  // Handle skip asthma question
  const handleSkipAsthma = async () => {
    if (!selectedLocation) {
      setError(getTranslation('pleaseSelectLocation', currentLanguage));
      setCurrentStep(RegistrationStep.Location);
      return;
    }

    // Clear any error messages
    setError(null);
    // Skip asthma question and complete registration with default value
    await completeRegistration(false); // Default to "No" for asthma
  };

  // Complete registration process
  const completeRegistration = async (asthmaValue: boolean) => {
    // Validate required data
    if (!selectedLocation) {
      setError(getTranslation('pleaseSelectLocation', currentLanguage));
      setCurrentStep(RegistrationStep.Location);
      return;
    }

    if (fcmTokenLoading) {
      setError(getTranslation('preparingNotifications', currentLanguage));
      return;
    }

    if (!fcmToken) {
      setError(getTranslation('notificationTokenError', currentLanguage));
      return;
    }

    // Only set loading if it's not already set (to avoid flickering when called from handleSkipAll)
    if (!isLoading) {
      setIsLoading(true);
    }

    setError(null);

    try {
      // Ensure the selected location is saved in the global context
      setGlobalSelectedLocation(selectedLocation);

      // Step 1: Register user with the real FCM token
      const userData = await registerUser(
        fcmToken,
        selectedLocation.locationCode,
        mobileNumber || undefined
      );

      // Step 2: Submit demographic survey with language preference
      await submitDemographicSurvey(
        userData.id_user,
        asthmaValue,
        selectedLanguage || 'اردو'  // Include selected language, defaulting to Urdu
      );

      // Step 3: Store user ID in local storage
      await storeUserId(userData.id_user);

      // Step 4: Set registration as complete
      setIsRegistrationComplete(true);

      // Step 5: Complete registration
      onRegistrationComplete();
    } catch (err) {
      console.error('Registration error:', err);
      setError(getTranslation('registrationError', currentLanguage));
      setIsLoading(false);
    }
  };

  // Handle opening the location modal
  const handleOpenLocationModal = () => {
    // Clear any error messages when opening the modal
    setError(null);
    setLocationModalVisible(true);
  };

  // Handle closing the location modal
  const handleCloseLocationModal = () => {
    // Clear any error messages when closing the modal
    setError(null);
    setLocationModalVisible(false);
  };

  // Render progress indicators
  const renderProgressIndicators = () => {
    // Use the number of steps from the enum
    const totalSteps = Object.keys(RegistrationStep).length / 2; // Divide by 2 because enum creates both key->value and value->key mappings

    return (
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          // Determine the style based on the step and current position
          let indicatorStyle;
          if (index === 0) {
            // First indicator is always gold
            indicatorStyle = styles.goldProgressIndicator;
          } else if (index === 1 && currentStep >= RegistrationStep.MobileNumber) {
            // Second indicator is yellow when on step 2 or higher
            indicatorStyle = styles.activeProgressIndicator;
          } else if (index === 2 && currentStep >= RegistrationStep.Asthma) {
            // Third indicator is yellow when on step 3
            indicatorStyle = styles.activeProgressIndicator;
          } else {
            // All other indicators are gray
            indicatorStyle = {};
          }

          return (
            <View
              key={index}
              style={[styles.progressIndicator, indicatorStyle]}
            />
          );
        })}
      </View>
    );
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case RegistrationStep.Location:
        return (
          <View style={styles.stepContainer}>
            {renderProgressIndicators()}

            <Text style={styles.stepTitle}>
              {getTranslation('selectAreaTitle', currentLanguage)}
            </Text>

            <TouchableOpacity
              style={styles.selectAreaButton}
              onPress={handleOpenLocationModal}
            >
              <Text style={styles.selectAreaButtonText}>
                {selectedLocation ? selectedLocation.locationName : getTranslation('selectArea', currentLanguage)}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        );
      case RegistrationStep.MobileNumber:
        return (
          <View style={styles.stepContainer}>
            {renderProgressIndicators()}
            <Text style={styles.stepTitle}>
              {getTranslation('mobileNumberTitle', currentLanguage)}
            </Text>

            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCodeText}>+92</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder={getTranslation('mobileNumberPlaceholder', currentLanguage)}
                placeholderTextColor="#666666"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.skipButton} onPress={handleMobileSubmit}>
              <Text style={styles.skipIcon}>▶</Text>
              <Text style={styles.skipButtonText}>{getTranslation('skip', currentLanguage)}</Text>
            </TouchableOpacity>
          </View>
        );
      case RegistrationStep.Asthma:
        return (
          <View style={styles.stepContainer}>
            {renderProgressIndicators()}
            <Text style={styles.stepTitle}>
              {getTranslation('asthmaTitle', currentLanguage)}
            </Text>

            <TouchableOpacity
              style={styles.asthmaOptionButton}
              onPress={() => handleAsthmaSelection(true)}
              disabled={isLoading}
            >
              <View style={styles.asthmaOptionContent}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.asthmaOptionText}>{getTranslation('yes', currentLanguage)}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.asthmaOptionButtonNo}
              onPress={() => handleAsthmaSelection(false)}
              disabled={isLoading}
            >
              <View style={styles.asthmaOptionContent}>
                <Text style={styles.xIcon}>✕</Text>
                <Text style={styles.asthmaOptionTextNo}>{getTranslation('no', currentLanguage)}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkipAsthma}>
              <Text style={styles.skipIcon}>▶</Text>
              <Text style={styles.skipButtonText}>{getTranslation('skip', currentLanguage)}</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>{getTranslation('settingUpAccount', currentLanguage)}</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Only show Skip All button if we're past the location step */}
          {currentStep > RegistrationStep.Location && (
            <View style={styles.skipAllContainer}>
              <TouchableOpacity onPress={handleSkipAll} style={styles.skipAllButton}>
                <Text style={styles.skipAllIcon}>▶▶</Text>
                <Text style={styles.skipAllButtonText}>{getTranslation('skipAll', currentLanguage)}</Text>
              </TouchableOpacity>
            </View>
          )}

          {renderStep()}

          {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
          )}
        </View>
      )}

      {/* Only show language toggle if registration is not complete and not loading */}
      {!isRegistrationComplete && !isLoading && (
        <View style={styles.langToggleWrapper}>
          <LanguageToggle/>
        </View>
      )}

      <LocationModal
        visible={locationModalVisible}
        onClose={handleCloseLocationModal}
        onLocationSelected={handleLocationSelected}
        selectedLocation={selectedLocation}
      />
    </View>
  );
};
