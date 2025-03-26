import React, { ReactElement, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, Animated } from 'react-native';
import { styles } from './language-toggle.styles.ts';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';

const VALID_LANGUAGES = ['Eng', 'اردو'] as const;
type LanguageType = (typeof VALID_LANGUAGES)[number];

export function LanguageToggle(): ReactElement {
    const { selectedLanguage, setSelectedLanguage } = useSelectedLanguage();
    const translateX = useRef(new Animated.Value(selectedLanguage === 'اردو' ? 55 : 0)).current;

    // Sync animation when selectedLanguage changes
    useEffect(() => {
        Animated.timing(translateX, {
            toValue: selectedLanguage === 'اردو' ? 55 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [selectedLanguage]);

    const toggleLanguage = () => {
        const newLanguage: LanguageType = selectedLanguage === 'Eng' ? 'اردو' : 'Eng';
        setSelectedLanguage(newLanguage);
    };

    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.toggleContainer} onPress={toggleLanguage}>
            <Animated.View style={[styles.toggleCircle, styles.toggleOn, { transform: [{ translateX }] }]}>
                <Text style={styles.toggleText}>{selectedLanguage}</Text>
            </Animated.View>
            <Text style={styles.languageText}>Eng</Text>
            <Text style={styles.languageText}>اردو</Text>
        </TouchableOpacity>
    );
}
