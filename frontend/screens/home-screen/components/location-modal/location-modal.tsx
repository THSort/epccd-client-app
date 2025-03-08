import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Modal, FlatList, Animated, Easing, TouchableWithoutFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import type {Area, LocationModalProps} from './location-modal.types';
import {styles} from './location-modal.styles';

export function LocationModal({visible, onClose, onLocationSelected, ...props}: LocationModalProps) {
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(400)).current;

    const getAreasForList = (): Area[] => {
        return [
            {
                name: 'Lahore',
                locations: ['Lahore location 1', 'Lahore location 2', 'Lahore location 3', 'Lahore location 4'],
            },
            {
                name: 'Islamabad',
                locations: ['Islamabad location 1', 'Islamabad location 2'],
            },
            {
                name: 'Karachi',
                locations: ['Karachi location 1', 'Karachi location 2'],
            },
        ];
    };

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(overlayOpacity, {toValue: 1, duration: 300, useNativeDriver: true}),
                Animated.timing(slideAnim, {toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true}),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(overlayOpacity, {toValue: 0, duration: 200, useNativeDriver: true}),
                Animated.timing(slideAnim, {toValue: 400, duration: 200, useNativeDriver: true}),
            ]).start();
        }
    }, [visible]);

    const toggleDropdown = (area: string) => {
        setSelectedArea((prev) => (prev === area ? null : area));
    };

    return (
        <Modal onRequestClose={()=>{
            onClose();
        }} visible={visible} transparent animationType="none">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.container}>
                    <Animated.View style={[styles.overlay, {opacity: overlayOpacity}]}/>

                    {/* Bottom Sheet */}
                    <TouchableWithoutFeedback>
                        <Animated.View style={[styles.modalContent, {transform: [{translateY: slideAnim}]}]}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Icon name="map-marker" size={20} color="#FFD700"/>
                                <Text style={styles.title}>Area</Text>
                                <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeButton}>
                                    <Icon name="close" size={22} color="#FFD700"/>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.divider}/>

                            {/* Areas List */}
                            <FlatList
                                data={getAreasForList()}
                                keyExtractor={(item) => item.name}
                                renderItem={({item}) => {
                                    const isExpanded = selectedArea === item.name;
                                    return (
                                        <View>
                                            {/* Area Button */}
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => toggleDropdown(item.name)}
                                                style={styles.areaButton}
                                            >
                                                <Text style={styles.areaText}>{item.name}</Text>
                                                <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#FFD700"/>
                                            </TouchableOpacity>

                                            {/* Locations (Dropdown) */}
                                            {isExpanded && (
                                                <Animated.View style={styles.locationList}>
                                                    {item.locations.map((location) => {
                                                        const isSelected = location === props.selectedLocation;
                                                        return (
                                                            <TouchableOpacity
                                                                key={location}
                                                                style={[
                                                                    styles.locationButton,
                                                                    isSelected && styles.selectedLocation, // Apply selected style
                                                                ]}
                                                                onPress={() => {
                                                                    onLocationSelected(location);
                                                                }}
                                                            >
                                                                <Text style={styles.locationText}>{location}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </Animated.View>
                                            )}
                                        </View>
                                    );
                                }}
                            />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
