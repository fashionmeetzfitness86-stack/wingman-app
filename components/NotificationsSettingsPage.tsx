
import React from 'react';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { Page } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { CalendarIcon } from './icons/CalendarIcon';
import { BookingsIcon } from './icons/BookingsIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { GiftIcon } from './icons/GiftIcon';
import { UsersIcon } from './icons/UsersIcon';

interface NotificationSettings {
    eventAnnouncements: boolean;
    bookingUpdates: boolean;
    recommendations: boolean;
}

interface NotificationsSettingsPageProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  onNavigate: (page: Page) => void;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mt-8 mb-3">{title}</h2>
);

const SettingRow: React.FC<{
    icon?: React.ReactNode;
    title: string;
    description: string;
    action: 'toggle' | 'navigate';
    checked?: boolean;
    onToggle?: () => void;
}> = ({ icon, title, description, action, checked, onToggle }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors duration-200">
        {icon && <div className="text-amber-400 pt-1">{icon}</div>}
        <div className="flex-grow pr-4">
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        </div>
        <div className="flex-shrink-0 pt-1">
            {action === 'toggle' && checked !== undefined && onToggle && <ToggleSwitch checked={checked} onChange={onToggle} label={title} />}
            {action === 'navigate' && <button><ChevronRightIcon className="w-5 h-5 text-gray-500" /></button>}
        </div>
    </div>
);


export const NotificationsSettingsPage: React.FC<NotificationsSettingsPageProps> = ({ settings, onSettingsChange, onNavigate }) => {
  
  const handleToggle = (key: keyof NotificationSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };
  
  return (
    <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
        <button 
            onClick={() => onNavigate('settings')} 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold"
        >
            <ChevronLeftIcon className="w-5 h-5"/>
            Back to Settings
        </button>

        <h1 className="text-3xl font-bold text-white mb-6">Notifications</h1>

        <div className="space-y-3">
            <SectionHeader title="General" />
            <div className="space-y-3">
                <SettingRow 
                  icon={<CalendarIcon className="w-6 h-6" />}
                  title="New Event Announcements" 
                  description="Be the first to know about new events and experiences." 
                  action="toggle" 
                  checked={settings.eventAnnouncements} 
                  onToggle={() => handleToggle('eventAnnouncements')}
                />
                <SettingRow 
                  icon={<BookingsIcon className="w-6 h-6" />}
                  title="Booking Status Updates" 
                  description="Stay informed about your booking confirmations, changes, and reminders." 
                  action="toggle" 
                  checked={settings.bookingUpdates}
                  onToggle={() => handleToggle('bookingUpdates')}
                />
            </div>

            <SectionHeader title="Personalized" />
            <div className="space-y-3">
                 <SettingRow 
                    icon={<SparkleIcon className="w-6 h-6" />}
                    title="AI Concierge Recommendations" 
                    description="Receive personalized suggestions from our AI concierge." 
                    action="toggle" 
                    checked={settings.recommendations}
                    onToggle={() => handleToggle('recommendations')}
                 />
                 <SettingRow 
                    icon={<GiftIcon className="w-6 h-6" />}
                    title="Promotional Offers" 
                    description="Get exclusive deals and promotions tailored to your preferences." 
                    action="toggle" 
                 />
                 <SettingRow 
                    icon={<UsersIcon className="w-6 h-6" />}
                    title="Community Activity" 
                    description="See updates on community interactions, like comments and reactions." 
                    action="toggle" 
                 />
            </div>
            
        </div>
    </div>
  );
};
