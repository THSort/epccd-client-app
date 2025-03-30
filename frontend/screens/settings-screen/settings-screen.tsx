import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, Modal, FlatList, ScrollView, Animated, Easing, TouchableWithoutFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {styles} from './settings-screen.styles';
import {AlertThreshold, AlertThresholdOption} from './settings-screen.types';
import {SettingsScreenNavigationProps} from '../../types/navigation.types';
import {LocationModal} from '../home-screen/components/location-modal/location-modal';
import {useLocationModal} from '../home-screen/components/location-modal/location-modal.types';
import {useSelectedLocation} from '../../context/SelectedLocationContext';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext';
import {LanguageToggle} from '../../components/language-toggle/language-toggle';
import {getTranslation, getTranslatedLocationName, Language, TranslationStrings} from '../../utils/translations';
import {updateUserLocation, updateUserAlertsThreshold} from '../../services/api.service';
import {ACTION_TYPES, ELEMENT_NAMES, SCREEN_NAMES} from '../../utils/trackingConstants';
import {useUserActivity} from '../../context/UserActivityContext';
import {getUserId} from '../../utils/storage.util.ts';

const SCREEN_NAME = SCREEN_NAMES.SETTINGS;

const SettingsScreen = () => {
    const navigation = useNavigation<SettingsScreenNavigationProps>();
    const isFocused = useIsFocused();

    // User ID - would typically come from a user context or auth state
    const [userId, setUserId] = useState<string | null>(null);

    // Track which settings are being updated
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);
    const [_isUpdatingLanguage, _setIsUpdatingLanguage] = useState(false);

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isErrorToast, setIsErrorToast] = useState(false);

    // Alert threshold modal
    const [showThresholdModal, setShowThresholdModal] = useState(false);
    const [selectedThreshold, setSelectedThreshold] = useState<AlertThreshold>('unhealthy');

    // Location modal
    const {isModalOpen, openLocationModal, closeLocationModal} = useLocationModal();
    const {selectedLocation, setSelectedLocation} = useSelectedLocation();

    // Language
    const {selectedLanguage, isLoadingLanguage} = useSelectedLanguage();

    // Tracking
    const {trackActivity} = useUserActivity();

    // Get the current language with English as default
    const currentLanguage = (selectedLanguage || 'Eng') as Language;

    // Alert threshold options with colors
    const alertThresholdOptions: AlertThresholdOption[] = [
        {value: 'good', colorHex: '#4CAF50', labelKey: 'good'},
        {value: 'satisfactory', colorHex: '#8BC34A', labelKey: 'satisfactory'},
        {value: 'moderate', colorHex: '#FFEB3B', labelKey: 'moderate'},
        {value: 'unhealthyForSensitive', colorHex: '#FF9800', labelKey: 'unhealthyForSensitive'},
        {value: 'unhealthy', colorHex: '#F44336', labelKey: 'unhealthy'},
        {value: 'veryUnhealthy', colorHex: '#9C27B0', labelKey: 'veryUnhealthy'},
        {value: 'hazardous', colorHex: '#6D4C41', labelKey: 'hazardous'},
    ];

    // Update modal animation references
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(400)).current;

    // Animate modal when visibility changes
    useEffect(() => {
        if (showThresholdModal) {
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
    }, [showThresholdModal, overlayOpacity, slideAnim]);

    // Load user data when the screen is focused
    useEffect(() => {
        if (isFocused) {
            loadUserData();
        }
    }, [isFocused]);

    // Load user data from storage
    const loadUserData = async () => {
        try {
            const storedUserId = await getUserId();
            if (storedUserId) {
                setUserId(storedUserId);
            }

            // Load alert threshold from storage
            const storedThreshold = await AsyncStorage.getItem('alertThreshold');
            if (storedThreshold) {
                setSelectedThreshold(storedThreshold as AlertThreshold);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    // Show toast message
    const showToastMessage = (key: keyof TranslationStrings, isError: boolean = false) => {
        let message = getTranslation(key, currentLanguage);
        if (isError) {
            message = `${message}. ${getTranslation('pleaseRetryLater' as keyof TranslationStrings, currentLanguage)}`;
        }
        setToastMessage(message);
        setIsErrorToast(isError);
        setShowToast(true);

        // Hide toast after 3 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    // Handle location change
    const handleLocationChange = async (location: any) => {
        if (!userId) {
            showToastMessage('userIdNotFound', true);
            return;
        }

        setIsUpdatingLocation(true);

        try {
            // Store in AsyncStorage
            await AsyncStorage.setItem('selectedLocation', JSON.stringify(location));

            // Update location in context
            setSelectedLocation(location);

            // Make API call to update user location
            await updateUserLocation(userId, location.locationCode);

            // Show success message
            showToastMessage('locationUpdateSuccess');

            // Track activity
            trackActivity(ACTION_TYPES.SELECTION, {
                action_name: ELEMENT_NAMES.SEL_LOCATION,
                screen_name: SCREEN_NAME,
                location_code: location.locationCode,
                location_name: location.locationName,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error updating location:', error);
            showToastMessage('locationUpdateError', true);
        } finally {
            setIsUpdatingLocation(false);
            closeLocationModal();
        }
    };

    // Handle threshold change
    const handleThresholdChange = async (threshold: AlertThreshold) => {
        if (!userId) {
            showToastMessage('userIdNotFound', true);
            return;
        }

        setShowThresholdModal(false);
        setIsUpdatingThreshold(true);

        try {
            // Store in AsyncStorage
            await AsyncStorage.setItem('alertThreshold', threshold);

            // Update state
            setSelectedThreshold(threshold);

            // Make API call to update user alert threshold
            await updateUserAlertsThreshold(userId, threshold);

            // Show success message
            showToastMessage('thresholdUpdateSuccess');

            // Track activity
            trackActivity(ACTION_TYPES.SELECTION, {
                action_name: ELEMENT_NAMES.ALERT_THRESHOLD,
                screen_name: SCREEN_NAME,
                threshold_value: threshold,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error updating threshold:', error);
            showToastMessage('thresholdUpdateError', true);
        } finally {
            setIsUpdatingThreshold(false);
        }
    };

    // Get the current threshold display name
    const getThresholdDisplayName = () => {
        const option = alertThresholdOptions.find(opt => opt.value === selectedThreshold);
        return option ? getTranslation(option.labelKey as keyof TranslationStrings, currentLanguage) : '';
    };

    // Render the threshold option
    const renderThresholdOption = ({item}: { item: AlertThresholdOption }) => {
        const isSelected = selectedThreshold === item.value;

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={[
                    {
                        paddingVertical: 15,
                        paddingHorizontal: 20,
                    },
                    isSelected && {
                        backgroundColor: '#333',
                        borderRadius: 5,
                    },
                ]}
                onPress={() => handleThresholdChange(item.value)}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={[
                        {
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            marginRight: 15,
                        },
                        {backgroundColor: item.colorHex},
                    ]}/>
                    <Text style={{
                        color: item.colorHex,
                        fontSize: 18,
                    }}>
                        {getTranslation(item.labelKey as keyof TranslationStrings, currentLanguage)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="chevron-left" size={25} color="yellow"/>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    {getTranslation('settings' as keyof TranslationStrings, currentLanguage)}
                </Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{paddingBottom: 20}}
            >
                {/* Location Setting */}
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => {
                        if (!isUpdatingLocation) {
                            openLocationModal();
                        }
                    }}
                    disabled={isUpdatingLocation}
                >
                    <View style={{flex: 1}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8, alignSelf: 'center'}}>
                            <Icon name="map-marker" size={20} color="yellow" style={{width: 25}}/>
                            <Text style={[styles.sectionTitle, {marginTop: 0, marginLeft: 8, marginBottom: 0}]}>
                                {getTranslation('locationForAlerts' as keyof TranslationStrings, currentLanguage)}
                            </Text>
                        </View>
                        <Text style={[styles.settingLabel, {marginLeft: 33}]}>
                            {selectedLocation
                                ? getTranslatedLocationName(selectedLocation.locationName, currentLanguage)
                                : getTranslation('selectLocation' as keyof TranslationStrings, currentLanguage)}
                        </Text>
                    </View>
                    {isUpdatingLocation ? (
                        <ActivityIndicator size="small" color="yellow"/>
                    ) : (
                        <Icon name="chevron-down" size={24} color="yellow"/>
                    )}
                </TouchableOpacity>

                {/* Alert Threshold Setting */}
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => {
                        if (!isUpdatingThreshold) {
                            setShowThresholdModal(true);
                        }
                    }}
                    disabled={isUpdatingThreshold}
                >
                    <View style={{flex: 1}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8, alignSelf: 'center'}}>
                            <Icon name="exclamation-triangle" size={20} color="yellow" style={{width: 25}}/>
                            <Text style={[styles.sectionTitle, {marginTop: 0, marginLeft: 8, marginBottom: 0}]}>
                                {getTranslation('receiveAlertsWhenAqiAbove' as keyof TranslationStrings, currentLanguage)}
                            </Text>
                        </View>
                        <Text style={[styles.settingLabel, {marginLeft: 33}]}>
                            {getThresholdDisplayName()}
                        </Text>
                    </View>
                    {isUpdatingThreshold ? (
                        <ActivityIndicator size="small" color="yellow"/>
                    ) : (
                        <Icon name="chevron-down" size={24} color="yellow"/>
                    )}
                </TouchableOpacity>

                {/* Language Setting */}
                <View style={styles.settingRow}>
                    <View style={{flex: 1}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center', justifyContent: 'center'}}>
                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginRight: 16}}>
                                <Icon name="globe" size={20} color="yellow"/>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    color: 'yellow',
                                    paddingLeft: 4,
                                    textAlign: 'center',
                                    marginTop: 0,
                                    marginBottom: 0,
                                    marginLeft: 12,
                                }}>
                                    {getTranslation('language' as keyof TranslationStrings, currentLanguage)}
                                </Text>
                            </View>
                            {isLoadingLanguage ? (
                                <ActivityIndicator size="small" color="yellow"/>
                            ) : (
                                <LanguageToggle/>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Location Modal */}
            {isModalOpen && (
                <LocationModal
                    selectedLocation={selectedLocation}
                    onLocationSelected={handleLocationChange}
                    visible={isModalOpen}
                    onClose={closeLocationModal}
                />
            )}

            {/* Alert Threshold Modal */}
            <Modal
                visible={showThresholdModal}
                transparent
                animationType="none"
                onRequestClose={() => setShowThresholdModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowThresholdModal(false)}>
                    <View style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}>
                        <Animated.View style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                            opacity: overlayOpacity,
                        }}/>

                        <TouchableWithoutFeedback>
                            <Animated.View style={{
                                backgroundColor: '#000',
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                paddingVertical: 20,
                                width: '100%',
                                transform: [{translateY: slideAnim}],
                            }}>
                                {/* Header */}
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingBottom: 10,
                                    position: 'relative',
                                }}>
                                    <Icon name="exclamation-triangle" size={20} color="#FFD700"/>
                                    <Text style={{
                                        color: '#FFD700',
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        marginLeft: 5,
                                    }}>
                                        {getTranslation('selectAlertThreshold' as keyof TranslationStrings, currentLanguage)}
                                    </Text>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setShowThresholdModal(false)}
                                        style={{
                                            position: 'absolute',
                                            right: 15,
                                            top: 0,
                                        }}
                                    >
                                        <Icon name="close" size={22} color="#FFD700"/>
                                    </TouchableOpacity>
                                </View>

                                <View style={{
                                    width: '100%',
                                    height: 1,
                                    backgroundColor: '#FFD700',
                                    marginVertical: 10,
                                }}/>

                                <FlatList
                                    data={alertThresholdOptions}
                                    renderItem={renderThresholdOption}
                                    keyExtractor={(item) => item.value}
                                />
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Toast Message */}
            {showToast && (
                <View style={[styles.toast, isErrorToast && styles.errorToast]}>
                    <Icon
                        name={isErrorToast ? 'exclamation-circle' : 'check-circle'}
                        size={24}
                        color="white"
                    />
                    <Text style={[
                        styles.toastText,
                        currentLanguage === 'اردو' && {fontSize: 16},
                    ]}>
                        {toastMessage}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default SettingsScreen;
