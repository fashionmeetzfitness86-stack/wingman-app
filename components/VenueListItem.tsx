
import React, { useState } from 'react';
import { Venue } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { FavoriteConfirmationModal } from './modals/FavoriteConfirmationModal';

interface VenueListItemProps {
  venue: Venue;
  onBook: (venue: Venue) => void;
  isFavorite: boolean;
  onToggleFavorite: (venueId: number) => void;
}

export const VenueListItem: React.FC<VenueListItemProps> = ({ venue, onBook, isFavorite, onToggleFavorite }) => {
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      setIsFavoriteModalOpen(true);
    } else {
      onToggleFavorite(venue.id);
    }
  };

  const confirmFavorite = () => {
    onToggleFavorite(venue.id);
    setIsFavoriteModalOpen(false);
  };
  
  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4 transition-colors duration-200 hover:bg-gray-800">
        <img className="w-32 h-20 rounded-md object-cover flex-shrink-0" src={venue.coverImage} alt={venue.name} />
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-white">{venue.name}</h3>
          <p className="text-sm text-gray-400">{venue.location} &bull; {venue.musicType} &bull; {venue.vibe}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
           <button
            onClick={handleFavoriteClick}
            className="p-3 rounded-full text-white hover:bg-gray-700 transition-colors"
            aria-label={isFavorite ? `Remove ${venue.name} from favorites` : `Add ${venue.name} to favorites`}
          >
            <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-[#EC4899] fill-[#EC4899]' : ''}`} isFilled={isFavorite} />
          </button>
          <button
            onClick={() => onBook(venue)}
            className="text-center bg-[#EC4899] text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors duration-300 hover:bg-[#d8428a]"
            aria-label={`Book now at ${venue.name}`}
          >
            Book Now
          </button>
        </div>
      </div>
      <FavoriteConfirmationModal 
        isOpen={isFavoriteModalOpen}
        onClose={() => setIsFavoriteModalOpen(false)}
        onConfirm={confirmFavorite}
        entityName={venue.name}
        entityType="Venue"
        action="remove"
      />
    </>
  );
};
