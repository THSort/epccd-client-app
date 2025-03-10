import React, { createContext, useContext, ReactNode } from 'react';
import {
  trackUserActivity,
  trackScreenView,
  trackButtonClick,
  trackUserInput,
  trackAppStateChange,
  trackBackButtonPress,
} from '../services/userActivity.service';

// Define the context type
interface UserActivityContextType {
  trackActivity: (actionType: string, actionDetails: Record<string, any>) => Promise<void>;
  trackScreen: (screenName: string, additionalDetails?: Record<string, any>) => Promise<void>;
  trackButton: (buttonName: string, screenName: string, additionalDetails?: Record<string, any>) => Promise<void>;
  trackInput: (inputName: string, screenName: string, additionalDetails?: Record<string, any>) => Promise<void>;
  trackAppState: (appState: string) => Promise<void>;
  trackBackButton: (screenName: string) => Promise<void>;
}

// Create the context with default values
const UserActivityContext = createContext<UserActivityContextType>({
  trackActivity: async () => {},
  trackScreen: async () => {},
  trackButton: async () => {},
  trackInput: async () => {},
  trackAppState: async () => {},
  trackBackButton: async () => {},
});

// Provider props type
interface UserActivityProviderProps {
  children: ReactNode;
  userId: string;
}

/**
 * Provider component for user activity tracking
 */
export const UserActivityProvider: React.FC<UserActivityProviderProps> = ({ children, userId }) => {
  // Define the tracking functions
  const trackActivity = async (actionType: string, actionDetails: Record<string, any>) => {
    if (userId) {
      await trackUserActivity(userId, actionType, actionDetails);
    }
  };

  const trackScreen = async (screenName: string, additionalDetails: Record<string, any> = {}) => {
    if (userId) {
      await trackScreenView(userId, screenName, additionalDetails);
    }
  };

  const trackButton = async (
    buttonName: string,
    screenName: string,
    additionalDetails: Record<string, any> = {}
  ) => {
    if (userId) {
      await trackButtonClick(userId, buttonName, screenName, additionalDetails);
    }
  };

  const trackInput = async (
    inputName: string,
    screenName: string,
    additionalDetails: Record<string, any> = {}
  ) => {
    if (userId) {
      await trackUserInput(userId, inputName, screenName, additionalDetails);
    }
  };

  const trackAppState = async (appState: string) => {
    if (userId) {
      await trackAppStateChange(userId, appState);
    }
  };

  const trackBackButton = async (screenName: string) => {
    if (userId) {
      await trackBackButtonPress(userId, screenName);
    }
  };

  // Create the context value
  const contextValue: UserActivityContextType = {
    trackActivity,
    trackScreen,
    trackButton,
    trackInput,
    trackAppState,
    trackBackButton,
  };

  return (
    <UserActivityContext.Provider value={contextValue}>
      {children}
    </UserActivityContext.Provider>
  );
};

/**
 * Hook to use the user activity context
 */
export const useUserActivity = () => useContext(UserActivityContext);
