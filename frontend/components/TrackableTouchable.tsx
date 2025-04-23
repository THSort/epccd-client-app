import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useUserActivity } from '../context/UserActivityContext';

interface TrackableTouchableProps extends TouchableOpacityProps {
  actionName: string;     // Consistent key for tracking
  actionType: string;     // Type of action (e.g., 'navigation', 'selection', 'toggle')
  screenName: string;     // Current screen name
  additionalTrackingData?: Record<string, any>; // Additional data to track
}

/**
 * A touchable component that automatically tracks interactions
 *
 * Usage:
 * <TrackableTouchable
 *   actionName="toggle_filter"
 *   actionType="toggle"
 *   screenName="FiltersScreen"
 *   onPress={handleToggle}
 * >
 *   {children}
 * </TrackableTouchable>
 */
export const TrackableTouchable: React.FC<TrackableTouchableProps> = ({
  actionName,
  actionType,
  screenName,
  onPress,
  additionalTrackingData = {},
  children,
  ...rest
}) => {
  const { trackActivity } = useUserActivity();

  const handlePress = () => {
    // Track the interaction with standardized naming
    void trackActivity(
      actionType,
      {
        action_name: actionName,
        screen_name: screenName,
        timestamp: new Date().toISOString(),
        ...additionalTrackingData,
      }
    );

    // Call the original onPress handler if provided
    if (onPress) {
      onPress({} as any);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
};
