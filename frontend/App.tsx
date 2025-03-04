import React from 'react';
import {View} from 'react-native';
import HomeScreen from './screens/home-screen/home-screen.tsx';
import {styles} from './App.styles.ts';
import {SelectedLocationProvider} from './context/SelectedLocationContext.tsx';
import {SelectedLanguageProvider} from './context/SelectedLanguageContext.tsx';

function App(): React.JSX.Element {
    return (
        <SelectedLocationProvider>
            <SelectedLanguageProvider>
                <View style={styles.container}>
                    <HomeScreen/>
                </View>
            </SelectedLanguageProvider>
        </SelectedLocationProvider>
    );
}

export default App;
