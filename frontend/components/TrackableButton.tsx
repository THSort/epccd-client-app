import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text, StyleSheet } from 'react-native';
import { useUserActivity } from '../context/UserActivityContext';

interface TrackableButtonProps extends TouchableOpacityProps {
  buttonName: string;  // Consistent key for tracking
  screenName: string;  // Current screen name
  label?: string;      // Button text
  additionalTrackingData?: Record<string, any>;  // Additional data to track
  children?: React.ReactNode;
}

/**
 * A button component that automatically tracks clicks
 *
 * Usage:
 * <TrackableButton
 *   buttonName="view_detailed_report"
 *   screenName="HomeScreen"
 *   onPress={() => navigation.navigate('Details')}
 * >
 *   <Text>View Details</Text>
 * </TrackableButton>
 */
export const TrackableButton: React.FC<TrackableButtonProps> = ({
  buttonName,
  screenName,
  label,
  onPress,
  additionalTrackingData = {},
  style,
  children,
  ...rest
}) => {
  const { trackButton } = useUserActivity();

  const handlePress = () => {
    // Track the button click with standardized naming
    void trackButton(
      buttonName,
      screenName,
      {
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
      style={[styles.button, style]}
      onPress={handlePress}
      {...rest}
    >
      {label ? <Text style={styles.label}>{label}</Text> : children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    // Basic styling - will usually be overridden by style prop
    padding: 10,
    borderRadius: 8,
  },
  label: {
    textAlign: 'center',
  },
});
