import type { ReactNode } from 'react';

export enum Region {
  EAST_SEA = '동해',
  WEST_SEA = '서해',
  SOUTH_SEA = '남해',
  JEJU_ISLAND = '제주 연안',
}

export type MetricKey = 'temperature' | 'salinity' | 'chlorophyll' | 'waveHeight' | 'plasticConcentration';

export interface HistoricalDataPoint {
  name: string;
  value: number;
}

export interface MarineData {
  temperature: number;
  salinity: number;
  chlorophyll: number;
  waveHeight: number;
  plasticConcentration: number;
  historicalData: Record<MetricKey, HistoricalDataPoint[]>;
}

export type Theme = 'light' | 'dark';

export interface DashboardCardProps {
  title: string;
  value: string;
  unit: string;
  icon: ReactNode;
  trendData: HistoricalDataPoint[];
  color: string;
  onClick: () => void;
}
