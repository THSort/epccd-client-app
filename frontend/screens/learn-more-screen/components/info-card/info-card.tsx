import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {colors} from '../../../../App.styles';
import TextWithStroke from '../../../../components/text-with-stroke/text-with-stroke';
import {fontScale} from '../../../../utils/responsive.util';
import {styles} from './info-card.styles';

interface InfoCardProps {
    icon: string;
    title: string;
    onPress: () => void;
    fullWidth?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({
                                                      icon,
                                                      title,
                                                      onPress,
                                                      fullWidth = false,
                                                  }) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                fullWidth ? styles.fullWidthContainer : {},
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon name={icon} size={30} color={colors.primaryWithDarkBg}/>
                </View>

                <TextWithStroke
                    strokeWidth={0.8}
                    text={title}
                    color={colors.primaryWithDarkBg}
                    size={fontScale(18)}
                    bold={true}
                    style={styles.title}
                />
            </View>
        </TouchableOpacity>
    );
};
