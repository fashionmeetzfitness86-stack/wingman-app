
import React, { useState } from 'react';
import { Promoter, User, UserAccessLevel, UserRole } from '../types';
import { StarIcon } from './icons/StarIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ImageCarousel } from './ImageCarousel';
import { FavoriteConfirmationModal } from './modals/FavoriteConfirmationModal';

interface PromoterCardProps {
  promoter: Promoter;
  onViewProfile: (promoter: Promoter) => void;
  onBook: (promoter: Promoter) => void;
  isFavorite: boolean;
  onToggleFavorite: (promoterId: number) => void;
  onJoinGuestlist: (promoter: Promoter) => void;
  currentUser: User;
  showEarnings?: boolean;
}

export const PromoterCard: React.FC<PromoterCardProps> = ({ promoter, onViewProfile, onBook, isFavorite, onToggleFavorite, onJoinGuestlist, currentUser, showEarnings }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
        setIsFavoriteModalOpen(true);
    } else {
        onToggleFavorite(promoter.id);
    }
  };

  const confirmFavorite = () => {
    onToggleFavorite(promoter.id);
    setIsFavoriteModalOpen(false);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?promoter=${promoter.id}`;
    const shareData = {
        title: `Check out ${promoter.name} on WINGMAN`,
        text: `I found this promoter, ${promoter.name}, on WINGMAN. Check out their profile!`,
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
        alert('Sharing is not supported on this browser. Could not copy link.');
      }
    }
  };

  const promoterImages = [promoter.profilePhoto, ...promoter.galleryImages].filter(Boolean);

  return (
    <>
      <div 
          onClick={() => onViewProfile(promoter)} 
          className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#EC4899] hover:shadow-2xl hover:shadow-[#EC4899]/10 group cursor-pointer relative"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && onViewProfile(promoter)}
          aria-label={`View profile for ${promoter.name}`}
      >
        <div className="relative">
          <ImageCarousel images={promoterImages} className="w-full h-64" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Action Buttons (Favorite & Share) */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <div className="relative">
                  <div className={`absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg transition-all duration-300 pointer-events-none whitespace-nowrap ${isCopied ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                      Copied!
                  </div>
                  <button
                    onClick={handleShareClick}
                    className={`p-2 rounded-full text-white transition-all active:scale-95 backdrop-blur-sm ${isCopied ? 'bg-green-500' : 'bg-black/40 hover:bg-white/20'}`}
                    aria-label={`Share ${promoter.name}'s profile`}
                    title="Share Profile"
                  >
                    {isCopied ? <CheckIcon className="w-5 h-5" /> : <ShareIcon className="w-5 h-5" />}
                  </button>
              </div>
              <button
                onClick={handleFavoriteClick}
                className="bg-black/40 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/20 transition-colors active:scale-95"
                aria-label={isFavorite ? `Remove ${promoter.name} from favorites` : `Add ${promoter.name} to favorites`}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <HeartIcon className={`w-5 h-5 transition-transform duration-300 ${isFavorite ? 'scale-110 text-[#EC4899] fill-[#EC4899]' : 'text-white'}`} isFilled={isFavorite} />
              </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none bg-gradient-to-t from-black/90 to-transparent">
            <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white leading-tight">{promoter.name}</h3>
                  <p className="text-sm text-gray-300 font-medium">{promoter.handle}</p>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full backdrop-blur-md border border-white/10">
                    <StarIcon className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span className="text-white font-bold text-sm">{promoter.rating.toFixed(1)}</span>
                </div>
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 h-10">{promoter.bio}</p>
          
          {showEarnings && promoter.earnings !== undefined && (
              <div className="pt-2">
                <p className="text-sm font-bold text-green-400">Total Earnings: ${promoter.earnings.toLocaleString()}</p>
              </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={(e) => { e.stopPropagation(); onBook(promoter); }}
                className="w-full text-center bg-[#EC4899] text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all duration-300 hover:bg-[#d8428a] hover:shadow-lg hover:shadow-[#EC4899]/20"
                aria-label={`Book a table with ${promoter.name}`}
              >
                Book Table
              </button>
              {(currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.role === UserRole.ADMIN) ? (
                  <div className="grid grid-cols-2 gap-2">
                      <button
                          onClick={(e) => { e.stopPropagation(); onViewProfile(promoter); }}
                          className="w-full text-center bg-gray-800 text-gray-300 font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-300 hover:bg-gray-700"
                      >
                          View Profile
                      </button>
                      <button
                          onClick={(e) => { e.stopPropagation(); onJoinGuestlist(promoter); }}
                          className="w-full text-center bg-gray-800 text-amber-400 font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-300 hover:bg-gray-700"
                      >
                          Guestlist
                      </button>
                  </div>
              ) : (
                  <button
                      onClick={(e) => { e.stopPropagation(); onViewProfile(promoter); }}
                      className="w-full text-center bg-gray-800 text-gray-300 font-bold py-2.5 px-4 rounded-lg text-sm transition-colors duration-300 hover:bg-gray-700 hover:text-white"
                  >
                      View Profile
                  </button>
              )}
          </div>
        </div>
      </div>
      <FavoriteConfirmationModal 
        isOpen={isFavoriteModalOpen}
        onClose={() => setIsFavoriteModalOpen(false)}
        onConfirm={confirmFavorite}
        entityName={promoter.name}
        entityType="Promoter"
        action={isFavorite ? 'remove' : 'add'}
      />
    </>
  );
};
