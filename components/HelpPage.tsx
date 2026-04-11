
import React from 'react';
import { BookingsIcon } from './icons/BookingsIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { QuestionMarkCircleIcon } from './icons/FeatureIcons';
import { UserIcon } from './icons/UserIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { PlayIcon } from './icons/PlayIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { Page } from '../types';

interface HelpPageProps {
  onNavigate: (page: Page) => void;
}

const TopicCard: React.FC<{ icon: React.ReactNode; label: string; }> = ({ icon, label }) => (
    <button 
        onClick={() => alert(`Navigating to ${label} help topic.`)}
        className="flex flex-col items-center justify-center gap-3 bg-gray-900 p-4 rounded-xl w-full aspect-square hover:bg-gray-800 transition-colors border border-gray-800" 
        aria-label={`Go to help topic: ${label}`}
    >
        <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-full text-amber-400">
            {icon}
        </div>
        <p className="font-semibold text-white text-center">{label}</p>
    </button>
);

const VideoCard: React.FC<{ image: string; title: string; }> = ({ image, title }) => (
    <button 
        onClick={() => alert(`Playing tutorial: ${title}`)}
        className="flex-shrink-0 w-64 rounded-xl overflow-hidden relative group text-left border border-gray-800" 
        aria-label={`Watch tutorial: ${title}`}
    >
        <img src={image} alt={title} className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <PlayIcon className="w-6 h-6" />
            </div>
        </div>
        <div className="absolute bottom-0 left-0 p-3 bg-gradient-to-t from-black/80 to-transparent w-full">
            <p className="text-white font-semibold">{title}</p>
        </div>
    </button>
);


export const HelpPage: React.FC<HelpPageProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
        <button 
            onClick={() => onNavigate('settings')} 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold"
        >
            <ChevronLeftIcon className="w-5 h-5"/>
            Back to Settings
        </button>

        <h1 className="text-3xl font-bold text-white mb-6">Help & Support</h1>

        <div className="relative mb-8">
            <input type="search" placeholder="Search for help" className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-2 focus:ring-[#EC4899] focus:border-[#EC4899]" aria-label="Search for help articles" />
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </div>
        </div>

        <div>
            <h2 className="text-xl font-bold text-white mb-4">Popular Topics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <TopicCard icon={<BookingsIcon className="w-6 h-6" />} label="Payment Methods" />
                <TopicCard icon={<CalendarIcon className="w-6 h-6" />} label="Booking Management" />
                <TopicCard icon={<LocationMarkerIcon className="w-6 h-6" />} label="Location Services" />
                <TopicCard icon={<UserIcon className="w-6 h-6" />} label="Account Settings" />
                <TopicCard icon={<BookingsIcon className="w-6 h-6" />} label="Event Tickets" />
                <TopicCard icon={<QuestionMarkCircleIcon className="w-6 h-6" />} label="FAQ" />
            </div>
        </div>

        <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4">Video Tutorials</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 no-scrollbar">
                <VideoCard image="https://picsum.photos/seed/booking-video/400/300" title="Booking a Table" />
                <VideoCard image="https://picsum.photos/seed/nightclub-video/400/300" title="Nightclub Access" />
                <VideoCard image="https://picsum.photos/seed/yacht-video/400/300" title="Yacht Charters" />
            </div>
        </div>
    </div>
  );
};
