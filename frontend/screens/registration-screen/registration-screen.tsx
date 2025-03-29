import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
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
import { getTranslation, getTranslatedNumber, TranslationStrings } from '../../utils/translations';
import { getDefaultLanguage } from '../../utils/language.util';
import { validatePakistaniMobileNumber, hasValidMobileNumberFormat } from '../../utils/phone.util';

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
  const [displayNumber, setDisplayNumber] = useState('');

  // Mobile number validation state
  const [isMobileNumberValid, setIsMobileNumberValid] = useState<boolean>(false);
  const [shouldValidateMobile, setShouldValidateMobile] = useState<boolean>(false);

  // Keyboard state
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  // UI states
  const [locationModalVisible, setLocationModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add state to track registration completion
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(false);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Validate mobile number when it changes
  useEffect(() => {
    // Check if the mobile format is valid during typing
    const formatValid = hasValidMobileNumberFormat(mobileNumber);

    // Only perform full validation if we should validate (after user has interacted)
    if (shouldValidateMobile) {
      const validation = validatePakistaniMobileNumber(mobileNumber);
      setIsMobileNumberValid(validation.isValid);

      // Error handling logic
      if (mobileNumber.trim() === '') {
        // Empty input is fine (it's optional)
        setError(null);
      } else if (!formatValid) {
        // Format is invalid (wrong pattern)
        setError(getTranslation('invalidMobileNumberFormat', currentLanguage));
      } else if (!validation.isValid) {
        // Pattern looks OK but full validation failed (likely incorrect length)
        setError(getTranslation('invalidMobileNumber', currentLanguage));
      } else {
        // All good
        setError(null);
      }
    }
  }, [mobileNumber, shouldValidateMobile, currentLanguage]);

  // Convert from Urdu display format to English format for internal processing
  const toEnglishNumber = useCallback((text: string): string => {
    if (currentLanguage !== 'اردو') {return text;}

    // Get the translations for digits
    const urduToEnglishDigits: Record<string, string> = {};

    // Create reverse mapping using existing translations
    for (let i = 0; i <= 9; i++) {
      // Create a properly typed digit key for each number
      const digitKey = `digit${i}` as keyof TranslationStrings;
      // Get the Urdu digit from translations
      const urduDigit = getTranslation(digitKey, 'اردو');
      // Map the Urdu digit to its English equivalent
      urduToEnglishDigits[urduDigit] = i.toString();
    }

    return text.split('').map(char => urduToEnglishDigits[char] || char).join('');
  }, [currentLanguage]);

  // Update display number when mobileNumber or language changes
  useEffect(() => {
    setDisplayNumber(currentLanguage === 'اردو' ?
      getTranslatedNumber(mobileNumber, currentLanguage) :
      mobileNumber);
  }, [mobileNumber, currentLanguage]);

  // Handle mobile number input
  const handleMobileNumberChange = useCallback((text: string) => {
    // Convert to English format for internal processing if in Urdu mode
    const englishNumber = currentLanguage === 'اردو' ? toEnglishNumber(text) : text;
    setMobileNumber(englishNumber);
  }, [currentLanguage, toEnglishNumber]);

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
  const handleMobileSubmit = (isSkipping = false) => {
    // If explicitly skipping, just proceed without validation
    if (isSkipping) {
      setError(null);
      setCurrentStep(RegistrationStep.Asthma);
      return;
    }

    // From here on, we're not skipping, so validate
    setShouldValidateMobile(true);

    // If the field is empty, it's fine (it's optional)
    if (mobileNumber.trim() === '') {
      setError(null);
      setCurrentStep(RegistrationStep.Asthma);
      return;
    }

    // Otherwise, check if the mobile number is valid
    const validation = validatePakistaniMobileNumber(mobileNumber);

    if (validation.isValid) {
      // If valid, update the mobile number to the formatted version
      if (validation.formattedNumber) {
        setMobileNumber(validation.formattedNumber);
      }

      // Clear any error messages
      setError(null);

      // Proceed to next step
      setCurrentStep(RegistrationStep.Asthma);
    } else {
      // Show error for invalid mobile number
      setError(getTranslation('invalidMobileNumber', currentLanguage));
    }
  };

  // Handle mobile number field blur
  const handleMobileNumberBlur = () => {
    // Don't validate if input is empty (it's optional)
    if (mobileNumber.trim() === '') {
      setError(null);
      return;
    }

    // Otherwise validate on blur
    setShouldValidateMobile(true);

    // Validate the mobile number on blur
    const validation = validatePakistaniMobileNumber(mobileNumber);
    setIsMobileNumberValid(validation.isValid);

    if (!validation.isValid) {
      // Determine the specific error to show
      if (!hasValidMobileNumberFormat(mobileNumber)) {
        setError(getTranslation('invalidMobileNumberFormat', currentLanguage));
      } else {
        setError(getTranslation('invalidMobileNumber', currentLanguage));
      }
    } else if (validation.formattedNumber) {
      // If the number is valid, update it to the standardized format
      setMobileNumber(validation.formattedNumber);
      setError(null);
    }
  };

  // Handle skip all button
  const handleSkipAll = async () => {
    // Double-check that we have a location selected
    if (!selectedLocation) {
      setError(getTranslation('pleaseSelectLocation', currentLanguage));
      setCurrentStep(RegistrationStep.Location);
      return;
    }

    // Always clear any error messages when skipping
    setError(null);

    try {
      // Show loading indicator
      setIsLoading(true);

      // Skip to the end and complete registration with default values
      // Always clear mobile number when skipping all (don't attempt validation)
      setMobileNumber('');

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

      // If there's a mobile number, ensure it's properly formatted
      let formattedMobileNumber = mobileNumber;
      if (mobileNumber) {
        const validation = validatePakistaniMobileNumber(mobileNumber);
        if (validation.isValid && validation.formattedNumber) {
          formattedMobileNumber = validation.formattedNumber;
        }
      }

      // Step 1: Register user with the real FCM token
      const userData = await registerUser(
        fcmToken,
        selectedLocation.locationCode,
        formattedMobileNumber || undefined
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

  // Complete component structure
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>{getTranslation('settingUpAccount', currentLanguage)}</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.contentContainer}>
                {/* Only show Skip All button if we're past the location step and keyboard is not visible */}
                {currentStep > RegistrationStep.Location && !isKeyboardVisible && (
                  <View style={styles.skipAllContainer}>
                    <TouchableOpacity onPress={handleSkipAll} style={styles.skipAllButton}>
                      <Text style={styles.skipAllIcon}>▶▶</Text>
                      <Text style={styles.skipAllButtonText}>{getTranslation('skipAll', currentLanguage)}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Progress indicators only shown when keyboard is not visible */}
                {!isKeyboardVisible && renderProgressIndicators()}

                {/* Step content */}
                {(() => {
                  switch (currentStep) {
                    case RegistrationStep.Location:
                      return (
                        <View style={styles.stepContainer}>
                          {isKeyboardVisible ? null : (
                            <Text style={styles.stepTitle}>
                              {getTranslation('selectAreaTitle', currentLanguage)}
                            </Text>
                          )}

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
                          {/* Always show the title for the mobile number step */}
                          <Text style={styles.stepTitle}>
                            {getTranslation('mobileNumberTitle', currentLanguage)}
                          </Text>

                          <View style={styles.phoneInputContainer}>
                            <View style={styles.countryCodeContainer}>
                              <Text style={styles.countryCodeText}>
                                {currentLanguage === 'اردو' ? '+۹۲' : '+92'}
                              </Text>
                            </View>
                            <TextInput
                              style={styles.phoneInput}
                              placeholder={
                                currentLanguage === 'اردو'
                                  ? getTranslatedNumber(getTranslation('mobileNumberPlaceholder', currentLanguage), currentLanguage)
                                  : getTranslation('mobileNumberPlaceholder', currentLanguage)
                              }
                              placeholderTextColor="#666666"
                              value={displayNumber}
                              onChangeText={handleMobileNumberChange}
                              onBlur={handleMobileNumberBlur}
                              keyboardType="numeric"
                              maxLength={13}
                              autoComplete="tel"
                              textContentType="telephoneNumber"
                            />
                          </View>

                          {/* Show error message if there is one */}
                          {error && (
                            <View style={styles.errorContainer}>
                              <Text style={styles.errorText}>{error}</Text>
                            </View>
                          )}

                          {/* Show Next button if mobile number is valid, otherwise show Skip button */}
                          <View style={styles.actionButtonContainer}>
                            {isMobileNumberValid ? (
                              <TouchableOpacity style={styles.button} onPress={() => handleMobileSubmit(false)}>
                                <Text style={styles.buttonText}>{getTranslation('next', currentLanguage)}</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.skipButton}
                                onPress={() => {
                                  // Always clear any error when skipping
                                  setError(null);

                                  // Just proceed to next step regardless of validation
                                  setCurrentStep(RegistrationStep.Asthma);
                                }}
                              >
                                <Text style={styles.skipIcon}>▶</Text>
                                <Text style={styles.skipButtonText}>{getTranslation('skip', currentLanguage)}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    case RegistrationStep.Asthma:
                      return (
                        <View style={styles.stepContainer}>
                          {isKeyboardVisible ? null : (
                            <Text style={styles.stepTitle}>
                              {getTranslation('asthmaTitle', currentLanguage)}
                            </Text>
                          )}

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
                })()}

                {/* Only show global error message if we're not on the Mobile Number step */}
                {error && currentStep !== RegistrationStep.MobileNumber && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>

              {/* Only show language toggle if registration is not complete, not loading, and keyboard is not visible */}
              {!isRegistrationComplete && !isLoading && !isKeyboardVisible && (
                <View style={styles.langToggleWrapper}>
                  <LanguageToggle/>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </TouchableWithoutFeedback>

      <LocationModal
        visible={locationModalVisible}
        onClose={handleCloseLocationModal}
        onLocationSelected={handleLocationSelected}
        selectedLocation={selectedLocation}
      />
    </KeyboardAvoidingView>
  );
};
