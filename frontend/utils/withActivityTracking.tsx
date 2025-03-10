import React from 'react';
import { useActivityTracking } from '../hooks/useActivityTracking';

/**
 * Higher-order component that adds activity tracking to any component
 * @param WrappedComponent - The component to wrap with activity tracking
 * @param screenName - The name of the screen for tracking purposes
 * @returns A new component with activity tracking
 */
export const withActivityTracking = (
  WrappedComponent: React.ComponentType<any>,
  screenName: string
) => {
  // Return a new component
  const WithActivityTracking = (props: any) => {
    // Get the user ID from props or context
    const userId = props.userId || '';
    
    // Use the activity tracking hook
    const { trackButton, trackInput, trackBackButton, trackAppExit, trackAppEntry } = useActivityTracking(userId, screenName);
    
    // Pass the tracking functions to the wrapped component
    return (
      <WrappedComponent
        {...props}
        trackButton={trackButton}
        trackInput={trackInput}
        trackBackButton={trackBackButton}
        trackAppExit={trackAppExit}
        trackAppEntry={trackAppEntry}
      />
    );
  };
  
  // Set display name for debugging
  WithActivityTracking.displayName = `WithActivityTracking(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  
  return WithActivityTracking;
}; 