

import React from 'react';
import { Event, Venue } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { KeyIcon } from './icons/KeyIcon';

interface EventDetailModalProps {
  event: Event;
  isRsvped: boolean;
  // FIX: Changed eventId to accept number or string for recurring event support
  onRsvp: (eventId: number | string) => void;
  onClose: () => void;
  venues: Venue[];
  onViewVenueExperiences: (venue: Venue) => void;
  invitationStatus: 'none' | 'pending' | 'approved';
  // FIX: Changed eventId to accept number or string for recurring event support
  onRequestInvite: (eventId: number | string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isRsvped, onRsvp, onClose, venues, onViewVenueExperiences, invitationStatus, onRequestInvite }) => {
  const eventDate = new Date(event.date + 'T00:00:00');
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const venue = venues.find(v => v.id === event.venueId);

  const renderActionButton = () => {
    if (event.type === 'INVITE ONLY') {
        switch (invitationStatus) {
            case 'none':
                return (
                    <button onClick={() => onRequestInvite(event.id)} className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg bg-pink-500 text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400">
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
                    <button onClick={() => onRsvp(event.id)} className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg ${isRsvped ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-green-500 text-white hover:scale-105'}`}>
                        {isRsvped ? (<><CheckIcon className="w-6 h-6" />Attending</>) : 'Accept Invite'}
                    </button>
                 );
        }
    }

    // Fallback for EXCLUSIVE events
    return (
        <button
          onClick={() => onRsvp(event.id)}
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
          <img src={event.image} alt={event.title} className="w-full h-56 object-cover rounded-t-xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          <p className={`text-sm font-bold uppercase tracking-wider ${event.type === 'EXCLUSIVE' ? 'text-green-400' : 'text-purple-400'}`}>
            {event.type}
          </p>
          <h2 id={`event-title-${event.id}`} className="text-3xl font-bold text-white mt-2">{event.title}</h2>
          
          <div className="flex items-center gap-4 text-gray-400 text-sm mt-4 border-y border-gray-800 py-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-pink-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <p className="text-gray-300 mt-4 leading-relaxed">{event.description}</p>
        </div>

        <div className="p-6 border-t border-gray-800 bg-black/30 rounded-b-xl space-y-3">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="bg-pink-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white">F</span>
                  <span className="text-white font-semibold text-lg">{event.priceFemale === 0 ? 'Free' : `$${event.priceFemale}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white">M</span>
                  <span className="text-white font-semibold text-lg">${event.priceMale}</span>
                </div>
              </div>
          </div>
           {renderActionButton()}
           {venue && (
              <button
                  onClick={() => onViewVenueExperiences(venue)}
                  className="w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm bg-gray-800 text-white hover:bg-gray-700"
                  aria-label={`View experiences at ${venue.name}`}
              >
                  <SparkleIcon className="w-5 h-5 text-pink-400" />
                  View Experiences at {venue.name}
              </button>
          )}
        </div>
      </div>
    </div>
  );
};
