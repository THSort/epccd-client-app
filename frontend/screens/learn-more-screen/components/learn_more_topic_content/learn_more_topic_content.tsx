import type {ReactElement} from 'react';
import React from 'react';
import {Text, View, Image} from 'react-native';
import {styles} from './learn_more_topic_content.styles.ts';
import {useSelectedLanguage} from '../../../../context/SelectedLanguageContext.tsx';
import {getDefaultLanguage} from '../../../../utils/language.util.ts';
import {getTranslation} from '../../../../utils/translations.ts';
import {LearnMoreTopicContentProps} from './learn_more_topic_content.types.ts';

export function LearnMoreTopicContent(props: LearnMoreTopicContentProps): ReactElement | null {
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = getDefaultLanguage(selectedLanguage);

    const getContent = () => {
        let paragraphs;

        switch (props.selectedTopic) {
            case 'air_pollution':
                // Get the content and split it into paragraphs
                paragraphs = getTranslation('whatIsAirPollutionAndPM2_5_content', currentLanguage).split('\n').filter(para => para.trim().length > 0);

                return (
                    <View style={styles.container}>
                        {paragraphs.map((paragraph, index) => (
                            <Text key={index} style={[styles.content, styles.paragraph]}>
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
            default:
                return null;
        }
    };

    return getContent();
}
