import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Modal, FlatList, Animated, Easing, TouchableWithoutFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Areas, LocationModalProps} from './location-modal.types';
import {styles} from './location-modal.styles';
import {Location} from '../../../../App.types';
import {useSelectedLanguage} from '../../../../context/SelectedLanguageContext.tsx';
import {getTranslation, Language, getTranslatedLocationName, getTranslatedCityName} from '../../../../utils/translations';

export function LocationModal({visible, onClose, onLocationSelected, ...props}: LocationModalProps) {
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(400)).current;
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = (selectedLanguage || 'Eng') as Language;

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
    }, [visible, overlayOpacity, slideAnim]);

    const toggleDropdown = (area: string) => {
        setSelectedArea((prev) => (prev === area ? null : area));
    };

    // Helper function to check if two locations are the same
    const isSameLocation = (loc1: Location | undefined, loc2: Location): boolean => {
        if (!loc1) {
            return false;
        }
        return loc1.locationCode === loc2.locationCode;
    };

    return (
        <Modal onRequestClose={() => {
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
                                <Text style={styles.title}>{getTranslation('selectLocation', currentLanguage)}</Text>
                                <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeButton}>
                                    <Icon name="close" size={22} color="#FFD700"/>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.divider}/>

                            {/* Areas List */}
                            <FlatList
                                data={Areas}
                                keyExtractor={(item) => item.name}
                                renderItem={({item}) => {
                                    const isExpanded = selectedArea === item.name;
                                    const translatedCityName = getTranslatedCityName(item.name, currentLanguage);

                                    return (
                                        <View>
                                            {/* Area Button */}
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => toggleDropdown(item.name)}
                                                style={styles.areaButton}
                                            >
                                                <Text style={styles.areaText}>{translatedCityName}</Text>
                                                <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#FFD700"/>
                                            </TouchableOpacity>

                                            {/* Locations (Dropdown) */}
                                            {isExpanded && (
                                                <Animated.View style={styles.locationList}>
                                                    {item.locations.map((location) => {
                                                        const isSelected = isSameLocation(props.selectedLocation, location);
                                                        const translatedLocationName = getTranslatedLocationName(location.locationName, currentLanguage);

                                                        return (
                                                            <TouchableOpacity
                                                                key={location.locationCode}
                                                                style={[
                                                                    styles.locationButton,
                                                                    isSelected && styles.selectedLocation, // Apply selected style
                                                                ]}
                                                                onPress={() => {
                                                                    onLocationSelected(location);
                                                                }}
                                                            >
                                                                <Text style={styles.locationText}>{translatedLocationName}</Text>
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
