import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Alert,
    Dimensions,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {VersionCheckResponse} from '../../services/version.service';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext.tsx';
import {getTranslation} from '../../utils/translations';
import {getDefaultLanguage} from '../../utils/language.util';

interface UpdateScreenProps {
    versionInfo: VersionCheckResponse;
    onRetryCheck: () => void;
}

const {width} = Dimensions.get('window');

export const UpdateScreen: React.FC<UpdateScreenProps> = ({versionInfo, onRetryCheck}) => {
    const [copyStatus, setCopyStatus] = useState<string>('');
    const { selectedLanguage } = useSelectedLanguage();
    const currentLanguage = getDefaultLanguage(selectedLanguage);

    const handleDownload = async () => {
        if (!versionInfo.downloadUrl) {
            Alert.alert(
                getTranslation('error', currentLanguage),
                getTranslation('downloadUrlNotAvailable', currentLanguage)
            );
            return;
        }

        try {
            const supported = await Linking.canOpenURL(versionInfo.downloadUrl);

            if (supported) {
                await Linking.openURL(versionInfo.downloadUrl);
            } else {
                Alert.alert(
                    getTranslation('unableToOpenLink', currentLanguage),
                    getTranslation('unableToOpenLinkMessage', currentLanguage),
                    [
                        {
                            text: getTranslation('copyDownloadLink', currentLanguage),
                            onPress: handleCopyLink,
                        },
                        { text: getTranslation('ok', currentLanguage) },
                    ]
                );
            }
        } catch (error) {
            console.error('Error opening download URL:', error);
            Alert.alert(
                getTranslation('error', currentLanguage),
                getTranslation('unableToOpenLink', currentLanguage)
            );
        }
    };

    const handleCopyLink = async () => {
        if (!versionInfo.downloadUrl) {
            Alert.alert(
                getTranslation('error', currentLanguage),
                getTranslation('downloadUrlNotAvailable', currentLanguage)
            );
            return;
        }

        try {
            await Clipboard.setString(versionInfo.downloadUrl);
            setCopyStatus(getTranslation('copySuccess', currentLanguage));
            Alert.alert(
                getTranslation('linkCopiedTitle', currentLanguage),
                getTranslation('linkCopiedMessage', currentLanguage),
                [{ text: getTranslation('ok', currentLanguage) }]
            );
            setTimeout(() => {
                setCopyStatus('');
            }, 3000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            Alert.alert(
                getTranslation('error', currentLanguage),
                getTranslation('failedToCopyLink', currentLanguage)
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Update Icon */}
                <View style={styles.iconContainer}>
                    <Text style={styles.updateIcon}>📱</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>
                    {getTranslation('updateRequired', currentLanguage)}
                </Text>

                {/* Version Info */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>
                        {getTranslation('currentVersion', currentLanguage)}: {versionInfo.currentVersion}
                    </Text>
                    <Text style={styles.versionText}>
                        {getTranslation('latestVersion', currentLanguage)}: {versionInfo.latestVersion}
                    </Text>
                </View>

                {/* Update Message */}
                <Text style={styles.message}>
                    {versionInfo.updateMessage || getTranslation('updateMessage', currentLanguage)}
                </Text>

                {/* Download Button */}
                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={handleDownload}
                    activeOpacity={0.8}
                >
                    <Text style={styles.downloadButtonText}>
                        {getTranslation('downloadUpdate', currentLanguage)}
                    </Text>
                </TouchableOpacity>

                {/* Copy Link Button */}
                <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyLink}
                    activeOpacity={0.8}
                >
                    <Text style={styles.copyButtonText}>
                        {getTranslation('copyDownloadLink', currentLanguage)}
                    </Text>
                </TouchableOpacity>

                {/* Copy Status */}
                {copyStatus ? (
                    <Text style={styles.copyStatus}>{copyStatus}</Text>
                ) : null}

                {/* Retry Button */}
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={onRetryCheck}
                    activeOpacity={0.8}
                >
                    <Text style={styles.retryButtonText}>
                        {getTranslation('checkAgain', currentLanguage)}
                    </Text>
                </TouchableOpacity>

                {/* Important Notice */}
                <View style={styles.noticeContainer}>
                    <Text style={styles.noticeText}>
                        {getTranslation('updateNotice', currentLanguage)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark background
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: '#1E1E1E', // Dark card background
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        width: width * 0.9,
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#333', // Subtle border
    },
    iconContainer: {
        marginBottom: 20,
    },
    updateIcon: {
        fontSize: 60,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF', // White text
        marginBottom: 20,
        textAlign: 'center',
    },
    versionContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
        color: '#B0B0B0', // Light gray text
        marginBottom: 5,
    },
    message: {
        fontSize: 16,
        color: '#D0D0D0', // Light gray text
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    downloadButton: {
        backgroundColor: '#007AFF', // Primary blue
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginBottom: 15,
        minWidth: 200,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
    },
    downloadButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    copyButton: {
        backgroundColor: '#34C759', // Green color
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 20,
        marginBottom: 10,
        minWidth: 180,
        shadowColor: '#34C759',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
    },
    copyButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    copyStatus: {
        color: '#34C759', // Green success color
        fontSize: 12,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: '500',
    },
    retryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#555', // Dark border
        marginBottom: 20,
    },
    retryButtonText: {
        color: '#B0B0B0', // Light gray
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    noticeContainer: {
        backgroundColor: '#2A2A2A', // Dark notice background
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9500', // Orange accent
        marginTop: 10,
    },
    noticeText: {
        fontSize: 12,
        color: '#D0D0D0', // Light text
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default UpdateScreen;
