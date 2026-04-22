
import React, { useState } from 'react';
import { Wingman } from '../types';
import { StarIcon } from './icons/StarIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CheckIcon } from './icons/CheckIcon';
import { FavoriteConfirmationModal } from './modals/FavoriteConfirmationModal';

interface WingmanListItemProps {
  wingman: Wingman;
  onViewProfile: (wingman: Wingman) => void;
  onBook: (wingman: Wingman) => void;
  isFavorite: boolean;
  onToggleFavorite: (wingmanId: number) => void;
}

export const WingmanListItem: React.FC<WingmanListItemProps> = ({ wingman, onViewProfile, onBook, isFavorite, onToggleFavorite }) => {
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      setIsFavoriteModalOpen(true);
    } else {
      onToggleFavorite(wingman.id);
    }
  };

  const confirmFavorite = () => {
    onToggleFavorite(wingman.id);
    setIsFavoriteModalOpen(false);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?wingman=${wingman.id}`;
    const shareData = {
        title: `Check out ${wingman.name} on WINGMAN`,
        text: `I found this wingman, ${wingman.name}, on WINGMAN. Check out their profile!`,
        url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4 transition-colors duration-200 hover:bg-gray-800 group relative">
        <div className="relative flex-shrink-0">
          <img className="w-20 h-20 rounded-full object-cover" src={wingman.profilePhoto} alt={`Profile photo of ${wingman.name}`} />
           {wingman.isOnline && (
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900" title="Online"></div>
          )}
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
              <div>
                  <h3 className="text-lg font-bold text-white">{wingman.name}</h3>
                  <p className="text-sm text-gray-400">{wingman.handle}</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 px-2 py-1 rounded-full">
                  <StarIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-semibold text-sm">{wingman.rating.toFixed(1)}</span>
              </div>
          </div>
          <p className="text-gray-300 mt-2 text-sm leading-relaxed line-clamp-2 h-10">{wingman.bio}</p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0 w-32">
          <button
            onClick={() => onBook(wingman)}
            className="w-full text-center bg-amber-400 text-black font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-300 hover:bg-amber-300"
            aria-label={`Book a table with ${wingman.name}`}
          >
            Book Table
          </button>
          <div className="flex gap-2">
            <button
                onClick={() => onViewProfile(wingman)}
                className="flex-grow text-center bg-gray-800 border border-gray-700 text-gray-300 font-bold py-2 px-2 rounded-lg text-sm transition-colors duration-300 hover:bg-gray-700 hover:text-white"
                aria-label={`View profile of ${wingman.name}`}
            >
                Profile
            </button>
             <button
              onClick={handleShareClick}
              className="bg-gray-800 border border-gray-700 text-gray-300 p-2 rounded-lg hover:bg-gray-700 hover:text-white transition-colors relative"
              aria-label={`Share ${wingman.name}`}
            >
              {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ShareIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleFavoriteClick}
              className="bg-gray-800 border border-gray-700 text-gray-300 p-2 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
              aria-label={isFavorite ? `Remove ${wingman.name} from favorites` : `Add ${wingman.name} to favorites`}
            >
              <HeartIcon className={`w-5 h-5 ${isFavorite ? 'text-gray-300 fill-[#FFFFFF]' : ''}`} isFilled={isFavorite} />
            </button>
          </div>
        </div>
      </div>
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
