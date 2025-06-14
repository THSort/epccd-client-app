import type {ReactElement} from 'react';
import React from 'react';
import {Text, View, Image} from 'react-native';
import {styles} from './learn_more_topic_content.styles.ts';
import {useSelectedLanguage} from '../../../../context/SelectedLanguageContext.tsx';
import {getDefaultLanguage} from '../../../../utils/language.util.ts';
import {getTranslation, TranslationStrings} from '../../../../utils/translations.ts';
import {LearnMoreTopicContentProps} from './learn_more_topic_content.types.ts';
import {hp} from '../../../../utils/responsive.util.ts';
import TextWithStroke from '../../../../components/text-with-stroke/text-with-stroke.tsx';
import { colors } from '../../../../App.styles.ts';

interface HealthEffect {
    icon: any;
    textKey: keyof TranslationStrings;
}

interface AqiLevel {
    range: string;
    quality: string;
    description: string;
    style: any;
}

interface ProtectiveMeasure {
    icon: any;
    textKey: keyof TranslationStrings;
}

export function LearnMoreTopicContent(props: LearnMoreTopicContentProps): ReactElement | null {
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = getDefaultLanguage(selectedLanguage);

    // Define AQI levels data
    const aqiLevels: AqiLevel[] = [
        {
            range: '0–50',
            quality: `${getTranslation('good', currentLanguage)}`,
            description: `${getTranslation('aqi_good_statement', currentLanguage)}`,
            style: styles.aqi_0_50,
        },
        {
            range: '51–100',
            quality: `${getTranslation('satisfactory', currentLanguage)}`,
            description: `${getTranslation('aqi_satisfactory_statement', currentLanguage)}`,
            style: styles.aqi_51_100,
        },
        {
            range: '101–150',
            quality: `${getTranslation('moderate', currentLanguage)}`,
            description: `${getTranslation('aqi_moderate_statement', currentLanguage)}`,
            style: styles.aqi_101_150,
        },
        {
            range: '151–200',
            quality: `${getTranslation('unhealthyForSensitive', currentLanguage)}`,
            description: `${getTranslation('aqi_unhealthy_sensitive_statement', currentLanguage)}`,
            style: styles.aqi_151_200,
        },
        {
            range: '201–300',
            quality: `${getTranslation('unhealthy', currentLanguage)}`,
            description: `${getTranslation('aqi_unhealthy_statement', currentLanguage)}`,
            style: styles.aqi_201_300,
        },
        {
            range: '301–400',
            quality: `${getTranslation('veryUnhealthy', currentLanguage)}`,
            description: `${getTranslation('aqi_very_unhealthy_statement', currentLanguage)}`,
            style: styles.aqi_301_400,
        },
        {
            range: '401–500',
            quality: `${getTranslation('hazardous', currentLanguage)}`,
            description: `${getTranslation('aqi_hazardous_statement', currentLanguage)}`,
            style: styles.aqi_401_500,
        },
    ];

    const getContent = () => {
        let paragraphs;

        switch (props.selectedTopic) {
            case 'air_pollution':
                // Get the content and split it into paragraphs
                paragraphs = getTranslation('whatIsAirPollutionAndPM2_5_content', currentLanguage).split('\n').filter(para => para.trim().length > 0);

                return (
                    <View style={styles.container}>
                        {/* First paragraph */}
                        {paragraphs[0] && (
                            <Text style={[styles.content]}>
                                {paragraphs[0]}
                            </Text>
                        )}

                        {/* PM2.5 graphic image */}
                        <View style={{
                            height: hp(250),
                            marginVertical: hp(15),
                        }}>
                            <Image
                                source={require('../../assets/pm25_graphic.png')}
                                resizeMode="contain"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    margin: 0,
                                }}
                            />
                        </View>

                        {/* Second paragraph */}
                        {paragraphs[1] && (
                            <Text style={[styles.content, styles.paragraph]}>
                                {paragraphs[1]}
                            </Text>
                        )}

                        {/* Any additional paragraphs */}
                        {paragraphs.slice(2).map((paragraph, index) => (
                            <Text key={index + 2} style={[styles.content, styles.paragraph]}>
                                {paragraph}
                            </Text>
                        ))}
                    </View>
                );
            case 'pm25_harmful':
                // Get the content and split it into paragraphs
                paragraphs = getTranslation('whyIsPM25Harmful_content', currentLanguage).split('\n').filter(para => para.trim().length > 0);

                return (
                    <View style={styles.container}>
                        {paragraphs.map((paragraph, index) => (
                            <Text key={index} style={[styles.content, styles.paragraph]}>
                                {paragraph}
                            </Text>
                        ))}

                        <View style={styles.imageContainer}>
                            <Image
                                source={require('../../assets/lahore_breathing.png')}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        </View>
                        <Text style={styles.caption}>
                            {getTranslation('whyIsPM25Harmful_image_caption', currentLanguage)}
                        </Text>
                    </View>
                );
            case 'why_care':
                // Get the content and split it into paragraphs
                paragraphs = getTranslation('whyShouldICare_content', currentLanguage).split('\n').filter(para => para.trim().length > 0);

                // Create health effect table data with translation keys
                const healthEffects: HealthEffect[] = [
                    { icon: require('../../assets/lungs.png'), textKey: 'effect_breathing' },
                    { icon: require('../../assets/heart.png'), textKey: 'effect_heart' },
                    { icon: require('../../assets/brain.png'), textKey: 'effect_brain' },
                    { icon: require('../../assets/baby.png'), textKey: 'effect_baby' },
                    { icon: require('../../assets/hourglass.png'), textKey: 'effect_lifespan' },
                    { icon: require('../../assets/tired.png'), textKey: 'effect_work' },
                ];

                return (
                    <View style={styles.container}>
                        {paragraphs.map((paragraph, index) => (
                            <Text key={index} style={[styles.content, styles.paragraph]}>
                                {paragraph}
                            </Text>
                        ))}

                        {/* Health effects table */}
                        <View style={styles.tableContainer}>
                            {healthEffects.map((effect, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Image source={effect.icon} style={styles.tableIcon} />
                                    <Text style={styles.tableText}>
                                        {getTranslation(effect.textKey, currentLanguage)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            case 'aqi_meaning':
                // Get the content and split it into paragraphs
                paragraphs = getTranslation('whatDoesAQIMean_content', currentLanguage).split('\n').filter(para => para.trim().length > 0);

                return (
                    <View style={styles.container}>
                        {paragraphs.map((paragraph, index) => (
                            <Text key={index} style={[styles.content, styles.paragraph]}>
                                {paragraph}
                            </Text>
                        ))}

                        {/* AQI Cards */}
                        <View style={styles.aqiCardContainer}>
                            {aqiLevels.map((level, index) => (
                                <View key={index} style={styles.aqiCard}>
                                    <View style={styles.aqiCardRow}>
                                        <View style={[styles.aqiLevelBox, level.style]}>
                                            <Text style={styles.aqiLevelText}>{level.range}</Text>
                                        </View>
                                        <View style={[styles.aqiInfoContainer]}>
                                            <Text style={[styles.aqiTitle]}>
                                                {level.quality}
                                            </Text>
                                            <Text style={[styles.aqiDescription]}>
                                                {level.description}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            case 'what_to_do':
                // Define the protective measures with images and translation keys
                const protectiveMeasures: ProtectiveMeasure[] = [
                    { icon: require('../../assets/n95_mask.png'), textKey: 'wearMask' },
                    { icon: require('../../assets/house_graphic.png'), textKey: 'stayIndoors' },
                    { icon: require('../../assets/flame_graphic.png'), textKey: 'avoidBurning' },
                    { icon: require('../../assets/car_graphic.png'), textKey: 'avoidTraffic' },
                ];

                return (
                    <View style={styles.container}>
                        {/* Protective measures table */}
                        <View style={styles.tableContainer}>
                            {protectiveMeasures.map((measure, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Image source={measure.icon} style={styles.tableIcon} />
                                    <Text style={styles.tableText}>
                                        {getTranslation(measure.textKey, currentLanguage)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return getContent();
}
