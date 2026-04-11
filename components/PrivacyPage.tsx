
import React from 'react';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CookieIcon } from './icons/CookieIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { Page } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

const SettingRow: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    action: 'navigate';
    onClick?: () => void;
    variant?: 'default' | 'danger';
}> = ({ icon, title, description, action, onClick, variant = 'default' }) => {
    return (
        <button 
            onClick={onClick} 
            className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 border ${
                variant === 'danger' 
                ? 'bg-red-900/10 border-red-900/30 hover:bg-red-900/20' 
                : 'bg-gray-900 border-gray-800 hover:bg-gray-800'
            }`}
            disabled={!onClick}
            aria-label={title}
        >
            <div className={`${variant === 'danger' ? 'text-red-500' : 'text-amber-400'}`}>
                {icon}
            </div>
            <div className="flex-grow text-left">
                <h3 className={`font-bold ${variant === 'danger' ? 'text-red-500' : 'text-white'}`}>{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <div className="flex-shrink-0 pt-1 flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            </div>
        </button>
    );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mt-8 mb-3">{title}</h2>
);


interface PrivacyPageProps {
  onNavigate: (page: Page) => void;
  onDeleteAccountRequest: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate, onDeleteAccountRequest }) => {
  return (
    <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
        <button 
            onClick={() => onNavigate('settings')} 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold"
        >
            <ChevronLeftIcon className="w-5 h-5"/>
            Back to Settings
        </button>

        <h1 className="text-3xl font-bold text-white mb-6">Privacy & Data</h1>

        <div>
            <SectionHeader title="Your Data" />
            <div className="space-y-3">
                <SettingRow 
                    icon={<DownloadIcon className="w-6 h-6" />}
                    title="Export Your Data"
                    description="Request a copy of your personal data."
                    action="navigate"
                    onClick={() => onNavigate('dataExport')}
                />
                <SettingRow 
                    icon={<TrashIcon className="w-6 h-6" />}
                    title="Delete Your Account"
                    description="Permanently delete your account and all associated data."
                    action="navigate"
                    variant="danger"
                    onClick={onDeleteAccountRequest}
                />
            </div>
        </div>

        <div>
            <SectionHeader title="Cookies & Usage" />
            <div className="space-y-3">
                 <SettingRow 
                    icon={<CookieIcon className="w-6 h-6" />}
                    title="Manage Cookies"
                    description="Manage your cookie settings to control data collection."
                    action="navigate"
                    onClick={() => onNavigate('cookieSettings')}
                />
                <SettingRow 
                    icon={<ChartBarIcon className="w-6 h-6" />}
                    title="Data Usage Report"
                    description="View a report of your data usage within the app."
                    action="navigate"
                />
            </div>
        </div>
    </div>
  );
};
