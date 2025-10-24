import React, { useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { XIcon } from './icons/XIcon';
import { HistoricalDataPoint } from '../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricData: {
    title: string;
    unit: string;
    color: string;
    data: HistoricalDataPoint[];
    currentValue: number;
  } | null;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-ocean-blue-900/80 backdrop-blur-sm p-3 border border-gray-200 dark:border-ocean-blue-700 rounded-lg shadow-xl">
        <p className="label text-sm font-semibold text-gray-800 dark:text-gray-200">{`${label}`}</p>
        <p className="intro text-lg" style={{ color: payload[0].color }}>{`${payload[0].value.toFixed(2)} ${unit}`}</p>
      </div>
    );
  }
  return null;
};


const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, metricData }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const stats = useMemo(() => {
    if (!metricData || !metricData.data || metricData.data.length === 0) {
      return { avg: 0, min: 0, max: 0 };
    }
    const values = metricData.data.map(d => d.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [metricData]);

  if (!isOpen || !metricData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div
        className="bg-white dark:bg-ocean-blue-900 w-11/12 max-w-4xl h-auto max-h-[90vh] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        style={{ animationFillMode: 'forwards' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="detail-modal-title" className="text-2xl font-bold text-gray-800 dark:text-white">
            {metricData.title} 상세 분석
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-ocean-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-blue-500 transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow h-64 md:h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={metricData.data}
              margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id={`colorGradient-${metricData.title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricData.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={metricData.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
              <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip unit={metricData.unit} />} />
              <Area type="monotone" dataKey="value" stroke={metricData.color} strokeWidth={2.5} fillOpacity={1} fill={`url(#colorGradient-${metricData.title})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-100 dark:bg-ocean-blue-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">현재 값</h4>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {metricData.currentValue.toFixed(2)} <span className="text-base font-normal">{metricData.unit}</span>
                </p>
            </div>
            <div className="bg-gray-100 dark:bg-ocean-blue-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">30일 평균</h4>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {stats.avg.toFixed(2)} <span className="text-base font-normal">{metricData.unit}</span>
                </p>
            </div>
            <div className="bg-gray-100 dark:bg-ocean-blue-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">최고값</h4>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.max.toFixed(2)} <span className="text-base font-normal">{metricData.unit}</span>
                </p>
            </div>
            <div className="bg-gray-100 dark:bg-ocean-blue-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">최저값</h4>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {stats.min.toFixed(2)} <span className="text-base font-normal">{metricData.unit}</span>
                </p>
            </div>
        </div>
        <style>{`
          @keyframes fade-in-scale {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-fade-in-scale {
            animation-name: fade-in-scale;
            animation-duration: 0.3s;
            animation-timing-function: ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DetailModal;
