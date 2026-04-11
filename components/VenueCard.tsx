
import React, { useMemo, useState } from 'react';
import { Venue, User, Promoter, UserAccessLevel, GuestlistJoinRequest } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { StarIcon } from './icons/StarIcon';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { FavoriteConfirmationModal } from './modals/FavoriteConfirmationModal';

interface VenueCardProps {
  venue: Venue;
  onBook: (venue: Venue) => void;
  isFavorite: boolean;
  onToggleFavorite: (venueId: number) => void;
  onViewDetails: (venue: Venue) => void;
  currentUser: User;
  promoters: Promoter[];
  onJoinGuestlist: (promoter: Promoter, venue: Venue) => void;
  guestlistJoinRequests: GuestlistJoinRequest[];
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const VenueCard: React.FC<VenueCardProps> = ({ 
    venue, 
    onBook, 
    isFavorite, 
    onToggleFavorite, 
    onViewDetails,
    currentUser,
    promoters,
    onJoinGuestlist,
    guestlistJoinRequests
}) => {
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

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBook(venue);
  };
  
  const isApprovedGirl = currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL;
  const assignedPromoters = useMemo(() => promoters.filter(p => p.assignedVenueIds.includes(venue.id)), [promoters, venue.id]);
  const primaryPromoter = assignedPromoters.length > 0 ? assignedPromoters[0] : null;

  const request = useMemo(() => {
    if (!primaryPromoter) return null;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Find the next open day for the venue within a week
    const todayIndex = today.getDay();
    let nextOpenDate: Date | null = null;

    for (let i = 0; i < 7; i++) {
        const dayToCheck = WEEKDAYS[(todayIndex + i) % 7];
        if (venue.operatingDays.includes(dayToCheck)) {
            nextOpenDate = new Date(today);
            nextOpenDate.setDate(today.getDate() + i);
            break;
        }
    }
    
    if (!nextOpenDate) return null; // Venue isn't open in the next 7 days.

    const dateString = nextOpenDate.toISOString().split('T')[0];

    return guestlistJoinRequests.find(req => 
        req.userId === currentUser.id && 
        req.promoterId === primaryPromoter.id && 
        req.venueId === venue.id &&
        req.date === dateString
    );
  }, [primaryPromoter, guestlistJoinRequests, currentUser.id, venue.id, venue.operatingDays]);

  const guestlistStatus = request?.status;

  const handleJoinGuestlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (primaryPromoter) {
        onJoinGuestlist(primaryPromoter, venue);
    } else {
        alert("No promoters available for this venue's guestlist at the moment.");
    }
  };
  
  return (
    <>
    <div 
        onClick={() => onViewDetails(venue)}
        className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#EC4899] hover:shadow-2xl hover:shadow-[#EC4899]/10 group cursor-pointer"
    >
      <div className="relative">
        {venue.coverImage ? (
            <img className="w-full h-48 object-cover" src={venue.coverImage} alt={venue.name} />
        ) : (
            <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-xs font-semibold">No Image</p>
                </div>
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 bg-black/50 p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label={isFavorite ? `Remove ${venue.name} from favorites` : `Add ${venue.name} to favorites`}
        >
          <HeartIcon className="w-5 h-5" isFilled={isFavorite} />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
           <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">{venue.name}</h3>
                    <p className="text-sm text-gray-300">{venue.location}</p>
                </div>
           </div>
        </div>
      </div>
      <div className="p-4 flex flex-col">
        <div className="flex items-center gap-4 text-sm text-gray-400">
            {venue.averageRating && (
                <div className="flex items-center gap-1.5" title={`${venue.averageRating} rating from ${venue.totalReviews} reviews`}>
                    <StarIcon className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-white">{venue.averageRating.toFixed(1)}</span>
                </div>
            )}
            <div className="flex items-center gap-1.5" title="Music Type">
                <MusicNoteIcon className="w-4 h-4" />
                <span>{venue.musicType}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Vibe">
                <SparkleIcon className="w-4 h-4" />
                <span>{venue.vibe}</span>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-2">
            <button
                onClick={handleBookClick}
                className="w-full text-center bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 group-hover:bg-[#d8428a]"
                aria-label={`Book now at ${venue.name}`}
            >
                Book Now
            </button>
            {isApprovedGirl && primaryPromoter && (
                <div className="text-center">
                    <button
                        onClick={handleJoinGuestlistClick}
                        disabled={!!guestlistStatus}
                        className="text-xs text-amber-400 font-semibold hover:text-amber-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {guestlistStatus === 'approved' ? 'Guestlist Approved' : guestlistStatus === 'pending' ? 'Request Sent' : 'or Join Guestlist'}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
    <FavoriteConfirmationModal 
        isOpen={isFavoriteModalOpen}
        onClose={() => setIsFavoriteModalOpen(false)}
        onConfirm={confirmFavorite}
        entityName={venue.name}
        entityType="Venue"
        action={isFavorite ? 'remove' : 'add'}
    />
    </>
  );
};
