import { useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useUserActivity } from '../context/UserActivityContext';
import { useNavigation } from '@react-navigation/native';

/**
 * Custom hook to handle hardware back button presses
 * Tracks back button press events and performs navigation
 * 
 * @param screenName - The name of the current screen for tracking
 * @param overrideAction - Optional function to override the default back action
 * @returns A function that can be called to manually trigger the back action
 */
export const useBackButtonHandler = (
  screenName: string,
  overrideAction?: () => boolean
) => {
  const { trackBackButton } = useUserActivity();
  const navigation = useNavigation();

  // Handle hardware back button press
  const handleBackButtonPress = useCallback(() => {
    // If an override action is provided and it returns true, 
    // we've handled the action and should prevent default behavior
    if (overrideAction && overrideAction()) {
      return true;
    }

    // Track the back button press using the UserActivityContext
    trackBackButton(screenName);
    
    // Navigate back
    navigation.goBack();
    
    // Prevent default behavior since we're handling navigation
    return true;
  }, [navigation, overrideAction, screenName, trackBackButton]);

  // Set up hardware back button listener
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress', 
      handleBackButtonPress
    );
    
    // Clean up listener on unmount
    return () => backHandler.remove();
  }, [handleBackButtonPress]);

  // Return the handler so it can be called manually if needed
  return handleBackButtonPress;
}; 