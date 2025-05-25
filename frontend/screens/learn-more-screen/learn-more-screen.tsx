import React, {useState} from 'react';
import {View, TouchableOpacity, ScrollView} from 'react-native';
import {styles} from './learn-more-screen.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {useSelectedLanguage} from '../../context/SelectedLanguageContext';
import {getTranslation} from '../../utils/translations';
import {getDefaultLanguage} from '../../utils/language.util';
import AnimatedGradientBackground from '../../components/animated-gradient-background/animated-gradient-background';
import {colors} from '../../App.styles';
import TextWithStroke from '../../components/text-with-stroke/text-with-stroke';
import {fontScale} from '../../utils/responsive.util';
import {useUserActivity} from '../../context/UserActivityContext';
import {InfoCard} from './components/info-card/info-card';
import {LearnMoreTopicContent} from './components/learn_more_topic_content/learn_more_topic_content.tsx';

// Screen identifier for analytics
const currentScreen = 'LearnMoreScreen';

// Topic types for different information cards
export type LearnMoreTopic =
    | 'air_pollution'
    | 'pm25_harmful'
    | 'why_care'
    | 'aqi_meaning'
    | 'what_to_do';

export function LearnMoreScreen(): React.ReactElement {
    const navigation = useNavigation();
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = getDefaultLanguage(selectedLanguage);
    const {trackButton, trackBackButton} = useUserActivity();

    // State to track the selected topic (initially null for main menu)
    const [selectedTopic, setSelectedTopic] = useState<LearnMoreTopic | null>(null);

    // Handler for back button
    const handleBack = () => {
        if (selectedTopic) {
            // If a topic is selected, go back to main menu
            setSelectedTopic(null);
        } else {
            // If on main menu, go back to previous screen
            trackBackButton(currentScreen);
            navigation.goBack();
        }
    };

    // Get screen title based on selected topic
    const getScreenTitle = (): string => {
        if (!selectedTopic) {
            return getTranslation('learnMore', currentLanguage);
        }

        switch (selectedTopic) {
            case 'air_pollution':
                return getTranslation('whatIsAirPollutionAndPM2_5_title', currentLanguage);
            case 'pm25_harmful':
                return getTranslation('whyIsPM25Harmful_title', currentLanguage);
            case 'why_care':
                return getTranslation('whyShouldICare_title', currentLanguage);
            case 'aqi_meaning':
                return getTranslation('whatDoesAQIMean_title', currentLanguage);
            case 'what_to_do':
                return getTranslation('whatCanIDo', currentLanguage);
            default:
                return getTranslation('learnMore', currentLanguage);
        }
    };

    // Header component with back button and title
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
                <Icon name="chevron-left" size={25} color={colors.primaryWithDarkBg}/>
            </TouchableOpacity>

            <TextWithStroke strokeWidth={1.2} style={styles.headerTitle} text={getScreenTitle()} color={colors.primaryWithDarkBg} size={fontScale(25)} bold={true}/>
        </View>
    );

    // Main menu with cards for each topic
    const renderMainMenu = () => (
        <View style={styles.cardsContainer}>
            <View style={styles.row}>
                <InfoCard
                    icon="cloud"
                    title={getTranslation('whatIsAirPollutionAndPM2_5_title', currentLanguage)}
                    onPress={() => {
                        trackButton('select_topic', currentScreen, {
                            topic: 'air_pollution',
                            timestamp: new Date().toISOString(),
                        });
                        setSelectedTopic('air_pollution');
                    }}
                />
                <InfoCard
                    icon="warning"
                    title={getTranslation('whyIsPM25Harmful_title', currentLanguage)}
                    onPress={() => {
                        trackButton('select_topic', currentScreen, {
                            topic: 'pm25_harmful',
                            timestamp: new Date().toISOString(),
                        });
                        setSelectedTopic('pm25_harmful');
                    }}
                />
            </View>

            <View style={styles.row}>
                <InfoCard
                    icon="heart"
                    title={getTranslation('whyShouldICare_title', currentLanguage)}
                    onPress={() => {
                        trackButton('select_topic', currentScreen, {
                            topic: 'why_care',
                            timestamp: new Date().toISOString(),
                        });
                        setSelectedTopic('why_care');
                    }}
                />
                <InfoCard
                    icon="bar-chart"
                    title={getTranslation('whatDoesAQIMean_title', currentLanguage)}
                    onPress={() => {
                        trackButton('select_topic', currentScreen, {
                            topic: 'aqi_meaning',
                            timestamp: new Date().toISOString(),
                        });
                        setSelectedTopic('aqi_meaning');
                    }}
                />
            </View>

            <View style={styles.lastRow}>
                <InfoCard
                    icon="medkit"
                    title={getTranslation('whatCanIDo', currentLanguage)}
                    onPress={() => {
                        trackButton('select_topic', currentScreen, {
                            topic: 'what_to_do',
                            timestamp: new Date().toISOString(),
                        });
                        setSelectedTopic('what_to_do');
                    }}
                    fullWidth
                />
            </View>
        </View>
    );

    const getTopicContent = () => {
        if(!selectedTopic) {
            return null;
        }

        return <LearnMoreTopicContent selectedTopic={selectedTopic}/>;
    };

    return (
        <AnimatedGradientBackground color="#000000">
            <View style={styles.container}>
                {renderHeader()}

                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                >
                    {selectedTopic ? getTopicContent() : renderMainMenu()}
                </ScrollView>
            </View>
        </AnimatedGradientBackground>
    );
}
