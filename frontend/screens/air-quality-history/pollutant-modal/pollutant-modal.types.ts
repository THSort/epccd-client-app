import {Pollutant} from '../../air-quality-detailed-report/air-quality-detailed-report.types.ts';

export interface PollutantModalProps {
    visible: boolean;
    onClose: () => void;
    selectedPollutant: Pollutant;
    onPollutantSelected: (pollutant: Pollutant) => void;
}
