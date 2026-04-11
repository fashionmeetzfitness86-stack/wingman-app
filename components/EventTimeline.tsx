
import React, { useState, useEffect, useMemo } from 'react';
import { venues, users } from '../data/mockData';
import { AskGabyBanner } from './AskGabyBanner';
import { DiscoverCard } from './DiscoverCard';
import { SuggestedEventCard } from './SuggestedEventCard';
import { TimelineEventCard } from './TimelineEventCard';
import { Event, User, UserAccessLevel, EventInvitationRequest, Venue, UserRole, Promoter, GuestlistJoinRequest } from '../types';
import { EventDetailModal } from './modals/EventDetailModal';
import { MiamiMapModal } from './MiamiMapModal';
import { EventParticipantsModal } from './modals/EventParticipantsModal';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { EventCard } from './EventCard';
import { SavedVenueCard } from './SavedVenueCard';

interface EventTimelineProps {
  currentUser: User;
  allEvents: Event[];
  likedEventIds: number[];
  onToggleLike: (eventId: number | string) => void;
  rsvpedEventIds: number[];
  onRsvp: (eventId: number | string) => void;
  bookmarkedEventIds: number[];
  onToggleBookmark: (eventId: number | string) => void;
  onOpenGabyWithPrompt: (prompt: string) => void;
  invitationRequests: EventInvitationRequest[];
  onRequestInvite: (eventId: number | string) => void;
  onPayForEvent: (event: Event) => void;
  onNavigateToChat: (event: Event) => void;
  subscribedEventIds: number[];
  onToggleSubscription: (eventId: number | string) => void;
  onBookVenue: (venue: Venue) => void;
  onJoinGuestlist: (context: { promoter?: Promoter; venue?: Venue, date?: string }) => void;
  guestlistRequests: GuestlistJoinRequest[];
  onBookEvent: (event: Event) => void;
}

const EVENTS_PER_PAGE = 4;

const getOriginalEventId = (eventId: number | string) => {
    return typeof eventId === 'string' ? parseInt(eventId.split('-')[0], 10) : eventId;
};

export const EventTimeline: React.FC<EventTimelineProps> = ({ 
    currentUser, 
    allEvents,
    likedEventIds, 
    onToggleLike,
    rsvpedEventIds,
    onRsvp,
    bookmarkedEventIds,
    onToggleBookmark,
    onOpenGabyWithPrompt,
    invitationRequests,
    onRequestInvite,
    onPayForEvent,
    onNavigateToChat,
    subscribedEventIds,
    onToggleSubscription,
    onBookVenue,
    onJoinGuestlist,
    guestlistRequests,
    onBookEvent
}) => {
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedEventForModal, setSelectedEventForModal] = useState<Event | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [participantsForEvent, setParticipantsForEvent] = useState<User[]>([]);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'EXCLUSIVE' | 'INVITE ONLY'>('EXCLUSIVE');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'calendar' | 'favorites' | 'likes'>('upcoming');
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date('2025-03-01'));
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  
  const visibleSuggestedEvents = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return allEvents.filter(event => {
        const isSuggested = Number(event.id) >= 100 && Number(event.id) < 200;
        if (!isSuggested) return false;

        const typeMatch = typeFilter === 'all' || event.type === typeFilter;
        return typeMatch;
    });
  }, [allEvents, searchTerm, typeFilter]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return allEvents
        .filter(event => {
            const eventDate = new Date(event.date + 'T00:00:00');
            if (eventDate < today) return false;
            
            if (event.accessLevels && event.accessLevels.length > 0) {
                if (!event.accessLevels.includes(currentUser.accessLevel)) {
                    return false;
                }
            }
            if (event.type === 'INVITE ONLY') {
                return currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.accessLevel === UserAccessLevel.ACCESS_MALE;
            }
            return true;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEvents, currentUser.accessLevel]);

  const favoriteVenues = venues.filter(v => currentUser.favoriteVenueIds?.includes(v.id));
  const likedEvents = allEvents.filter(e => likedEventIds.includes(getOriginalEventId(e.id)));

  // Calendar Logic
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
      setSelectedDate(null);
      setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() - 1);
          return newDate;
      });
  };

  const handleNextMonth = () => {
      setSelectedDate(null);
      setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() + 1);
          return newDate;
      });
  };
  
  const handleDayClick = (day: number) => {
      setSelectedDate(day);
  };

  const getGuestlistStatus = (event: Event) => {
      if (!guestlistRequests) return 'none';
      const request = guestlistRequests.find(req => 
          req.userId === currentUser.id && 
          req.venueId === event.venueId && 
          req.date === event.date
      );
      return request ? request.status : 'none';
  };
  
  const getInvitationStatus = (event: Event) => {
      const request = invitationRequests.find(req => req.userId === currentUser.id && req.eventId === getOriginalEventId(event.id));
      return request ? request.status : 'none';
  };

  const handleOpenEventModal = (event: Event) => {
      const originalId = getOriginalEventId(event.id);
      const rsvpedUserIds = [101, 102]; // Mock data
      if (rsvpedEventIds.includes(originalId)) {
          rsvpedUserIds.push(currentUser.id);
      }
      const eventParticipants = users.filter(u => rsvpedUserIds.includes(u.id));
      setParticipantsForEvent(eventParticipants);
      setSelectedEventForModal(event);
  };

  const handleCloseEventModal = () => {
      setSelectedEventForModal(null);
  };

  const renderUpcoming = () => (
    <div className="space-y-4">
        {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => {
                const venue = venues.find(v => v.id === event.venueId);
                return (
                    <TimelineEventCard
                        key={event.id}
                        event={event}
                        isLiked={likedEventIds.includes(getOriginalEventId(event.id))}
                        onToggleLike={() => onToggleLike(getOriginalEventId(event.id))}
                        onViewDetails={handleOpenEventModal}
                        isBookmarked={bookmarkedEventIds.includes(getOriginalEventId(event.id))}
                        onToggleBookmark={() => onToggleBookmark(getOriginalEventId(event.id))}
                        venueCategory={venue?.category}
                        venueMusicType={venue?.musicType}
                        isRsvped={rsvpedEventIds.includes(getOriginalEventId(event.id))}
                        onRsvp={() => onRsvp(getOriginalEventId(event.id))}
                        venueName={venue?.name}
                        venueLocation={venue?.location}
                        guestlistStatus={getGuestlistStatus(event)}
                        invitationStatus={getInvitationStatus(event)}
                        onRequestInvite={() => onRequestInvite(getOriginalEventId(event.id))}
                        onBook={onBookEvent}
                    />
                );
            })
        ) : (
            <div className="text-center py-16 text-gray-500">
                <p>No upcoming events found.</p>
            </div>
        )}
    </div>
  );

  const renderCalendar = () => {
      const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
      const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      
      // Helper to find events on a specific day
      const getEventsForDay = (day: number) => {
          const dateStr = new Date(year, currentDate.getMonth(), day).toISOString().split('T')[0];
          return upcomingEvents.filter(e => e.date === dateStr);
      };

      const calendarDays = [];
      for (let i = 0; i < firstDayOfMonth; i++) {
          calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
      }
      for (let i = 1; i <= daysInMonth; i++) {
          const eventsOnDay = getEventsForDay(i);
          const hasExclusive = eventsOnDay.some(e => e.type === 'EXCLUSIVE');
          const hasInviteOnly = eventsOnDay.some(e => e.type === 'INVITE ONLY');
          const isSelected = selectedDate === i;
          
          const dayClasses = `relative flex flex-col items-center justify-center h-10 w-10 rounded-full transition-colors duration-200 ${
              isSelected ? 'bg-white text-blue-600 font-bold' : 'text-white font-semibold hover:bg-gray-800'
          }`;

          calendarDays.push(
              <button key={i} onClick={() => handleDayClick(i)} className={dayClasses}>
                  <span>{i}</span>
                  <div className="absolute bottom-1.5 flex items-center justify-center gap-0.5">
                      {hasExclusive && <div className="w-1.5 h-1.5 bg-green-400 rounded-full" title="Exclusive Event"></div>}
                      {hasInviteOnly && <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" title="Invite Only Event"></div>}
                  </div>
              </button>
          );
      }

      const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

      return (
          <>
            <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">{monthName} {year}</h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-gray-400 text-sm mb-4">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 place-items-center">
                {calendarDays}
            </div>

            {selectedDate && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Events for {monthName} {selectedDate}</h3>
                    {selectedEvents.length > 0 ? (
                        <div className="space-y-4">
                            {selectedEvents.map(event => {
                                const venue = venues.find(v => v.id === event.venueId);
                                return (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onViewDetails={handleOpenEventModal}
                                        isLiked={likedEventIds.includes(getOriginalEventId(event.id))}
                                        onToggleLike={() => onToggleLike(getOriginalEventId(event.id))}
                                        isRsvped={rsvpedEventIds.includes(getOriginalEventId(event.id))}
                                        onRsvp={() => onRsvp(getOriginalEventId(event.id))}
                                        venueName={venue?.name}
                                        venueLocation={venue?.location}
                                        isBookmarked={bookmarkedEventIds.includes(getOriginalEventId(event.id))}
                                        onToggleBookmark={() => onToggleBookmark(getOriginalEventId(event.id))}
                                        venueCategory={venue?.category}
                                        venueMusicType={venue?.musicType}
                                        guestlistStatus={getGuestlistStatus(event)}
                                        invitationStatus={getInvitationStatus(event)}
                                        onRequestInvite={() => onRequestInvite(getOriginalEventId(event.id))}
                                        onBook={onBookEvent}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">No events scheduled for this day.</p>
                    )}
                </div>
            )}
          </>
      );
  };

  return (
    <>
      <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
        <div className="mb-8">
            <AskGabyBanner onAsk={() => onOpenGabyWithPrompt("What events are happening this weekend?")} />
        </div>

        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 text-lg font-semibold transition-colors flex-shrink-0 ${activeTab === 'upcoming' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            >
                Upcoming
            </button>
            <button 
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 text-lg font-semibold transition-colors flex-shrink-0 ${activeTab === 'calendar' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            >
                Calendar
            </button>
            <button 
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 text-lg font-semibold transition-colors flex-shrink-0 ${activeTab === 'favorites' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            >
                Favorites
            </button>
            <button 
                onClick={() => setActiveTab('likes')}
                className={`px-4 py-2 text-lg font-semibold transition-colors flex-shrink-0 ${activeTab === 'likes' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            >
                Likes
            </button>
        </div>

        {activeTab === 'upcoming' && renderUpcoming()}
        {activeTab === 'calendar' && renderCalendar()}
        
        {activeTab === 'favorites' && (
            <div className="space-y-3">
                {favoriteVenues.length > 0 ? (
                    favoriteVenues.map(venue => (
                        <SavedVenueCard 
                            key={venue.id} 
                            venue={venue} 
                            onToggleFavorite={() => {}} 
                            onViewDetails={() => onBookVenue(venue)} 
                        />
                    ))
                ) : <p className="text-gray-500 text-center py-8">No favorite venues.</p>}
            </div>
        )}

        {activeTab === 'likes' && (
            <div className="space-y-4">
                {likedEvents.length > 0 ? (
                    likedEvents.map(event => {
                        const venue = venues.find(v => v.id === event.venueId);
                        return (
                            <EventCard
                                key={event.id}
                                event={event}
                                onViewDetails={handleOpenEventModal}
                                isLiked={true}
                                onToggleLike={() => onToggleLike(getOriginalEventId(event.id))}
                                isRsvped={rsvpedEventIds.includes(getOriginalEventId(event.id))}
                                onRsvp={() => onRsvp(getOriginalEventId(event.id))}
                                venueName={venue?.name}
                                venueLocation={venue?.location}
                                isBookmarked={bookmarkedEventIds.includes(getOriginalEventId(event.id))}
                                onToggleBookmark={() => onToggleBookmark(getOriginalEventId(event.id))}
                                venueCategory={venue?.category}
                                venueMusicType={venue?.musicType}
                                guestlistStatus={getGuestlistStatus(event)}
                                invitationStatus={getInvitationStatus(event)}
                                onRequestInvite={() => onRequestInvite(getOriginalEventId(event.id))}
                                onBook={onBookEvent}
                            />
                        );
                    })
                ) : <p className="text-gray-500 text-center py-8">No liked events.</p>}
            </div>
        )}

        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Suggested For You</h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                <div className="flex space-x-4">
                    {visibleSuggestedEvents.map(event => {
                        const venue = venues.find(v => v.id === event.venueId);
                        return (
                            <SuggestedEventCard 
                                key={event.id} 
                                event={event} 
                                onViewDetails={handleOpenEventModal} 
                                venueName={venue?.name}
                                venueLocation={venue?.location}
                                venueCategory={venue?.category}
                                venueMusicType={venue?.musicType}
                            />
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="mt-8 mb-8">
            <DiscoverCard onClick={() => setIsMapOpen(true)} />
        </div>
      </div>

      {selectedEventForModal && (
        <EventDetailModal
            event={selectedEventForModal}
            onClose={handleCloseEventModal}
            isRsvped={rsvpedEventIds.includes(getOriginalEventId(selectedEventForModal.id))}
            onRsvp={onRsvp}
            venues={venues}
            onViewVenueExperiences={(venue) => {
                handleCloseEventModal();
            }}
            invitationStatus={invitationRequests.find(req => req.userId === currentUser.id && req.eventId === getOriginalEventId(selectedEventForModal.id))?.status || 'none'}
            onRequestInvite={onRequestInvite}
            currentUser={currentUser}
            isBookmarked={bookmarkedEventIds.includes(getOriginalEventId(selectedEventForModal.id))}
            onToggleBookmark={onToggleBookmark}
            onPayForEvent={onPayForEvent}
            onNavigateToChat={onNavigateToChat}
            onViewParticipants={() => setIsParticipantsModalOpen(true)}
            isSubscribed={subscribedEventIds.includes(getOriginalEventId(selectedEventForModal.id))}
            onToggleSubscription={onToggleSubscription}
            onBookVenue={onBookVenue}
            isLiked={likedEventIds.includes(getOriginalEventId(selectedEventForModal.id))}
            onToggleLike={onToggleLike}
            onJoinGuestlist={onJoinGuestlist}
            guestlistStatus={getGuestlistStatus(selectedEventForModal)}
            onBook={onBookEvent}
        />
      )}
      
      <EventParticipantsModal isOpen={isParticipantsModalOpen} onClose={() => setIsParticipantsModalOpen(false)} participants={participantsForEvent} />
      <MiamiMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </>
  );
};
