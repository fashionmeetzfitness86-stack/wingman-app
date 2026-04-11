
import React, { useState } from 'react';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ChangePasswordModal } from './modals/ChangePasswordModal';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { Page } from '../types';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { KeyIcon } from './icons/KeyIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ActivityLogIcon, ServerIcon } from './icons/FeatureIcons';

interface SecurityPageProps {
  onNavigate: (page: Page) => void;
}

const SettingRow: React.FC<{ label: string, icon?: React.ReactNode, children: React.ReactNode, isButton?: boolean, onClick?: () => void }> = ({ label, icon, children, isButton, onClick }) => {
    const content = (
        <>
            {icon && <div className="text-amber-400">{icon}</div>}
            <span className="font-semibold text-white flex-grow text-left">{label}</span>
            <div>{children}</div>
        </>
    );
    if (isButton) {
        return (
            <button onClick={onClick} className="w-full flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors duration-200" aria-label={label}>
                {content}
            </button>
        )
    }
    return (
        <div className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            {content}
        </div>
    );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mt-8 mb-3">{title}</h2>
);

const ActivityRow: React.FC<{ time: string, location: string }> = ({ time, location }) => (
    <button className="w-full flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors duration-200" aria-label={`View login activity from ${location} at ${time}`}>
        <div className="text-left">
            <p className="font-semibold text-white">{time}</p>
            <p className="text-sm text-gray-400">{location}</p>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
    </button>
);

export const SecurityPage: React.FC<SecurityPageProps> = ({ onNavigate }) => {
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  return (
    <>
        <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
            <button 
                onClick={() => onNavigate('settings')} 
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold"
            >
                <ChevronLeftIcon className="w-5 h-5"/>
                Back to Settings
            </button>

            <h1 className="text-3xl font-bold text-white mb-6">Security</h1>

            <div className="space-y-3">
                <SectionHeader title="Password" />
                <SettingRow label="Change Password" icon={<KeyIcon className="w-6 h-6" />} isButton onClick={() => setIsChangePasswordModalOpen(true)}>
                    <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                </SettingRow>

                <SectionHeader title="Two-Factor Authentication" />
                <SettingRow label="Enable Two-Factor Authentication" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                    <ToggleSwitch checked={is2FAEnabled} onChange={() => setIs2FAEnabled(!is2FAEnabled)} label="Enable Two-Factor Authentication" />
                </SettingRow>

                <SectionHeader title="Login Activity" />
                <div className="space-y-3">
                    <ActivityRow time="Today, 10:30 AM" location="Los Angeles, CA" />
                    <ActivityRow time="Yesterday, 8:15 PM" location="New York, NY" />
                </div>

                <SectionHeader title="Connected Devices" />
                <div className="space-y-3">
                    <ActivityRow time="iPhone 14 Pro" location="Last Active: Today, 10:30 AM" />
                    <ActivityRow time="MacBook Pro" location="Last Active: Yesterday, 8:15 PM" />
                </div>
            </div>
        </div>
        <ChangePasswordModal 
            isOpen={isChangePasswordModalOpen}
            onClose={() => setIsChangePasswordModalOpen(false)}
        />
    </>
  );
};
