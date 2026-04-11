
import React from 'react';
import { ArrowUpIcon } from './icons/FeatureIcons';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, change, changeType = 'positive', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-gray-900 p-5 rounded-xl border border-gray-800 ${onClick ? 'cursor-pointer hover:bg-gray-800 transition-colors' : ''}`}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <div className="flex items-center gap-4">
      <div className="bg-gray-800 p-3 rounded-full text-amber-400">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
    {change && (
        <div className={`flex items-center gap-1 text-sm ${changeType === 'positive' ? 'text-green-400' : 'text-red-400'} mt-3`}>
            <ArrowUpIcon className={`w-4 h-4 ${changeType === 'negative' ? 'rotate-180' : ''}`} />
            <span>{change} vs last month</span>
        </div>
    )}
  </div>
);
