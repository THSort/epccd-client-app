import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, BackHandler } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { 
  trackScreenView, 
  trackButtonClick, 
  trackUserInput, 
  trackAppStateChange,
  trackBackButtonPress
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
        trackAppStateChange(userId, nextAppState);
        
        // If app is coming back to foreground, track screen view again
        if (
          appState.current.match(/inactive|background/) && 
          nextAppState === 'active'
        ) {
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
  
  return {
    trackButton,
    trackInput
  };
}; 