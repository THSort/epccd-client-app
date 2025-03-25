import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import HomeScreen from './screens/home-screen/home-screen.tsx';
import {styles} from './App.styles.ts';
import {SelectedLocationProvider} from './context/SelectedLocationContext.tsx';
import {SelectedLanguageProvider} from './context/SelectedLanguageContext.tsx';
import {AirQualityDetailedReport} from './screens/air-quality-detailed-report/air-quality-detailed-report.tsx';
import {AirQualityHistory} from './screens/air-quality-history/air-quality-history.tsx';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Location} from './App.types.ts';
import {Pollutant} from './screens/air-quality-detailed-report/air-quality-detailed-report.types.ts';
import {UserActivityProvider} from './context/UserActivityContext.tsx';
import {RegistrationScreen} from './screens/registration-screen';
import {getUserId} from './utils/storage.util.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNotification} from './hooks/useNotification.ts';
import {LahoreGraph} from './screens/air-quality-detailed-report/components/lahore-graph/lahore-graph.tsx';

type RootStackParamList = {
    Home: undefined;
    AirQualityDetailedReport: undefined;
    AirQualityHistory: {
        selectedLocation?: Location,
        selectedPollutant: Pollutant
    };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Load user ID from storage on app start
    useEffect(() => {
        const loadUserId = async () => {
            try {
                const storedUserId = await getUserId();
                setUserId(storedUserId);
            } catch (error) {
                console.error('Error loading user ID:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserId();
    }, []);

    // Handle registration completion
    const handleRegistrationComplete = () => {
        // Reload user ID from storage
        getUserId().then(id => setUserId(id));
    };

    // Show loading screen while checking for user ID
    if (isLoading) {
        return (
            <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size="large" color="#FFD700"/>
            </View>
        );
    }

    // Show registration screen if no user ID is found
    if (!userId) {
        return (
            <SelectedLocationProvider>
                <SelectedLanguageProvider>
                    <RegistrationScreen onRegistrationComplete={handleRegistrationComplete}/>
                </SelectedLanguageProvider>
            </SelectedLocationProvider>
        );
    }

    // Main app with user ID
    return (
        <UserActivityProvider userId={userId}>
            <SelectedLocationProvider>
                <SelectedLanguageProvider>
                    <NavigationContainer>
                        <View style={styles.container}>
                            <Stack.Navigator>
                                <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
                                <Stack.Screen name="AirQualityDetailedReport" component={AirQualityDetailedReport} options={{headerShown: false}}/>
                                <Stack.Screen name="AirQualityHistory" component={AirQualityHistory} options={{headerShown: false}}/>
                            </Stack.Navigator>
                        </View>
                    </NavigationContainer>
                </SelectedLanguageProvider>
            </SelectedLocationProvider>
        </UserActivityProvider>
    );
}

export default App;
