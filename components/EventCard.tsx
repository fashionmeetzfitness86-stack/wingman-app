
import React, { useState } from 'react';
import { Event } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { HeartIcon } from './icons/HeartIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ShareIcon } from './icons/ShareIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { RepeatIcon } from './icons/RepeatIcon';
import { ClockIcon } from './icons/ClockIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { KeyIcon } from './icons/KeyIcon';
import { ConfirmationModal } from './modals/ConfirmationModal';

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
  isLiked?: boolean;
  onToggleLike?: (eventId: number | string) => void;
  isRsvped?: boolean;
  onRsvp?: (eventId: number | string) => void;
  venueName?: string;
  venueLocation?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: (eventId: number | string) => void;
  venueCategory?: string;
  venueMusicType?: string;
  guestlistStatus?: 'pending' | 'approved' | 'rejected' | 'none';
  invitationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onRequestInvite?: (eventId: number | string) => void;
  onBook?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onViewDetails, 
  isLiked, 
  onToggleLike, 
  isRsvped, 
  onRsvp, 
  venueName, 
  venueLocation, 
  isBookmarked, 
  onToggleBookmark, 
  venueCategory, 
  venueMusicType,
  guestlistStatus,
  invitationStatus = 'none',
  onRequestInvite,
  onBook
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const attendancePercentage = event.capacity && event.currentAttendees ? Math.round((event.currentAttendees / event.capacity) * 100) : null;

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
      } else if (onRsvp) {
          onRsvp(event.id);
      }
  };

  const handleConfirmCancel = () => {
      if (onRsvp) {
          onRsvp(event.id);
      }
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
                    className={`flex-grow font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                        isRsvped
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-[#EC4899] text-white hover:bg-[#d8428a]'
                    }`}
                >
                    {isRsvped ? (
                        <>
                            <CheckIcon className="w-4 h-4" />
                            Booked
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
                    className="flex-grow font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 bg-gray-700 text-gray-400 cursor-not-allowed"
                >
                    <ClockIcon className="w-4 h-4" />
                    Request Sent
                </button>
              );
          } else if (invitationStatus === 'rejected') {
               return (
                <button
                    disabled
                    className="flex-grow font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 bg-red-900/50 text-red-400 cursor-not-allowed"
                >
                    Declined
                </button>
              );
          } else {
              return (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onRequestInvite) {
                            onRequestInvite(event.id);
                        } else {
                            onViewDetails(event);
                        }
                    }}
                    className="flex-grow font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 bg-purple-600 text-white hover:bg-purple-500"
                >
                    <LockClosedIcon className="w-4 h-4" />
                    Request Invite
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
                className="flex-grow bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 hover:bg-[#d8428a]"
                aria-label={`Book tickets for ${event.title}`}
            >
                <KeyIcon className="w-4 h-4" />
                Book Tickets
            </button>
          );
      }

      return onRsvp ? (
        <button
            onClick={handleRsvpClick}
            className={`flex-grow font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                isRsvped
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-[#EC4899] text-white hover:bg-[#d8428a]'
            }`}
            aria-label={isRsvped ? `Cancel RSVP for ${event.title}` : `RSVP for ${event.title}`}
        >
            {isRsvped ? (
                <>
                    <CheckIcon className="w-4 h-4" />
                    RSVPed
                </>
            ) : (
                'RSVP'
            )}
        </button>
      ) : null;
  };


  return (
    <>
    <div 
      onClick={() => onViewDetails(event)}
      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 flex gap-4 items-center text-left hover:bg-gray-800 transition-colors duration-200 cursor-pointer relative group"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onViewDetails(event)}
      aria-label={`View details for ${event.title}`}
    >
      <img src={event.image} alt={event.title} className="w-24 h-24 sm:w-32 sm:h-32 rounded-md object-cover flex-shrink-0" />
      <div className="flex-grow flex flex-col justify-between self-stretch">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-green-400 uppercase tracking-wider">{event.type}</p>
            {event.recurrence && <RepeatIcon className="w-4 h-4 text-gray-400" title="Recurring Event" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
            {guestlistStatus === 'approved' && (
                <div className="bg-green-500/20 p-1 rounded-full" title="Guestlist Approved">
                    <CheckIcon className="w-4 h-4 text-green-400" />
                </div>
            )}
            {guestlistStatus === 'pending' && (
                <div className="bg-yellow-500/20 p-1 rounded-full" title="Guestlist Request Pending">
                    <ClockIcon className="w-4 h-4 text-yellow-400" />
                </div>
            )}
          </div>
          {venueName && venueLocation && (
            <p className="text-xs text-gray-500 mt-1">{venueName} &bull; {venueLocation}</p>
          )}
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{event.description}</p>
        </div>
        <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                {venueCategory && <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-1 rounded-md">{venueCategory}</span>}
                {venueMusicType && <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-1 rounded-md">{venueMusicType}</span>}
            </div>
          {attendancePercentage !== null && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <UsersIcon className="w-4 h-4" />
                  <span>Capacity</span>
                </div>
                <span className="text-xs font-semibold text-white">{attendancePercentage}% Full</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-[#EC4899] h-1.5 rounded-full" style={{ width: `${attendancePercentage}%` }}></div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
              {renderActionButton()}
              
              {onToggleLike && (
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(event.id);
                      }}
                      className={`flex-shrink-0 p-2.5 rounded-lg transition-all hover:bg-gray-600 active:scale-95 ${isLiked ? 'bg-pink-500/10 text-[#EC4899] border border-[#EC4899]/30' : 'bg-gray-700 text-gray-300 border border-transparent'}`}
                      aria-label={isLiked ? `Unlike ${event.title}` : `Like ${event.title}`}
                  >
                      <HeartIcon className="w-5 h-5" isFilled={isLiked} />
                  </button>
              )}

              {onToggleBookmark && (
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(event.id);
                      }}
                      className={`flex-shrink-0 p-2.5 rounded-lg transition-all hover:bg-gray-600 active:scale-95 ${isBookmarked ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 'bg-gray-700 text-gray-300 border border-transparent'}`}
                      aria-label={isBookmarked ? `Remove ${event.title} from bookmarks` : `Bookmark ${event.title}`}
                  >
                      <BookmarkIcon className="w-5 h-5" isFilled={isBookmarked} />
                  </button>
              )}
              
              <button
                  onClick={handleShareClick}
                  className="flex-shrink-0 bg-gray-700 text-gray-300 p-2.5 rounded-lg transition-colors hover:bg-gray-600 active:scale-95 border border-transparent"
                  aria-label={`Share ${event.title}`}
              >
                  {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ShareIcon className="w-5 h-5" />}
              </button>
          </div>
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
