import React from 'react';
import { Event } from '../types';
import { SparkleIcon } from './icons/SparkleIcon';

interface SuggestedEventCardProps {
    event: Event;
    onViewDetails: (event: Event) => void;
    venueCategory?: string;
    venueMusicType?: string;
    venueName?: string;
    venueLocation?: string;
}

export const SuggestedEventCard: React.FC<SuggestedEventCardProps> = ({ event, onViewDetails, venueCategory, venueMusicType, venueName, venueLocation }) => {
    const getIconBgColor = (title: string) => {
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return "#" + "00000".substring(0, 6 - c.length) + c;
    }

    return (
        <button 
            onClick={() => onViewDetails(event)}
            className="flex-shrink-0 w-64 bg-[#1C1C1E] rounded-2xl overflow-hidden group text-left border border-gray-800 hover:border-[#EC4899] transition-colors duration-300" 
            aria-label={`View details for suggested event: ${event.title}`}
        >
            <div className="relative h-40 bg-gray-700 flex items-center justify-center">
                 <div className="absolute top-2 left-2 flex items-center gap-2 text-white bg-black/30 px-2 py-1 rounded-full text-xs font-semibold">
                     <span style={{ backgroundColor: getIconBgColor(event.title) }} className="w-3 h-3 rounded-sm block"></span>
                     <span>{event.title}</span>
                 </div>
            </div>
            <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                    <SparkleIcon className="w-4 h-4 text-amber-400" />
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">For You</p>
                </div>
                <h3 className="text-white font-bold truncate">{event.title}</h3>
                {venueName && venueLocation && (
                    <p className="text-xs text-gray-500 mt-1">{venueName} &bull; {venueLocation}</p>
                )}
                <p className="text-gray-400 text-sm line-clamp-2 mt-1">{event.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {venueCategory && <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-1 rounded-md">{venueCategory}</span>}
                    {venueMusicType && <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-1 rounded-md">{venueMusicType}</span>}
                </div>
                <div className="mt-3 w-full bg-[#EC4899] text-white font-bold py-2.5 rounded-lg group-hover:bg-[#d8428a] transition-colors text-center">
                    View Details
                </div>
            </div>
        </button>
    );
};
