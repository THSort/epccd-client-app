import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const USER_ID_KEY = 'user_id';

/**
 * Store user ID in AsyncStorage
 * @param userId - The user ID to store
 */
export const storeUserId = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  } catch (error) {
    console.error('Error storing user ID:', error);
    throw error;
  }
};

/**
 * Get user ID from AsyncStorage
 * @returns The stored user ID or null if not found
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Remove user ID from AsyncStorage
 */
export const removeUserId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error removing user ID:', error);
    throw error;
  }
}; 