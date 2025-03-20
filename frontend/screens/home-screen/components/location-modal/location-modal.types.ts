import {useState} from 'react';
import {Location} from '../../../../App.types';

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

export const Areas = [{
    name: 'Lahore',
    locations: [
        {
            locationCode: '1',
            locationCity: 'Lahore',
            locationName: 'Sagian Road, Lahore',
            latitude: 31.623366,
            longitude: 74.389432,
        },
        {
            locationCode: '2',
            locationCity: 'Lahore',
            locationName: 'Mahmood Booti, Lahore',
            latitude: 31.613553,
            longitude: 74.394554,
        },
        {
            locationCode: '3',
            locationCity: 'Lahore',
            locationName: 'WWF Ferozpur Road, Lahore',
            latitude: 31.491538,
            longitude: 74.335076,
        },
        {
            locationCode: '4',
            locationCity: 'Lahore',
            locationName: 'Egerton Road, Lahore',
            latitude: 31.560210,
            longitude: 74.331020,
        },
        {
            locationCode: '5',
            locationCity: 'Lahore',
            locationName: 'Hill Park, Lahore',
            latitude: 31.609038,
            longitude: 74.390145,
        },
    ],
}];
