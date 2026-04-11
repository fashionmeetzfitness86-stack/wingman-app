
import React, { useState } from 'react';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { Button } from './ui/Button';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { Page } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { StoreIcon } from './icons/StoreIcon';

interface CookieSettingsPageProps {
  onNavigate: (page: Page) => void;
}

const CookieCategory: React.FC<{ icon: React.ReactNode; title: string; description: string; isEnabled: boolean; onToggle?: () => void; isRequired?: boolean; }> = ({ icon, title, description, isEnabled, onToggle, isRequired }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors duration-200">
        <div className="text-amber-400 pt-1">
            {icon}
        </div>
        <div className="flex-grow">
            <h3 className="font-bold text-white">{title} {isRequired && <span className="text-xs text-gray-500 font-normal ml-2">(Always On)</span>}</h3>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <div className="flex-shrink-0 pt-1">
            <ToggleSwitch checked={isEnabled} onChange={onToggle || (() => {})} label={title} />
        </div>
    </div>
);


export const CookieSettingsPage: React.FC<CookieSettingsPageProps> = ({ onNavigate }) => {
    const [performanceCookies, setPerformanceCookies] = useState(true);
    const [marketingCookies, setMarketingCookies] = useState(false);

    const handleSave = () => {
        // In a real app, you would save these preferences to localStorage or a server
        console.log({
            performance: performanceCookies,
            marketing: marketingCookies
        });
        alert("Preferences saved!");
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

            <h1 className="text-3xl font-bold text-white mb-6">Cookie Settings</h1>
            <p className="text-gray-400 mb-8 max-w-3xl">
                We use cookies to enhance your experience. You can manage your preferences for non-essential cookies below.
            </p>

            <div className="space-y-4">
                <CookieCategory
                    icon={<ShieldCheckIcon className="w-6 h-6" />}
                    title="Essential Cookies"
                    description="These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms."
                    isEnabled={true}
                    isRequired={true}
                />
                <CookieCategory
                    icon={<ChartBarIcon className="w-6 h-6" />}
                    title="Performance Cookies"
                    description="These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site."
                    isEnabled={performanceCookies}
                    onToggle={() => setPerformanceCookies(prev => !prev)}
                />
                 <CookieCategory
                    icon={<StoreIcon className="w-6 h-6" />}
                    title="Marketing Cookies"
                    description="These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites."
                    isEnabled={marketingCookies}
                    onToggle={() => setMarketingCookies(prev => !prev)}
                />
            </div>

            <div className="mt-8">
                <Button onClick={handleSave} size="lg" className="w-full bg-[#EC4899] text-white font-bold hover:bg-[#d8428a]">
                    Save Preferences
                </Button>
            </div>
        </div>
    );
};
