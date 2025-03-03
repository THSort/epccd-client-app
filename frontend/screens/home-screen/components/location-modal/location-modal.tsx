import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Modal, FlatList, Animated} from 'react-native';
import type {LocationModalProps} from './location-modal.types';
import {styles} from './location-modal.styles';

const areas = [
    {name: 'Lahore', locations: ['Lahore location 1', 'Lahore location 2', 'Lahore location 3', 'Lahore location 4']},
    {name: 'Islamabad', locations: ['Islamabad location 1', 'Islamabad location 2']},
    {name: 'Karachi', locations: ['Karachi location 1', 'Karachi location 2']},
];

export function LocationModal({visible, onClose}: LocationModalProps) {
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current; // Start below the screen

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 300,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none">
            <View style={styles.container}>
                <Animated.View style={[styles.overlay, {opacity: overlayOpacity}]}/>
                <Animated.View style={[styles.modalContent, {transform: [{translateY: slideAnim}]}]}>
                    {/* Center-Aligned Title */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Area</Text>
                        <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={areas}
                        keyExtractor={(item) => item.name}
                        renderItem={({item}) => (
                            <View>
                                <TouchableOpacity activeOpacity={0.7}
                                                  onPress={() => setSelectedArea(item.name)}
                                                  style={styles.areaButton}
                                >
                                    <Text style={styles.areaText}>{item.name}</Text>
                                </TouchableOpacity>
                                {selectedArea === item.name &&
                                    item.locations.map((location) => (
                                        <TouchableOpacity activeOpacity={0.7} key={location} style={styles.locationButton}>
                                            <Text style={styles.locationText}>{location}</Text>
                                        </TouchableOpacity>
                                    ))}
                            </View>
                        )}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
}
