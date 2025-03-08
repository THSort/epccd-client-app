import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location } from '../App.types.ts';

// Define types
type LocationContextType = {
    selectedLocation: Location | undefined;
    setSelectedLocation: (location: Location) => void;
    isLoadingLocation: boolean;
};

// Create Context
const SelectedLocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider Component
export const SelectedLocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedLocation, setSelectedLocationState] = useState<Location | undefined>(undefined);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);

    // Load location once when app starts
    useEffect(() => {
        const loadLocation = async () => {
            try {
                const storedLocation = await AsyncStorage.getItem('selected_location');
                if (storedLocation) {
                    setSelectedLocationState(JSON.parse(storedLocation) as Location);
                }
            } catch (error) {
                console.error('Error loading location:', error);
            } finally {
                setIsLoadingLocation(false);
            }
        };

        loadLocation();
    }, []);

    // Function to update both context and AsyncStorage
    const setSelectedLocation = async (location: Location) => {
        setSelectedLocationState(location);
        await AsyncStorage.setItem('selected_location', JSON.stringify(location));
    };

    return (
        <SelectedLocationContext.Provider value={{ selectedLocation, setSelectedLocation, isLoadingLocation }}>
            {children}
        </SelectedLocationContext.Provider>
    );
};

// Hook to use the context
export const useSelectedLocation = () => {
    const context = useContext(SelectedLocationContext);
    if (!context) {
        throw new Error('useSelectedLocation must be used within a SelectedLocationProvider');
    }
    return context;
};
