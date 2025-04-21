import type {ReactElement} from 'react';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './dropdown-selector.styles.ts';
import {DropdownSelectorProps} from './dropdown-selector.types.ts';
import {colors} from '../../App.styles.ts';

export function DropdownSelector({
    label,
    text,
    iconName,
    onPress,
    isFullWidth = false,
    showLabel = false,
    containerStyle,
    selectorStyle,
    labelStyle,
    textStyle,
    iconStyle,
}: DropdownSelectorProps): ReactElement {
    return (
        <View style={containerStyle}>
            <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.selector, selectorStyle]}
                onPress={onPress}
            >
                {showLabel && <Text style={[styles.label, labelStyle]}>{label}</Text>}
                <View style={styles.selectedItem}>
                    {iconName && <Icon name={iconName} size={22} color={colors.secondaryWithDarkBg} style={[styles.selectorContextIcon, iconStyle]}/>}
                    <Text style={[styles.selectedItemText, textStyle]} numberOfLines={1} ellipsizeMode="tail">
                        {text}
                    </Text>
                </View>
                <Icon name="chevron-down" size={18} color={colors.secondaryWithDarkBg} style={styles.dropdownArrowIcon}/>
            </TouchableOpacity>
        </View>
    );
}
