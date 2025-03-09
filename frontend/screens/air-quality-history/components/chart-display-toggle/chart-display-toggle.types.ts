export type ChartDisplayMode = 'concentration' | 'aqi';

export interface ChartDisplayToggleProps {
  selectedMode: ChartDisplayMode;
  onModeSelected: (mode: ChartDisplayMode) => void;
} 