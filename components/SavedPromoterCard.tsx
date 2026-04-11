
import React, { useState } from 'react';
import { Promoter } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { HeartIcon } from './icons/HeartIcon';
import { FavoriteConfirmationModal } from './modals/FavoriteConfirmationModal';

interface SavedPromoterCardProps {
  promoter: Promoter;
  onSelect: (promoter: Promoter) => void;
  onToggleFavorite: (promoterId: number) => void;
}

export const SavedPromoterCard: React.FC<SavedPromoterCardProps> = ({ promoter, onSelect, onToggleFavorite }) => {
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavoriteModalOpen(true);
  };

  const confirmFavorite = () => {
    onToggleFavorite(promoter.id);
    setIsFavoriteModalOpen(false);
  };

  return (
    <>
      <button onClick={() => onSelect(promoter)} className="w-full flex items-center gap-4 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-left" aria-label={`View profile of ${promoter.name}`}>
        <img src={promoter.profilePhoto} alt={`Profile photo of ${promoter.name}`} className="w-14 h-14 rounded-full object-cover" />
        <div className="flex-grow">
          <p className="font-bold text-white">{promoter.name}</p>
          <p className="text-sm text-gray-400">{promoter.handle}</p>
        </div>
        <button
          onClick={handleFavoriteClick}
          className="p-2 rounded-full text-amber-400 hover:bg-gray-700 transition-colors z-10"
          aria-label={`Remove ${promoter.name} from favorites`}
        >
          <HeartIcon isFilled={true} className="w-6 h-6" />
        </button>
        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
      </button>
      <FavoriteConfirmationModal 
        isOpen={isFavoriteModalOpen}
        onClose={() => setIsFavoriteModalOpen(false)}
        onConfirm={confirmFavorite}
        entityName={promoter.name}
        entityType="Promoter"
        action="remove"
      />
    </>
  );
};
