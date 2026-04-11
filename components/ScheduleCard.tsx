
import React from 'react';
import { Venue } from '../types';

interface ScheduleCardProps {
    venue: Venue;
    day: string;
    onBook: () => void;
    onViewDetails: () => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ venue, day, onBook, onViewDetails }) => {
    const handleBookClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        onBook();
    };

    return (
        <button onClick={onViewDetails} className="relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden group text-left border border-gray-800" aria-label={`View details for ${venue.name} on ${day}`}>
            <img src={venue.coverImage} alt={venue.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 w-full">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">{day}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{venue.name}</h3>
                <button 
                  onClick={handleBookClick}
                  className="mt-4 w-full bg-[#EC4899] text-white font-bold py-2.5 rounded-lg hover:bg-[#d8428a] transition-colors"
                  aria-label={`Book a table at ${venue.name} for ${day}`}
                >
                    Book Table
                </button>
            </div>
        </button>
    );
};
