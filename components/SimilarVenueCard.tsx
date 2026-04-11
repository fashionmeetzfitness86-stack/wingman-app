import React from 'react';
import { Venue } from '../types';

interface SimilarVenueCardProps {
  venue: Venue;
  onSelect: (venue: Venue) => void;
}

export const SimilarVenueCard: React.FC<SimilarVenueCardProps> = ({ venue, onSelect }) => {
  return (
    <button onClick={() => onSelect(venue)} className="flex-shrink-0 w-48 text-left group">
      <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-amber-400 transition-all">
        <img src={venue.coverImage} alt={venue.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      <h4 className="font-bold text-white mt-2 truncate">{venue.name}</h4>
      <p className="text-sm text-gray-400 truncate">{venue.location} &bull; {venue.vibe}</p>
    </button>
  );
};
