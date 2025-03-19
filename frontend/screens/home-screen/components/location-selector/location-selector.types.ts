import {Location} from '../../../../App.types.ts';
import {StyleProp, ViewStyle, TextStyle} from 'react-native';

export interface LocationSelectorProps {
    onOpenLocationModal: () => void;
    selectedLocation?: Location;
    showLocationLabel?: boolean;
    isFullWidth?: boolean;
    
    // New style props
    containerStyle?: StyleProp<ViewStyle>;
    selectorStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconStyle?: StyleProp<TextStyle>;
}
