
import React, { useState } from 'react';
import { Event, Venue, User, UserAccessLevel, UserRole } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { SparkleIcon } from '../icons/SparkleIcon';
import { KeyIcon } from '../icons/KeyIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { BookmarkIcon } from '../icons/BookmarkIcon';
import { BellIcon } from '../icons/BellIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { ChatIcon } from '../icons/ChatIcon';
import { RepeatIcon } from '../icons/RepeatIcon';
import { HeartIcon } from '../icons/HeartIcon';
import { PlayIcon } from '../icons/PlayIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { ConfirmationModal } from './ConfirmationModal';

interface EventDetailModalProps {
  event: Event;
  isRsvped: boolean;
  onRsvp: (eventId: number | string) => void;
  onClose: () => void;
  venues: Venue[];
  onViewVenueExperiences: (venue: Venue) => void;
  invitationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  onRequestInvite: (eventId: number | string) => void;
  currentUser: User;
  isBookmarked: boolean;
  onToggleBookmark: (eventId: number | string) => void;
  onPayForEvent: (event: Event) => void;
  onViewParticipants: () => void;
  onNavigateToChat: (event: Event) => void;
  isSubscribed: boolean;
  onToggleSubscription: (eventId: number | string) => void;
  onBookVenue: (venue: Venue) => void;
  isLiked: boolean;
  onToggleLike: (eventId: number | string) => void;
  onJoinGuestlist: (context: { venue: Venue, date: string }) => void;
  guestlistStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onBook?: (event: Event) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
    event, isRsvped, onRsvp, onClose, venues, onViewVenueExperiences, 
    invitationStatus, onRequestInvite, currentUser, isBookmarked, 
    onToggleBookmark, onPayForEvent, onViewParticipants, onNavigateToChat, 
    isSubscribed, onToggleSubscription, onBookVenue, isLiked, onToggleLike, 
    onJoinGuestlist, guestlistStatus = 'none', onBook
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const eventDate = new Date(event.date + 'T00:00:00');
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const venue = venues.find(v => v.id === event.venueId);
  const isFemaleUser = currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL;
  
  const originalEventId = typeof event.id === 'string' ? parseInt(event.id.split('-')[0], 10) : event.id;

  const handleShareClick = async () => {
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

  const handleRsvpClick = () => {
      if (isRsvped) {
          setIsCancelModalOpen(true);
      } else {
          onRsvp(originalEventId);
      }
  };

  const handleConfirmCancel = () => {
      onRsvp(originalEventId);
      setIsCancelModalOpen(false);
  };

  const renderActionButton = () => {
    if (event.type === 'INVITE ONLY') {
        switch (invitationStatus) {
            case 'none':
                return (
                    <button onClick={() => onRequestInvite(originalEventId)} className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg bg-amber-400 text-black hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400">
                        <KeyIcon className="w-5 h-5"/>
                        Request Invite
                    </button>
                );
            case 'pending':
                return (
                    <button disabled className="w-full font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 text-lg bg-gray-700 text-gray-400 cursor-not-allowed">
                        Request Sent
                    </button>
                );
            case 'approved':
                 return (
                    <button onClick={() => onBook ? onBook(event) : handleRsvpClick()} className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg ${isRsvped ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-green-500 text-white hover:scale-105'}`}>
                        {isRsvped ? (<><CheckIcon className="w-6 h-6" />Booked</>) : (onBook ? 'Book Now' : 'Accept Invite')}
                    </button>
                 );
            case 'rejected':
                return (
                    <button disabled className="w-full font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 text-lg bg-red-800 text-red-300 cursor-not-allowed">
                        Request Rejected
                    </button>
                );
        }
    }

    if (onBook) {
        return (
            <button
                onClick={() => onBook(event)}
                className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg bg-[#EC4899] text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#EC4899]"
                aria-label={`Book tickets for ${event.title}`}
            >
                <KeyIcon className="w-5 h-5" />
                Book Tickets
            </button>
        );
    }

    // Fallback for EXCLUSIVE events
    return (
        <button
          onClick={handleRsvpClick}
          className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg ${
            isRsvped
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-pink-500 text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400'
          }`}
          aria-label={isRsvped ? `Cancel RSVP for ${event.title}` : `RSVP for ${event.title}`}
        >
          {isRsvped ? (
            <>
              <CheckIcon className="w-6 h-6" />
              RSVPed
            </>
          ) : (
            'RSVP Now'
          )}
        </button>
    );
  };

  const renderGuestlistButton = () => {
      if (!venue) return null;
      
      if (guestlistStatus === 'approved') {
          return (
            <div className="w-full bg-green-900/30 border border-green-500/30 text-green-400 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 mt-3">
                <CheckIcon className="w-5 h-5" />
                Guestlist Approved
            </div>
          );
      }
      if (guestlistStatus === 'pending') {
          return (
            <div className="w-full bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 mt-3">
                <ClockIcon className="w-5 h-5" />
                Guestlist Request Pending
            </div>
          );
      }
      
      return (
        <button 
            onClick={() => onJoinGuestlist({ venue, date: event.date })}
            className="w-full bg-gray-800 text-amber-400 font-bold py-3 px-6 rounded-lg transition-colors hover:bg-gray-700 border border-amber-400/30 mt-3 flex items-center justify-center gap-2"
        >
            <UsersIcon className="w-5 h-5" />
            Join Guestlist at {venue.name}
        </button>
      );
  };

  const getPriceText = () => {
    if (isFemaleUser) {
        return event.priceFemale === 0 ? "Complimentary" : `$${event.priceFemale}`;
    }
    const price = event.priceGeneral ?? event.priceMale;
    return `$${price}`;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`event-title-${event.id}`}
    >
      <div
        className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          {showVideo && event.videoUrl ? (
            <video
                src={event.videoUrl}
                controls
                autoPlay
                className="w-full h-56 object-cover rounded-t-xl bg-black"
                onEnded={() => setShowVideo(false)}
            />
          ) : (
            <img src={event.image} alt={event.title} className="w-full h-56 object-cover rounded-t-xl" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent pointer-events-none"></div>
          
          {event.videoUrl && !showVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={() => setShowVideo(true)} className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110" aria-label="Play event video">
                      <PlayIcon className="w-8 h-8" />
                  </button>
              </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold uppercase tracking-wider ${event.type === 'EXCLUSIVE' ? 'text-green-400' : 'text-purple-400'}`}>
                {event.type}
            </p>
            {event.recurrence && (
                <div className="flex items-center gap-1.5 text-gray-400" title={`Recurs ${event.recurrence.frequency} until ${new Date(event.recurrence.endDate).toLocaleDateString()}`}>
                    <RepeatIcon className="w-4 h-4" />
                    <span className="text-xs font-semibold">RECURRING</span>
                </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <h2 id={`event-title-${event.id}`} className="text-3xl font-bold text-white mt-2">{event.title}</h2>
            <button
                onClick={() => onToggleLike(originalEventId)}
                className="p-3 mt-1 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
                aria-label={isLiked ? `Unlike ${event.title}` : `Like ${event.title}`}
            >
                <HeartIcon className="w-6 h-6" isFilled={isLiked} />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400 text-sm mt-4 border-y border-gray-800 py-3">
             <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-[#EC4899] flex-shrink-0" />
              <span className="font-semibold">{formattedDate}</span>
            </div>
             {venue && (
                <div className="flex items-center gap-3">
                    <LocationMarkerIcon className="w-5 h-5 text-[#EC4899] flex-shrink-0" />
                    <span className="font-semibold">{venue.name} &bull; {venue.location}</span>
                </div>
            )}
             <div className="flex-grow" />
             <div className="flex items-center gap-2">
                <button onClick={() => onToggleBookmark(originalEventId)} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}>
                    <BookmarkIcon className="w-6 h-6" isFilled={isBookmarked} />
                </button>
                <button onClick={() => onToggleSubscription(event.id)} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label={isSubscribed ? 'Unsubscribe from notifications' : 'Subscribe to notifications'}>
                    <BellIcon className="w-6 h-6" isFilled={isSubscribed} />
                </button>
                <button onClick={handleShareClick} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Share or invite to event">
                    {isCopied ? <CheckIcon className="w-6 h-6 text-green-500" /> : <ShareIcon className="w-6 h-6" />}
                </button>
                <button onClick={onViewParticipants} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="View participants">
                    <UsersIcon className="w-6 h-6" />
                </button>
                <button onClick={() => onNavigateToChat(event)} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Open event chat">
                    <ChatIcon className="w-6 h-6" />
                </button>
             </div>
          </div>

          <p className="text-gray-300 mt-4 leading-relaxed">{event.description}</p>
        </div>

        <div className="p-6 border-t border-gray-800 bg-black/30 rounded-b-xl space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-300">Price</p>
                <p className="text-2xl font-bold text-[#EC4899]">{getPriceText()}</p>
            </div>
            {renderActionButton()}
            {renderGuestlistButton()}
            {venue && (
              <button
                onClick={() => {
                  onBookVenue(venue);
                  onClose();
                }}
                className="w-full text-center text-sm text-gray-400 hover:text-white hover:underline transition-colors mt-2"
              >
                or Book a Table at {venue.name}
              </button>
            )}
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
    </div>
  );
};
