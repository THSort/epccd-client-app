import { useState } from 'react';

export interface LocationModalProps {
    visible: boolean;
    onClose: () => void;
}

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
        closeLocationModal
    };
};
