
import React from 'react';
import { Experience, User, UserRole, UserAccessLevel, Venue, Promoter } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { KeyIcon } from '../icons/KeyIcon';
import { TokenIcon } from '../icons/TokenIcon';
import { LockClosedIcon } from '../icons/LockClosedIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { HeartIcon } from '../icons/HeartIcon';
import { BookmarkIcon } from '../icons/BookmarkIcon';

interface ExperienceDetailModalProps {
  experience: Experience;
  currentUser: User;
  onClose: () => void;
  onBook: (experience: Experience) => void;
  invitationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onRequestAccess?: (experienceId: number) => void;
  venue?: Venue;
  onJoinGuestlist?: (context: { promoter?: Promoter; venue?: Venue; date?: string }) => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const USD_TO_TMKC_RATE = 100;

const getPriceForUser = (experience: Experience, user: User): { price?: number; text: string } => {
    const { pricing } = experience;

    const format = (price: number) => ({ price, text: `$${price.toLocaleString()}` });

    if ((user.role === UserRole.PROMOTER || user.role === UserRole.ADMIN) && typeof pricing.promoter === 'number') {
        return format(pricing.promoter);
    }
    if (user.accessLevel === UserAccessLevel.APPROVED_GIRL && typeof pricing.female === 'number') {
        return pricing.female === 0 ? { price: 0, text: 'Complimentary' } : format(pricing.female);
    }
    if (user.accessLevel === UserAccessLevel.ACCESS_MALE && typeof pricing.male === 'number') {
        return format(pricing.male);
    }
    if (typeof pricing.general === 'number') {
        return pricing.general === 0 ? { price: 0, text: 'Complimentary' } : format(pricing.general);
    }
    
    const fallbackPrice = pricing.general ?? pricing.male ?? pricing.female;
    if (typeof fallbackPrice === 'number') {
        return fallbackPrice === 0 ? { price: 0, text: 'Complimentary' } : format(fallbackPrice);
    }

    return { text: 'Invite Only' };
};


export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({ 
    experience, 
    currentUser, 
    onClose, 
    onBook, 
    invitationStatus = 'none', 
    onRequestAccess, 
    venue, 
    onJoinGuestlist,
    isLiked,
    onToggleLike,
    isBookmarked,
    onToggleBookmark
}) => {
  const priceDetails = getPriceForUser(experience, currentUser);
  const tokenPrice = priceDetails.price !== undefined && priceDetails.price > 0 ? priceDetails.price * USD_TO_TMKC_RATE : undefined;
  
  const handleJoinGuestlist = () => {
      if (onJoinGuestlist && venue) {
          onJoinGuestlist({ venue });
      }
  };

  const renderButton = () => {
      if (experience.access === 'invite-only') {
          if (invitationStatus === 'approved') {
              return (
                <button
                    onClick={() => onBook(experience)}
                    className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg bg-amber-400 text-black hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                    <KeyIcon className="w-5 h-5"/>
                    Book Now
                </button>
              );
          }
          if (invitationStatus === 'pending') {
              return (
                <button disabled className="w-full font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 text-lg bg-gray-700 text-gray-400 cursor-not-allowed">
                    <LockClosedIcon className="w-5 h-5"/>
                    Request Sent
                </button>
              );
          }
          return (
            <button
                onClick={() => onRequestAccess && onRequestAccess(experience.id)}
                disabled={invitationStatus === 'rejected'}
                className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg ${invitationStatus === 'rejected' ? 'bg-red-900 text-red-300 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
            >
                <LockClosedIcon className="w-5 h-5"/>
                {invitationStatus === 'rejected' ? 'Request Rejected' : 'Request Invite'}
            </button>
          );
      }
      
      return (
        <button
            onClick={() => onBook(experience)}
            className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg bg-amber-400 text-black hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label={`Book experience: ${experience.title}`}
        >
            <KeyIcon className="w-5 h-5"/>
            Book Now
        </button>
      );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`experience-title-${experience.id}`}
    >
      <div
        className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          <img src={experience.coverImage} alt={experience.title} className="w-full h-56 object-cover rounded-t-xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent"></div>
          
           {/* Actions: Close, Like, Bookmark */}
           <div className="absolute top-4 right-4 flex gap-2">
                {onToggleLike && (
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleLike();
                        }}
                        className={`p-2 rounded-full transition-all active:scale-95 backdrop-blur-sm ${isLiked ? 'bg-pink-500/80 text-white' : 'bg-black/50 text-white hover:bg-white/20'}`}
                        aria-label={isLiked ? `Unlike ${experience.title}` : `Like ${experience.title}`}
                    >
                        <HeartIcon className="w-5 h-5" isFilled={isLiked} />
                    </button>
                )}
                 {onToggleBookmark && (
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark();
                        }}
                        className={`p-2 rounded-full transition-all active:scale-95 backdrop-blur-sm ${isBookmarked ? 'bg-amber-400/80 text-white' : 'bg-black/50 text-white hover:bg-white/20'}`}
                        aria-label={isBookmarked ? `Remove ${experience.title} from bookmarks` : `Bookmark ${experience.title}`}
                    >
                        <BookmarkIcon className="w-5 h-5" isFilled={isBookmarked} />
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="bg-black/50 p-2 rounded-full text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                    aria-label="Close modal"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
          </div>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          <p className="text-sm font-bold text-amber-400 uppercase tracking-wider">{experience.category}</p>
          <h2 id={`experience-title-${experience.id}`} className="text-3xl font-bold text-white mt-2">{experience.title}</h2>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mt-4 border-y border-gray-800 py-3">
            <div className="flex items-center gap-2">
              <LocationMarkerIcon className="w-5 h-5 text-amber-400" />
              <span>{experience.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <span>{experience.duration}</span>
            </div>
          </div>

          <p className="text-gray-300 mt-4 leading-relaxed">{experience.description}</p>
          
          {experience.category === 'Stays' && (
            <div className="mt-4 border-t border-gray-800 pt-4">
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    {experience.bedrooms && (
                        <div className="bg-gray-900 p-3 rounded-lg">
                            <p className="font-bold text-xl text-white">{experience.bedrooms}</p>
                            <p className="text-sm text-gray-400">Bedrooms</p>
                        </div>
                    )}
                    {experience.bathrooms && (
                        <div className="bg-gray-900 p-3 rounded-lg">
                            <p className="font-bold text-xl text-white">{experience.bathrooms}</p>
                            <p className="text-sm text-gray-400">Bathrooms</p>
                        </div>
                    )}
                </div>
                {experience.amenities && experience.amenities.length > 0 && (
                     <div>
                        <h3 className="text-lg font-bold text-white mb-2">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                            {experience.amenities.map(amenity => (
                                <div key={amenity} className="bg-gray-800 text-gray-300 text-sm font-medium px-3 py-1.5 rounded-full">{amenity}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800 bg-black/30 rounded-b-xl space-y-4">
           <div className="flex items-center justify-between mb-2">
             <p className="text-lg text-gray-300">Price <span className="text-xs">/ {experience.pricing.unit}</span></p>
             <div className="text-right">
                <p className="text-2xl font-bold text-amber-400">{priceDetails.text}</p>
                {tokenPrice && (
                    <div className="flex items-center justify-end gap-1 text-gray-400">
                        <TokenIcon className="w-4 h-4"/>
                        <p>{tokenPrice.toLocaleString()} TMKC</p>
                    </div>
                )}
             </div>
          </div>
          {renderButton()}
          {venue && onJoinGuestlist && (
            <button 
                onClick={handleJoinGuestlist}
                className="w-full bg-gray-800 text-amber-400 font-bold py-3 px-6 rounded-lg transition-colors hover:bg-gray-700 border border-amber-400/30 flex items-center justify-center gap-2"
            >
                <UsersIcon className="w-5 h-5" />
                Join Guestlist at {venue.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
