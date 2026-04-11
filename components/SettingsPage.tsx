
import React from 'react';
import { Page, User } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ShieldIcon, EyeIcon, QuestionMarkCircleIcon, FlagIcon } from './icons/FeatureIcons';
import { BellIcon } from './icons/BellIcon';
import { MoonIcon } from './icons/MoonIcon';
import { useTheme } from '../contexts/ThemeContext';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { UserSwitchIcon } from './icons/UserSwitchIcon';

interface SettingsPageProps {
  onNavigate: (page: Page) => void;
  users?: User[];
  onSwitchUser?: (user: User) => void;
}

// Reusable component for links
const SettingsLink: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors duration-200">
        <div className="text-amber-400">{icon}</div>
        <span className="font-semibold text-white flex-grow text-left">{label}</span>
        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
    </button>
);

// Reusable component for rows with toggles
const SettingsToggle: React.FC<{ icon: React.ReactNode, label: string, description: string, isEnabled: boolean, onToggle: () => void }> = ({ icon, label, description, isEnabled, onToggle }) => (
    <div className="w-full flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
        <div className="text-amber-400">{icon}</div>
        <div className="flex-grow">
            <span className="font-semibold text-white">{label}</span>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <ToggleSwitch checked={isEnabled} onChange={onToggle} label={label} />
    </div>
);

// Reusable component for section headers
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mt-8 mb-3">{title}</h2>
);


export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, users, onSwitchUser }) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
      <button 
            onClick={() => onNavigate('userProfile')} 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold"
        >
            <ChevronLeftIcon className="w-5 h-5"/>
            Back to Profile
      </button>

      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <SectionHeader title="General" />
      <div className="space-y-3">
        <SettingsLink icon={<ShieldIcon className="w-6 h-6" />} label="Security" onClick={() => onNavigate('security')} />
        <SettingsLink icon={<EyeIcon className="w-6 h-6" />} label="Privacy" onClick={() => onNavigate('privacy')} />
        <SettingsLink icon={<BellIcon className="w-6 h-6" />} label="Notifications" onClick={() => onNavigate('notificationsSettings')} />
      </div>

      <SectionHeader title="Payments" />
      <div className="space-y-3">
        <SettingsLink icon={<CreditCardIcon className="w-6 h-6" />} label="Manage Payment Methods" onClick={() => onNavigate('paymentMethods')} />
      </div>

      <SectionHeader title="Appearance" />
      <div className="space-y-3">
        <SettingsToggle 
            icon={<MoonIcon className="w-6 h-6" />}
            label="Dark Mode"
            description="Toggle between light and dark themes"
            isEnabled={isDarkMode}
            onToggle={toggleTheme}
        />
      </div>

      <SectionHeader title="Support" />
      <div className="space-y-3">
        <SettingsLink icon={<QuestionMarkCircleIcon className="w-6 h-6" />} label="Help & Support" onClick={() => onNavigate('help')} />
        <SettingsLink icon={<FlagIcon className="w-6 h-6" />} label="Report an Issue" onClick={() => onNavigate('reportIssue')} />
      </div>

      {users && onSwitchUser && (
        <>
            <SectionHeader title="Developer / Debug" />
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <UserSwitchIcon className="w-5 h-5 text-amber-400" />
                    Switch Account
                </h3>
                <div className="space-y-2">
                    {users.map(u => (
                        <button 
                            key={u.id}
                            onClick={() => onSwitchUser(u)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors text-left"
                        >
                            <img src={u.profilePhoto} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                                <p className="text-sm font-bold text-white">{u.name}</p>
                                <p className="text-xs text-gray-400">{u.accessLevel} - {u.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
      )}
    </div>
  );
};
