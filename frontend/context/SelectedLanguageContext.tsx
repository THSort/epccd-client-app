import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateLanguagePreference } from '../services/user.service';
import { getUserId } from '../utils/storage.util';

// Define types
type LanguageContextType = {
    selectedLanguage: string | null;
    setSelectedLanguage: (language: string) => void;
    isLoadingLanguage: boolean;
};

// Create Context
const SelectedLanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider Component
export const SelectedLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedLanguage, setSelectedLanguageState] = useState<string | null>(null);
    const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);

    // Load language from AsyncStorage once on app startup
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem('selected_language');
                if (storedLanguage) {
                    setSelectedLanguageState(storedLanguage);
                } else {
                    // Set Urdu as the default language
                    setSelectedLanguageState('اردو');
                    await AsyncStorage.setItem('selected_language', 'اردو');
                }
            } catch (error) {
                console.error('Error loading language:', error);
                // Even on error, set default to Urdu
                setSelectedLanguageState('اردو');
            } finally {
                setIsLoadingLanguage(false);
            }
        };

        loadLanguage();
    }, []);

    // Function to update both context and AsyncStorage
    const setSelectedLanguage = async (language: string) => {
        setSelectedLanguageState(language);
        await AsyncStorage.setItem('selected_language', language);
        
        // Update language preference in the database if user is logged in
        try {
            const userId = await getUserId();
            if (userId) {
                await updateLanguagePreference(userId, language);
            }
        } catch (error) {
            console.error('Error updating language preference in database:', error);
            // Continue even if this fails - the local setting is more important
        }
    };

    return (
        <SelectedLanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, isLoadingLanguage }}>
            {children}
        </SelectedLanguageContext.Provider>
    );
};

// Hook to use the context
export const useSelectedLanguage = () => {
    const context = useContext(SelectedLanguageContext);
    if (!context) {
        throw new Error('useSelectedLanguage must be used within a SelectedLanguageProvider');
    }
    return context;
};
