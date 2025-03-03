import React from 'react';
import {View} from 'react-native';
import HomeScreen from './screens/home-screen/home-screen.tsx';
import {styles} from './App.styles.ts';

function App(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <HomeScreen/>
        </View>
    );
}

export default App;
