
import React, { useState } from 'react';
import { Wingman } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { HeartIcon } from './icons/HeartIcon';
import { FavoriteConfirmationModal } from './modals/FavoriteConfirmationModal';

interface SavedWingmanCardProps {
  wingman: Wingman;
  onSelect: (wingman: Wingman) => void;
  onToggleFavorite: (wingmanId: number) => void;
}

export const SavedWingmanCard: React.FC<SavedWingmanCardProps> = ({ wingman, onSelect, onToggleFavorite }) => {
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavoriteModalOpen(true);
  };

  const confirmFavorite = () => {
    onToggleFavorite(wingman.id);
    setIsFavoriteModalOpen(false);
  };

  return (
    <>
      <button onClick={() => onSelect(wingman)} className="w-full flex items-center gap-4 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-left" aria-label={`View profile of ${wingman.name}`}>
        <img src={wingman.profilePhoto} alt={`Profile photo of ${wingman.name}`} className="w-14 h-14 rounded-full object-cover" />
        <div className="flex-grow">
          <p className="font-bold text-white">{wingman.name}</p>
          <p className="text-sm text-gray-400">{wingman.handle}</p>
        </div>
        <button
          onClick={handleFavoriteClick}
          className="p-2 rounded-full text-amber-400 hover:bg-gray-700 transition-colors z-10"
          aria-label={`Remove ${wingman.name} from favorites`}
        >
          <HeartIcon isFilled={true} className="w-6 h-6" />
        </button>
        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
      </button>
      <FavoriteConfirmationModal 
        isOpen={isFavoriteModalOpen}
        onClose={() => setIsFavoriteModalOpen(false)}
        onConfirm={confirmFavorite}
        entityName={wingman.name}
        entityType="Wingman"
        action="remove"
      />
    </>
  );
};
