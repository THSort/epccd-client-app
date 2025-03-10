import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, BackHandler } from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  trackScreenView,
  trackButtonClick,
  trackUserInput,
  trackAppStateChange,
  trackBackButtonPress,
  trackAppExit,
  trackAppEntry,
} from '../services/userActivity.service';

/**
 * Hook for tracking user activity
 * @param userId - The user ID
 * @param screenName - The name of the current screen
 * @returns Object containing tracking functions
 */
export const useActivityTracking = (userId: string, screenName: string) => {
  const route = useRoute();
  const appState = useRef(AppState.currentState);

  // Track screen view when component mounts
  useEffect(() => {
    if (userId) {
      const routeParams = route.params || {};
      trackScreenView(userId, screenName, { route_params: routeParams });
    }
  }, [userId, screenName, route.params]);

  // Track app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (userId) {
        // Track general app state change
        trackAppStateChange(userId, nextAppState);

        // Track app exit (going to background or inactive)
        if (
          appState.current === 'active' &&
          (nextAppState === 'background' || nextAppState === 'inactive')
        ) {
          trackAppExit(userId, screenName, {
            previous_state: appState.current,
            new_state: nextAppState,
          });
        }

        // Track app entry (coming back to foreground)
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          trackAppEntry(userId, screenName, {
            previous_state: appState.current,
            new_state: nextAppState,
          });

          // Also track screen view again when coming back to foreground
          trackScreenView(userId, screenName, { from_background: true });
        }

        appState.current = nextAppState;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userId, screenName]);

  // Track hardware back button presses
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('______________');
      if (userId) {
        trackBackButtonPress(userId, screenName);
      }
      return false; // Don't prevent default behavior
    });

    return () => {
      backHandler.remove();
    };
  }, [userId, screenName]);

  // Function to track button clicks
  const trackButton = useCallback((
    buttonName: string,
    additionalDetails: Record<string, any> = {}
  ) => {
    if (userId) {
      trackButtonClick(userId, buttonName, screenName, additionalDetails);
    }
  }, [userId, screenName]);

  // Function to track user input
  const trackInput = useCallback((
    inputName: string,
    additionalDetails: Record<string, any> = {}
  ) => {
    if (userId) {
      trackUserInput(userId, inputName, screenName, additionalDetails);
    }
  }, [userId, screenName]);

  // Function to manually track back button press
  const trackBackButton = useCallback(() => {
    if (userId) {
      trackBackButtonPress(userId, screenName);
    }
  }, [userId, screenName]);

  // Function to manually track app exit
  const handleAppExit = useCallback((
    additionalDetails: Record<string, any> = {}
  ) => {
    if (userId) {
      trackAppExit(userId, screenName, additionalDetails);
    }
  }, [userId, screenName]);

  // Function to manually track app entry
  const handleAppEntry = useCallback((
    additionalDetails: Record<string, any> = {}
  ) => {
    if (userId) {
      trackAppEntry(userId, screenName, additionalDetails);
    }
  }, [userId, screenName]);

  return {
    trackButton,
    trackInput,
    trackBackButton,
    trackAppExit: handleAppExit,
    trackAppEntry: handleAppEntry,
  };
};
