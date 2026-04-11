
import React, { useState } from 'react';
import { Event } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { RepeatIcon } from './icons/RepeatIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ClockIcon } from './icons/ClockIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { KeyIcon } from './icons/KeyIcon';
import { ConfirmationModal } from './modals/ConfirmationModal';

interface TimelineEventCardProps {
  event: Event;
  isLiked: boolean;
  onToggleLike: (eventId: number | string) => void;
  onViewDetails: (event: Event) => void;
  isBookmarked: boolean;
  onToggleBookmark: (eventId: number | string) => void;
  venueCategory?: string;
  venueMusicType?: string;
  isRsvped: boolean;
  onRsvp: (eventId: number | string) => void;
  venueName?: string;
  venueLocation?: string;
  guestlistStatus?: 'pending' | 'approved' | 'rejected' | 'none';
  invitationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onRequestInvite?: () => void;
  onBook?: (event: Event) => void;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ 
  event, 
  isLiked, 
  onToggleLike, 
  onViewDetails, 
  isBookmarked, 
  onToggleBookmark, 
  venueCategory, 
  venueMusicType, 
  isRsvped, 
  onRsvp, 
  venueName, 
  venueLocation,
  guestlistStatus,
  invitationStatus = 'none',
  onRequestInvite,
  onBook
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const eventDate = new Date(event.date + 'T00:00:00'); // To avoid timezone issues
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?event=${event.id}`;
    const shareData = {
        title: `Check out ${event.title} on WINGMAN`,
        text: event.description,
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

  const handleRsvpClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isRsvped) {
          setIsCancelModalOpen(true);
      } else {
          onRsvp(event.id);
      }
  };

  const handleConfirmCancel = () => {
      onRsvp(event.id);
      setIsCancelModalOpen(false);
  };

  const renderActionButton = () => {
      if (event.type === 'INVITE ONLY') {
          if (invitationStatus === 'approved') {
              return (
                <button
                    onClick={(e) => {
                        if (onBook) {
                            e.stopPropagation();
                            onBook(event);
                        } else {
                            handleRsvpClick(e);
                        }
                    }}
                    className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 w-24 ${
                        isRsvped
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-[#EC4899] text-white'
                    }`}
                >
                    {isRsvped ? (
                        <>
                            <CheckIcon className="w-4 h-4" />
                            <span>Booked</span>
                        </>
                    ) : (
                        'Book Now'
                    )}
                </button>
              );
          } else if (invitationStatus === 'pending') {
              return (
                <button
                    disabled
                    className="font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 w-32 bg-gray-700 text-gray-400 cursor-not-allowed"
                >
                    <ClockIcon className="w-4 h-4" />
                    <span>Request Sent</span>
                </button>
              );
          } else if (invitationStatus === 'rejected') {
               return (
                <button
                    disabled
                    className="font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 w-32 bg-red-900/50 text-red-400 cursor-not-allowed"
                >
                    <span>Declined</span>
                </button>
              );
          } else {
              return (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRequestInvite?.();
                    }}
                    className="font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 w-32 bg-purple-600 text-white hover:bg-purple-500"
                >
                    <LockClosedIcon className="w-4 h-4" />
                    <span>Request Invite</span>
                </button>
              );
          }
      }

      if (onBook) {
          return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onBook(event);
                }}
                className="font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 w-32 bg-[#EC4899] text-white hover:bg-[#d8428a]"
                aria-label={`Book tickets for ${event.title}`}
            >
                <KeyIcon className="w-4 h-4" />
                <span>Book Tickets</span>
            </button>
          );
      }

      return (
        <button
            onClick={handleRsvpClick}
            className={`font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 w-24 ${
                isRsvped
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-[#EC4899] text-white'
            }`}
            aria-label={isRsvped ? `Cancel RSVP for ${event.title}` : `RSVP for ${event.title}`}
        >
            {isRsvped ? (
                <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Going</span>
                </>
            ) : (
                'RSVP'
            )}
        </button>
      );
  };

  return (
    <>
    <div
      onClick={() => onViewDetails(event)}
      onKeyPress={(e) => e.key === 'Enter' && onViewDetails(event)}
      tabIndex={0}
      role="button"
      className="w-full flex gap-4 items-center bg-[#1C1C1E] p-4 rounded-xl border border-transparent hover:border-[#EC4899]/50 transition-colors duration-300 text-left cursor-pointer"
      aria-label={`View details for ${event.title}`}
    >
      <div className="flex flex-col items-center justify-center w-16 h-16 bg-black rounded-lg flex-shrink-0">
        <span className="text-sm font-semibold text-gray-400">{month}</span>
        <span className="text-2xl font-bold text-white">{day}</span>
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
            <p className={`text-xs font-bold uppercase tracking-wider ${event.type === 'EXCLUSIVE' ? 'text-green-400' : 'text-purple-400'}`}>{event.type}</p>
            {event.recurrence && <RepeatIcon className="w-4 h-4 text-gray-400" title="Recurring Event" />}
        </div>
        <div className="flex items-center gap-2 mt-1">
            <h3 className="text-lg font-bold text-white truncate">{event.title}</h3>
            {guestlistStatus === 'approved' && (
                <div className="bg-green-500/20 p-1 rounded-full" title="Guestlist Approved">
                    <CheckIcon className="w-3 h-3 text-green-400" />
                </div>
            )}
            {guestlistStatus === 'pending' && (
                <div className="bg-yellow-500/20 p-1 rounded-full" title="Guestlist Request Pending">
                    <ClockIcon className="w-3 h-3 text-yellow-400" />
                </div>
            )}
        </div>
        {venueName && venueLocation && (
            <p className="text-xs text-gray-500 mt-1">{venueName} &bull; {venueLocation}</p>
        )}
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{event.description}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
            {venueCategory && <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-1 rounded-md">{venueCategory}</span>}
            {venueMusicType && <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-1 rounded-md">{venueMusicType}</span>}
        </div>
      </div>
       <div className="flex flex-col items-center gap-2 self-center flex-shrink-0">
            {renderActionButton()}
            <div className="flex items-center gap-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleLike(event.id); }}
                    className={`p-2 rounded-full transition-all active:scale-95 ${isLiked ? 'text-[#EC4899] bg-[#EC4899]/10' : 'text-gray-400 hover:bg-gray-800'}`}
                    aria-label={isLiked ? `Unlike ${event.title}` : `Like ${event.title}`}
                >
                    <HeartIcon className="w-5 h-5" isFilled={isLiked} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(event.id); }}
                    className={`p-2 rounded-full transition-all active:scale-95 ${isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-gray-400 hover:bg-gray-800'}`}
                    aria-label={isBookmarked ? `Remove ${event.title} from bookmarks` : `Bookmark ${event.title}`}
                >
                    <BookmarkIcon className="w-5 h-5" isFilled={isBookmarked} />
                </button>
                 <button
                    onClick={handleShareClick}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-800 transition-colors active:scale-95"
                    aria-label={`Share ${event.title}`}
                >
                    {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ShareIcon className="w-5 h-5" />}
                </button>
            </div>
       </div>
    </div>
    <ConfirmationModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel RSVP"
        message="Are you sure you want to cancel your RSVP for this event?"
        confirmText="Yes, cancel"
        confirmVariant="danger"
    />
    </>
  );
};
