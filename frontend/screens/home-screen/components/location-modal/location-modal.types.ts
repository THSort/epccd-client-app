import { useState } from 'react';
import { Location } from '../../../../App.types';

export interface LocationModalProps {
    visible: boolean;
    onClose: () => void;
    selectedLocation?: Location;
    onLocationSelected(location: Location): void;
}

export type Area = {
    name: string;
    locations: Location[];
};

export const useLocationModal = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    const openLocationModal = () => {
        setModalOpen(true);
    };

    const closeLocationModal = () => {
        setModalOpen(false);
    };

    return {
        isModalOpen,
        openLocationModal,
        closeLocationModal,
    };
};
