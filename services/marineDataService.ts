import { Region, MarineData, HistoricalDataPoint, MetricKey } from '../types';

// Base data, kept internal to the service to simulate a remote data source
const BASE_MARINE_DATA: Record<Region, Omit<MarineData, 'historicalData'>> = {
  [Region.EAST_SEA]: { temperature: 15.2, salinity: 34.1, chlorophyll: 0.8, waveHeight: 1.5, plasticConcentration: 0.3 },
  [Region.WEST_SEA]: { temperature: 18.5, salinity: 32.5, chlorophyll: 1.2, waveHeight: 0.8, plasticConcentration: 0.7 },
  [Region.SOUTH_SEA]: { temperature: 20.1, salinity: 33.8, chlorophyll: 1.0, waveHeight: 1.2, plasticConcentration: 0.5 },
  [Region.JEJU_ISLAND]: { temperature: 22.4, salinity: 34.5, chlorophyll: 0.6, waveHeight: 1.8, plasticConcentration: 0.4 },
};

// Generates historical data
const generateHistoricalData = (base: number, variance: number, points: number = 30): HistoricalDataPoint[] => {
    return Array.from({ length: points }, (_, i) => ({
        name: `Day ${i + 1}`,
        value: parseFloat((base + (Math.random() - 0.5) * variance * (1 + Math.sin(i/5))).toFixed(2)),
    }));
};

/**
 * Simulates fetching real-time marine data for a given region from an API.
 * Includes a random delay to mimic network latency.
 * @param region The marine region to fetch data for.
 * @returns A promise that resolves with the latest MarineData.
 */
export const fetchMarineData = (region: Region): Promise<MarineData> => {
  return new Promise(resolve => {
    // Simulate network latency
    setTimeout(() => {
      const baseData = BASE_MARINE_DATA[region];
      
      const historicalData: Record<MetricKey, HistoricalDataPoint[]> = {
        temperature: generateHistoricalData(baseData.temperature, 2),
        salinity: generateHistoricalData(baseData.salinity, 1),
        chlorophyll: generateHistoricalData(baseData.chlorophyll, 0.5),
        waveHeight: generateHistoricalData(baseData.waveHeight, 0.8),
        plasticConcentration: generateHistoricalData(baseData.plasticConcentration, 0.2),
      };

      // The 'current' value is the last point of the historical data
      const randomizedData: MarineData = {
        temperature: historicalData.temperature[historicalData.temperature.length - 1].value,
        salinity: historicalData.salinity[historicalData.salinity.length - 1].value,
        chlorophyll: historicalData.chlorophyll[historicalData.chlorophyll.length - 1].value,
        waveHeight: historicalData.waveHeight[historicalData.waveHeight.length - 1].value,
        plasticConcentration: historicalData.plasticConcentration[historicalData.plasticConcentration.length - 1].value,
        historicalData,
      };
      
      resolve(randomizedData);
    }, 500 + Math.random() * 500); // Latency between 500ms and 1000ms
  });
};
