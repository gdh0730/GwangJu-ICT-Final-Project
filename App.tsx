import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Region, MarineData, Theme, MetricKey } from './types';
import { REGIONS } from './constants';
import { generateAnalysisSummary } from './services/geminiService';
import { fetchMarineData } from './services/marineDataService';
import Header from './components/Header';
import DashboardCard from './components/DashboardCard';
import MapPlaceholder from './components/MapPlaceholder';
import AiAnalysisPanel from './components/AiAnalysisPanel';
import DetailModal from './components/DetailModal';

import { TemperatureIcon } from './components/icons/TemperatureIcon';
import { SalinityIcon } from './components/icons/SalinityIcon';
import { ChlorophyllIcon } from './components/icons/ChlorophyllIcon';
import { WaveIcon } from './components/icons/WaveIcon';
import { PlasticIcon } from './components/icons/PlasticIcon';

// FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
const METRICS_CONFIG: Record<MetricKey, { title: string; unit: string; icon: React.ReactNode; color: string }> = {
  temperature: { title: "해수면 온도", unit: "°C", icon: <TemperatureIcon className="w-6 h-6" />, color: "#f97316" },
  salinity: { title: "염분 농도", unit: "PSU", icon: <SalinityIcon className="w-6 h-6" />, color: "#3b82f6" },
  chlorophyll: { title: "클로로필", unit: "mg/m³", icon: <ChlorophyllIcon className="w-6 h-6" />, color: "#16a34a" },
  waveHeight: { title: "파고", unit: "m", icon: <WaveIcon className="w-6 h-6" />, color: "#6366f1" },
  plasticConcentration: { title: "미세플라스틱", unit: "index", icon: <PlasticIcon className="w-6 h-6" />, color: "#ec4899" },
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);
  const [marineData, setMarineData] = useState<MarineData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSelectRegion = useCallback(async (region: Region) => {
    setSelectedRegion(region);
    setAiAnalysis('');
    setIsDataLoading(true);
    setDataError(null);
    setMarineData(null); // Clear previous data
    try {
      const data = await fetchMarineData(region);
      setMarineData(data);
    } catch (error) {
      console.error('Failed to load marine data', error);
      setDataError('실시간 해양 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSelectRegion(REGIONS[0]);
  }, [handleSelectRegion]);

  const handleGenerateAnalysis = useCallback(async () => {
    if (!marineData) return;
    setIsAiLoading(true);
    setAiAnalysis('');
    const summary = await generateAnalysisSummary(selectedRegion, marineData);
    setAiAnalysis(summary);
    setIsAiLoading(false);
  }, [selectedRegion, marineData]);

  const handleCardClick = (metric: MetricKey) => {
    setSelectedMetric(metric);
  };

  const handleCloseModal = () => {
    setSelectedMetric(null);
  };

  const modalData = useMemo(() => {
    if (!selectedMetric || !marineData) return null;
    const config = METRICS_CONFIG[selectedMetric];
    return {
      title: config.title,
      unit: config.unit,
      color: config.color,
      data: marineData.historicalData[selectedMetric],
      currentValue: marineData[selectedMetric],
    };
  }, [selectedMetric, marineData]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-ocean-blue-950 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {dataError && (
              <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200 p-4 rounded-2xl">
                {dataError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(Object.keys(METRICS_CONFIG) as MetricKey[]).map((key) => {
                const config = METRICS_CONFIG[key];
                const value = marineData ? marineData[key] : 0;
                const trendData = marineData?.historicalData[key].slice(-7) || [];
                return (
                  <DashboardCard
                    key={key}
                    title={config.title}
                    value={value.toFixed(key === 'plasticConcentration' ? 2 : 1)}
                    unit={config.unit}
                    icon={config.icon}
                    trendData={trendData}
                    color={config.color}
                    isLoading={isDataLoading}
                    onClick={() => handleCardClick(key)}
                  />
                )
              })}
              <div className="bg-white dark:bg-ocean-blue-900 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
                <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">선택된 해역</h3>
                <p className="text-2xl font-bold text-ocean-blue-600 dark:text-ocean-blue-300 mt-2">{selectedRegion}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">지도에서 다른 해역을 선택하세요.</p>
              </div>
            </div>
            <div className="h-96">
              <MapPlaceholder selectedRegion={selectedRegion} onSelectRegion={handleSelectRegion} />
            </div>
          </div>
          {/* Right Column */}
          <div className="lg:col-span-1 min-h-[600px] lg:min-h-0">
             <AiAnalysisPanel 
                analysis={aiAnalysis}
                isLoading={isAiLoading}
                onGenerate={handleGenerateAnalysis}
                selectedRegion={selectedRegion}
              />
          </div>
        </div>
      </main>
      <DetailModal 
        isOpen={!!selectedMetric}
        onClose={handleCloseModal}
        metricData={modalData}
      />
    </div>
  );
};

export default App;