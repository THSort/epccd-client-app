import React, {useEffect, useState, useRef} from 'react';
import {View, ActivityIndicator, AppState, AppStateStatus} from 'react-native';
import HomeScreen from './screens/home-screen/home-screen.tsx';
import {styles} from './App.styles.ts';
import {SelectedLocationProvider} from './context/SelectedLocationContext.tsx';
import {SelectedLanguageProvider} from './context/SelectedLanguageContext.tsx';
import {AirQualityDetailedReport} from './screens/air-quality-detailed-report/air-quality-detailed-report.tsx';
import {AirQualityHistory} from './screens/air-quality-history/air-quality-history.tsx';
import SettingsScreen from './screens/settings-screen/settings-screen.tsx';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Location} from './App.types.ts';
import {Pollutant} from './screens/air-quality-detailed-report/air-quality-detailed-report.types.ts';
import {UserActivityProvider} from './context/UserActivityContext.tsx';
import {RegistrationScreen} from './screens/registration-screen';
import {getUserId} from './utils/storage.util.ts';
import {LearnMoreScreen} from './screens/learn-more-screen';
import {UpdateScreen} from './screens/update-screen/update-screen.tsx';
import {checkAppVersion, VersionCheckResponse} from './services/version.service.ts';
import packageJson from './package.json';
// test

type RootStackParamList = {
    Home: undefined;
    AirQualityDetailedReport: undefined;
    AirQualityHistory: {
        selectedLocation?: Location,
        selectedPollutant: Pollutant
    };
    Settings: undefined;
    LearnMore: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCheckingVersion, setIsCheckingVersion] = useState<boolean>(true);
    const [versionInfo, setVersionInfo] = useState<VersionCheckResponse | null>(null);
    const [updateRequired, setUpdateRequired] = useState<boolean>(false);
    const appState = useRef(AppState.currentState);

    // Version check function (shared)
    const doVersionCheck = async () => {
        setIsCheckingVersion(true);
        try {
            const currentVersion = packageJson.version;
            const response = await checkAppVersion(currentVersion);
            setVersionInfo(response);
            if (!response.isLatest) {
                setUpdateRequired(true);
            } else {
                setUpdateRequired(false);
            }
        } catch (error) {
            console.error('Error checking app version:', error);
            setUpdateRequired(false);
        } finally {
            setIsCheckingVersion(false);
        }
    };

    // Initial version check on mount
    useEffect(() => {
        doVersionCheck();
    }, []);

    // AppState listener for foreground/background
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App has come to the foreground, check version again
                doVersionCheck();
            }
            appState.current = nextAppState;
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    // Load user ID from storage only after version check passes
    useEffect(() => {
        if (!isCheckingVersion && !updateRequired) {
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
        }
    }, [isCheckingVersion, updateRequired]);

    // Handle registration completion
    const handleRegistrationComplete = () => {
        // Reload user ID from storage
        getUserId().then(id => setUserId(id));
    };

    // Show loading screen while checking version or loading user data
    if (isCheckingVersion || (isLoading && !updateRequired)) {
        return (
            <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size="large" color="#FFD700"/>
            </View>
        );
    }

    // Show update screen if update is required
    if (updateRequired && versionInfo) {
        return (
            <SelectedLocationProvider>
                <SelectedLanguageProvider>
                    <UpdateScreen
                        versionInfo={versionInfo}
                        onRetryCheck={doVersionCheck}
                    />
                </SelectedLanguageProvider>
            </SelectedLocationProvider>
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

    // Main app with user ID (only accessible after version check passes)
    return (
        // <AnimatedGradientBackground color="#4CAF50">
            <UserActivityProvider userId={userId}>
                <SelectedLocationProvider>
                    <SelectedLanguageProvider>
                        <NavigationContainer>
                            <View style={styles.container}>
                                <Stack.Navigator>
                                    <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
                                    <Stack.Screen name="AirQualityDetailedReport" component={AirQualityDetailedReport} options={{headerShown: false}}/>
                                    <Stack.Screen name="AirQualityHistory" component={AirQualityHistory} options={{headerShown: false}}/>
                                    <Stack.Screen name="Settings" component={SettingsScreen} options={{headerShown: false}}/>
                                    <Stack.Screen name="LearnMore" component={LearnMoreScreen} options={{headerShown: false}}/>
                                </Stack.Navigator>
                            </View>
                        </NavigationContainer>
                    </SelectedLanguageProvider>
                </SelectedLocationProvider>
            </UserActivityProvider>
        // </AnimatedGradientBackground>

    );
}

export default App;
