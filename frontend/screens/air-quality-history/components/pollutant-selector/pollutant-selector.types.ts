import { Pollutant } from '../../../air-quality-detailed-report/air-quality-detailed-report.types';

export interface PollutantSelectorProps {
  selectedPollutant: Pollutant;
  onPollutantSelected: (pollutant: Pollutant) => void;
} 