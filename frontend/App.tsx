import React from 'react';
import {View} from 'react-native';
import HomeScreen from './screens/home-screen/home-screen.tsx';
import {styles} from './App.styles.ts';
import {SelectedLocationProvider} from './context/SelectedLocationContext.tsx';
import {SelectedLanguageProvider} from './context/SelectedLanguageContext.tsx';
import {AirQualityDetailedReport} from './screens/air-quality-detailed-report/air-quality-detailed-report.tsx';
import {AirQualityHistory} from './screens/air-quality-history/air-quality-history.tsx';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { Location } from './App.types.ts';
import {Pollutant} from './screens/air-quality-detailed-report/air-quality-detailed-report.types.ts';

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
    return (
        <SelectedLocationProvider>
            <SelectedLanguageProvider>
                <NavigationContainer>
                    <View style={styles.container}>
                        <Stack.Navigator>
                            <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
                            <Stack.Screen name="AirQualityDetailedReport" component={AirQualityDetailedReport} options={{headerShown: false}} />
                            <Stack.Screen name="AirQualityHistory" component={AirQualityHistory} options={{headerShown: false}} />
                        </Stack.Navigator>
                    </View>
                </NavigationContainer>
            </SelectedLanguageProvider>
        </SelectedLocationProvider>
    );
}

export default App;
