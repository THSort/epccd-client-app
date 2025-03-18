export type TimeRange = '1d' | '1w' | '1m' | '3m' | '6m' | '1y';

export interface TimeRangeSelectorProps {
  selectedTimeRange: TimeRange;
  onTimeRangeSelected: (timeRange: TimeRange) => void;
}
