import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { DashboardCardProps } from '../types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-ocean-blue-900/80 backdrop-blur-sm p-2 border border-gray-200 dark:border-ocean-blue-700 rounded-md shadow-lg">
        <p className="label text-sm text-gray-700 dark:text-gray-300">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-ocean-blue-900 p-6 rounded-2xl shadow-lg animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex flex-col w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-ocean-blue-800"></div>
          <div className="h-4 bg-gray-200 dark:bg-ocean-blue-800 rounded w-1/3"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-8 bg-gray-300 dark:bg-ocean-blue-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-ocean-blue-800 rounded w-1/4"></div>
        </div>
      </div>
      <div className="w-28 h-16 bg-gray-200 dark:bg-ocean-blue-800 rounded-md -mr-4 -mt-2"></div>
    </div>
  </div>
);


const DashboardCard: React.FC<DashboardCardProps & { isLoading?: boolean }> = ({ title, value, unit, icon, trendData, color, isLoading, onClick }) => {
  if (isLoading) {
    return <SkeletonCard />;
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-ocean-blue-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-blue-500 dark:focus:ring-offset-ocean-blue-950"
      aria-label={`${title} 상세 정보 보기`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}1A`, color }}>
              {icon}
            </div>
            <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-bold text-gray-800 dark:text-white">{value}</span>
            <span className="ml-2 text-lg text-gray-500 dark:text-gray-400">{unit}</span>
          </div>
        </div>
        <div className="w-28 h-16 -mr-4 -mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </button>
  );
};

export default DashboardCard;