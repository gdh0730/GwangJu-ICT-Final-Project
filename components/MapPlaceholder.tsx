
import React from 'react';
import { Region } from '../types';
import { REGIONS } from '../constants';

interface MapPlaceholderProps {
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
}

const regionPositions: Record<Region, string> = {
  [Region.EAST_SEA]: 'top-1/4 right-1/4',
  [Region.WEST_SEA]: 'top-1/3 left-10',
  [Region.SOUTH_SEA]: 'bottom-1/4 left-1/3',
  [Region.JEJU_ISLAND]: 'bottom-10 left-1/4',
};

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ selectedRegion, onSelectRegion }) => {
  return (
    <div className="relative w-full h-full bg-ocean-blue-100 dark:bg-ocean-blue-800 rounded-2xl shadow-lg overflow-hidden">
      <svg className="absolute inset-0 w-full h-full text-ocean-blue-300 dark:text-ocean-blue-700" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,50 Q25,25 50,50 T100,50 V100 H0 Z" opacity="0.1" />
        <path d="M0,70 Q15,85 30,70 T60,70 Q75,55 90,70 T100,60 V100 H0 Z" opacity="0.1" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/2 h-4/5 border-2 border-dashed border-ocean-blue-400 dark:border-ocean-blue-600 rounded-3xl transform -rotate-12">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-ocean-blue-400 dark:text-ocean-blue-600 opacity-60">
              대한민국
            </span>
        </div>
      </div>
      {REGIONS.map((region) => (
        <button
          key={region}
          onClick={() => onSelectRegion(region)}
          className={`absolute p-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ocean-blue-100 dark:focus:ring-offset-ocean-blue-800 focus:ring-ocean-blue-500 ${
            regionPositions[region]
          } ${
            selectedRegion === region
              ? 'bg-ocean-blue-500 text-white shadow-lg'
              : 'bg-white/70 dark:bg-ocean-blue-900/70 backdrop-blur-sm text-gray-700 dark:text-gray-200'
          }`}
        >
          <span className="text-sm font-semibold">{region}</span>
        </button>
      ))}
    </div>
  );
};

export default MapPlaceholder;
