import {TimeRange} from '../time-range-selector/time-range-selector.types.ts';

export interface ChartProps {
    data: {
        labels: string[];
        values: (number | undefined)[];
    };
    selectedTimePeriod: TimeRange
}
