
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
    className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 ${
      onClick
        ? 'cursor-pointer hover:border-orange-500/30 hover:bg-white/[0.06] active:scale-[0.98]'
        : ''
    }`}
    style={{
      background: 'rgba(255,255,255,0.03)',
      borderColor: 'rgba(255,255,255,0.07)',
    }}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {/* Subtle glow */}
    <div className="absolute top-0 left-0 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
      style={{ background: '#f97316' }} />

    <div className="relative flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}>
        <span className="text-orange-400">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>

    {change && (
      <div className={`flex items-center gap-1 text-xs mt-3 font-semibold ${changeType === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
        <ArrowUpIcon className={`w-3 h-3 ${changeType === 'negative' ? 'rotate-180' : ''}`} />
        <span>{change} vs last month</span>
      </div>
    )}
  </div>
);
