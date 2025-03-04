import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
                }
            } catch (error) {
                console.error('Error loading language:', error);
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
