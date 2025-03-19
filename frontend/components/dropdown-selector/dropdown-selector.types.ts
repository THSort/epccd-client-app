import {StyleProp, ViewStyle, TextStyle} from 'react-native';

export interface DropdownSelectorProps {
    label: string;
    text: string;
    iconName?: string;
    onPress: () => void;
    isFullWidth?: boolean;
    showLabel?: boolean;
    
    // New style props
    containerStyle?: StyleProp<ViewStyle>;
    selectorStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconStyle?: StyleProp<TextStyle>;
}
