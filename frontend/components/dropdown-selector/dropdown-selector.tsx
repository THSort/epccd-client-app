import type {ReactElement} from 'react';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './dropdown-selector.styles.ts';
import {DropdownSelectorProps} from './dropdown-selector.types.ts';

export function DropdownSelector({label, text, iconName, onPress, isFullWidth = false, showLabel = false}: DropdownSelectorProps): ReactElement {
    return (
        <View>
            <TouchableOpacity activeOpacity={0.7} style={[styles.selector, isFullWidth && {width: '100%'}]} onPress={onPress}>
                {showLabel && <Text style={styles.label}>{label}</Text>}
                <View style={styles.selectedItem}>
                    {iconName && <Icon name={iconName} size={18} color="#FFD700" style={styles.icon}/>}
                    <Text style={styles.selectedItemText} numberOfLines={1} ellipsizeMode="tail">
                        {text}
                    </Text>
                </View>
                <Icon name="chevron-down" size={12} color="#FFD700"/>
            </TouchableOpacity>
        </View>
    );
}
