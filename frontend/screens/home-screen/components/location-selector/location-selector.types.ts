import {Location} from '../../../../App.types.ts';

export interface LocationSelectorProps {
    onOpenLocationModal: () => void;
    selectedLocation?: Location;
    showLocationLabel?: boolean;
    isFullWidth?: boolean;
}
