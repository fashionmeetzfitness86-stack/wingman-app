
import React, { useState } from 'react';
import { Wingman, User, UserAccessLevel, UserRole } from '../types';
import { StarIcon } from './icons/StarIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ImageCarousel } from './ImageCarousel';
import { FavoriteConfirmationModal } from './modals/FavoriteConfirmationModal';

interface WingmanCardProps {
  wingman: Wingman;
  onViewProfile: (wingman: Wingman) => void;
  onBook: (wingman: Wingman) => void;
  isFavorite: boolean;
  onToggleFavorite: (wingmanId: number) => void;
  onJoinGuestlist: (wingman: Wingman) => void;
  currentUser: User;
  showEarnings?: boolean;
}

export const WingmanCard: React.FC<WingmanCardProps> = ({ wingman, onViewProfile, onBook, isFavorite, onToggleFavorite, onJoinGuestlist, currentUser, showEarnings }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

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
        (window as any).showAppToast?.('Sharing is not supported on this browser. Could not copy link.');
      }
    }
  };

  const wingmanImages = [wingman.profilePhoto, ...wingman.galleryImages].filter(Boolean);

  return (
    <>
      <div 
          onClick={() => onViewProfile(wingman)} 
          className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#FFFFFF] hover:shadow-2xl hover:shadow-[#FFFFFF]/10 group cursor-pointer relative"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && onViewProfile(wingman)}
          aria-label={`View profile for ${wingman.name}`}
      >
        <div className="relative">
          <ImageCarousel images={wingmanImages} className="w-full h-64" />
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
                    aria-label={`Share ${wingman.name}'s profile`}
                    title="Share Profile"
                  >
                    {isCopied ? <CheckIcon className="w-5 h-5" /> : <ShareIcon className="w-5 h-5" />}
                  </button>
              </div>
              <button
                onClick={handleFavoriteClick}
                className="bg-black/40 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/20 transition-colors active:scale-95"
                aria-label={isFavorite ? `Remove ${wingman.name} from favorites` : `Add ${wingman.name} to favorites`}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <HeartIcon className={`w-5 h-5 transition-transform duration-300 ${isFavorite ? 'scale-110 text-gray-300 fill-[#FFFFFF]' : 'text-white'}`} isFilled={isFavorite} />
              </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none bg-gradient-to-t from-black/90 to-transparent">
            <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white leading-tight">{wingman.name}</h3>
                  <p className="text-sm text-gray-300 font-medium">{wingman.handle}</p>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full backdrop-blur-md border border-white/10">
                    <StarIcon className="w-3.5 h-3.5 text-gray-300" />
                    <span className="text-white font-bold text-sm">{wingman.rating.toFixed(1)}</span>
                </div>
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 h-10">{wingman.bio}</p>
          
          {showEarnings && wingman.earnings !== undefined && (
              <div className="pt-2">
                <p className="text-sm font-bold text-green-400">Total Earnings: ${wingman.earnings.toLocaleString()}</p>
              </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={(e) => { e.stopPropagation(); onBook(wingman); }}
                className="w-full text-center bg-white text-black hover:bg-gray-200 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all duration-300 hover:bg-[#E5E5E5] hover:shadow-lg hover:shadow-[#FFFFFF]/20"
                aria-label={`Book a table with ${wingman.name}`}
              >
                Book Table
              </button>
              {(currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.role === UserRole.ADMIN) ? (
                  <div className="grid grid-cols-2 gap-2">
                      <button
                          onClick={(e) => { e.stopPropagation(); onViewProfile(wingman); }}
                          className="w-full text-center bg-gray-800 text-gray-300 font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-300 hover:bg-gray-700"
                      >
                          View Profile
                      </button>
                      <button
                          onClick={(e) => { e.stopPropagation(); onJoinGuestlist(wingman); }}
                          className="w-full text-center bg-gray-800 text-amber-400 font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-300 hover:bg-gray-700"
                      >
                          Guestlist
                      </button>
                  </div>
              ) : (
                  <button
                      onClick={(e) => { e.stopPropagation(); onViewProfile(wingman); }}
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
        entityName={wingman.name}
        entityType="Wingman"
        action={isFavorite ? 'remove' : 'add'}
      />
    </>
  );
};
