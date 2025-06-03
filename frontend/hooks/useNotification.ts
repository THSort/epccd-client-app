import {PermissionsAndroid} from 'react-native';
import {useEffect, useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing FCM token
const FCM_TOKEN_KEY = 'fcm_token';

const requestUserPermission = async () => {
    // console.log('requestUserPermission!!!');

    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log('Notifications permission granted');
    } else {
        // console.log('Notifications permission denied');
    }
};

/**
 * Store FCM token in AsyncStorage
 * @param token - The FCM token to store
 */
export const storeFcmToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        // console.log('FCM token stored successfully');
    } catch (error) {
        // console.error('Error storing FCM token:', error);
        throw error;
    }
};

/**
 * Get FCM token from AsyncStorage
 * @returns The stored FCM token or null if not found
 */
export const getFcmTokenFromStorage = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(FCM_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Generate a new FCM token if one doesn't exist in storage
 * @returns The FCM token
 */
export const generateFcmToken = async (): Promise<string> => {
    try {
        // Check if token exists in storage
        const storedToken = await getFcmTokenFromStorage();

        if (storedToken) {
            // console.log('Using existing FCM token from storage');
            return storedToken;
        }

        // Generate new token if not found in storage
        const newToken = await messaging().getToken();
        // console.log('New FCM token generated:', newToken);

        // Store the new token
        await storeFcmToken(newToken);

        return newToken;
    } catch (error) {
        console.error('Failed to get or generate token', error);
        throw error;
    }
};

export const useNotification = () => {
    // console.log('useNotification');

    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const setupNotifications = async () => {
            try {
                await requestUserPermission();
                const token = await generateFcmToken();
                setFcmToken(token);
                setLoading(false);
            } catch (error) {
                console.error('Error setting up notifications:', error);
            }
        };

        setupNotifications();
    }, []);

    return { fcmToken, loading };
};
