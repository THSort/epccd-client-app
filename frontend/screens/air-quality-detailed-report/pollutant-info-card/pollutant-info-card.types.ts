import {Location} from '../../../App.types.ts';
import {Pollutant} from '../air-quality-detailed-report.types.ts';

export interface PollutantInfoCardProps {
    pollutantName: Pollutant;
    pollutantValue: number;
    pollutantDescription: string;
    selectedLocation?: Location
}
