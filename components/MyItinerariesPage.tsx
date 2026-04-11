
import React, { useState } from 'react';
import { Itinerary, User, Page } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { RouteIcon } from './icons/RouteIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface MyItinerariesPageProps {
  currentUser: User;
  itineraries: Itinerary[];
  onNavigate: (page: Page) => void;
  onViewItinerary: (itineraryId: number) => void;
}

const ItineraryCard: React.FC<{ itinerary: Itinerary, onSelect: () => void }> = ({ itinerary, onSelect }) => (
    <button onClick={onSelect} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-left transition-colors hover:bg-gray-800">
        <h3 className="font-bold text-white text-lg">{itinerary.title}</h3>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{itinerary.description}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(itinerary.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <RouteIcon className="w-4 h-4" />
                <span>{itinerary.items.length} stops</span>
            </div>
        </div>
    </button>
);


export const MyItinerariesPage: React.FC<MyItinerariesPageProps> = ({ currentUser, itineraries, onNavigate, onViewItinerary }) => {
  const [activeTab, setActiveTab] = useState<'mine' | 'shared'>('mine');

  const myItineraries = itineraries.filter(i => i.creatorId === currentUser.id);
  const sharedItineraries = itineraries.filter(i => i.sharedWithUserIds.includes(currentUser.id));

  return (
    <div className="p-4 md:p-8 animate-fade-in text-white">
      <div className="flex border-b border-gray-700 mb-6">
        <button 
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'mine' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
        >
          My Itineraries
        </button>
        <button 
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'shared' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
        >
          Shared With Me
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'mine' && (
          myItineraries.length > 0
            ? myItineraries.map(it => <ItineraryCard key={it.id} itinerary={it} onSelect={() => onViewItinerary(it.id)} />)
            : <p className="text-center text-gray-500 py-8">You haven't created any itineraries yet.</p>
        )}
        {activeTab === 'shared' && (
          sharedItineraries.length > 0
            ? sharedItineraries.map(it => <ItineraryCard key={it.id} itinerary={it} onSelect={() => onViewItinerary(it.id)} />)
            : <p className="text-center text-gray-500 py-8">No itineraries have been shared with you.</p>
        )}
      </div>

       <button 
            onClick={() => onNavigate('itineraryBuilder')}
            className="fixed bottom-24 right-6 w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-black shadow-lg shadow-amber-500/40 z-40 transition-transform hover:scale-110"
            aria-label="Create new itinerary"
        >
            <PlusIcon className="w-8 h-8" />
        </button>
    </div>
  );
};
