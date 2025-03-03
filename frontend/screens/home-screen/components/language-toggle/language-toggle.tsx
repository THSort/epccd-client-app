import React, { ReactElement, useState, useRef } from 'react';
import { Text, TouchableOpacity, Animated } from 'react-native';
import { styles } from './language-toggle.styles';

export function LanguageToggle(): ReactElement {
    const [isEnglish, setIsEnglish] = useState(true);
    const translateX = useRef(new Animated.Value(0)).current;

    const toggleLanguage = () => {
        Animated.timing(translateX, {
            toValue: isEnglish ? 55 : 0, // Moves the circle left or right
            duration: 200,
            useNativeDriver: true,
        }).start();

        setIsEnglish(!isEnglish);
    };

    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.toggleContainer} onPress={toggleLanguage}>
            <Animated.View style={[styles.toggleCircle, styles.toggleOn, { transform: [{ translateX }] }]}>
                <Text style={styles.toggleText}>{isEnglish ? 'Eng' : 'اردو'}</Text>
            </Animated.View>
            <Text style={styles.languageText}>{'Eng'}</Text>
            <Text style={styles.languageText}>{'اردو'}</Text>
        </TouchableOpacity>
    );
}
