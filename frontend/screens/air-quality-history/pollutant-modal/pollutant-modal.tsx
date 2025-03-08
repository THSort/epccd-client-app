import React from 'react';
import {Animated, Easing, FlatList, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {styles} from './pollutant-modal.styles';
import {Pollutant} from '../../air-quality-detailed-report/air-quality-detailed-report.types.ts';
import Icon from 'react-native-vector-icons/FontAwesome';
import {PollutantModalProps} from './pollutant-modal.types.ts';

export function PollutantModal({visible, onClose, selectedPollutant, onPollutantSelected}: PollutantModalProps) {
    const overlayOpacity = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(400)).current;

    React.useEffect(() => {
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

    const pollutantOptions = Object.values(Pollutant);

    return (
        <Modal onRequestClose={onClose} visible={visible} transparent animationType="none">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalContainer}>
                    <Animated.View style={[styles.modalOverlay, {opacity: overlayOpacity}]}/>

                    <TouchableWithoutFeedback>
                        <Animated.View style={[styles.modalContent, {transform: [{translateY: slideAnim}]}]}>
                            {/* Header */}
                            <View style={styles.modalHeader}>
                                <Icon name="flask" size={20} color="yellow"/>
                                <Text style={styles.modalTitle}>Select Pollutant</Text>
                                <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.modalCloseButton}>
                                    <Icon name="close" size={22} color="yellow"/>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalDivider}/>

                            {/* Pollutant List */}
                            <FlatList
                                data={pollutantOptions}
                                keyExtractor={(item) => item}
                                renderItem={({item}) => {
                                    const isSelected = item === selectedPollutant;
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.pollutantItem,
                                                isSelected && styles.selectedPollutantItem,
                                            ]}
                                            onPress={() => onPollutantSelected(item)}
                                        >
                                            <Text style={styles.pollutantItemText}>{item}</Text>
                                            {isSelected && (
                                                <Icon name="check" size={18} color="yellow"/>
                                            )}
                                        </TouchableOpacity>
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
