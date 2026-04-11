
import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { EventCard } from './EventCard';
import { venues } from '../data/mockData';
import { Event, Promoter, Venue, User, UserAccessLevel, Page, EventInvitationRequest, GuestlistJoinRequest } from '../types';
import { FeaturedVenueCard } from './FeaturedVenueCard';
import { EventDetailModal } from './modals/EventDetailModal';
import { SavedVenueCard } from './SavedVenueCard';
import { EventParticipantsModal } from './modals/EventParticipantsModal';
import { Modal } from './ui/Modal';

interface EventsCalendarProps {
  onOpenScanner: () => void;
  allEvents: Event[];
  rsvpedEventIds: number[];
  onRsvp: (eventId: number | string) => void;
  favoriteVenueIds: number[];
  onToggleVenueFavorite: (venueId: number) => void;
  currentUser: User;
  likedEventIds: number[];
  onToggleLike: (eventId: number | string) => void;
  onNavigate: (page: Page) => void;
  onBookVenue: (venue: Venue) => void;
  onViewVenueDetails: (venue: Venue) => void;
  onViewVenueExperiences: (venue: Venue) => void;
  promoters: Promoter[];
  bookmarkedEventIds: number[];
  onToggleBookmark: (eventId: number | string) => void;
  users: User[];
  invitationRequests: EventInvitationRequest[];
  onRequestInvite: (eventId: number | string) => void;
  onPayForEvent: (event: Event) => void;
  onNavigateToChat: (event: Event) => void;
  subscribedEventIds: number[];
  onToggleSubscription: (eventId: number | string) => void;
  guestlistRequests?: GuestlistJoinRequest[];
  onJoinGuestlist: (context: { promoter?: Promoter; venue?: Venue, date?: string }) => void;
}

export const EventsCalendar: React.FC<EventsCalendarProps> = ({ 
    onOpenScanner, 
    allEvents,
    rsvpedEventIds, 
    onRsvp, 
    favoriteVenueIds, 
    onToggleVenueFavorite,
    currentUser,
    likedEventIds,
    onToggleLike,
    onNavigate,
    onBookVenue,
    onViewVenueDetails,
    onViewVenueExperiences,
    promoters,
    bookmarkedEventIds,
    onToggleBookmark,
    users,
    invitationRequests,
    onRequestInvite,
    onPayForEvent,
    onNavigateToChat,
    subscribedEventIds,
    onToggleSubscription,
    guestlistRequests,
    onJoinGuestlist
}) => {
    const [currentDate, setCurrentDate] = useState(new Date('2025-03-01'));
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [selectedEventForModal, setSelectedEventForModal] = useState<Event | null>(null);
    const [activeTab, setActiveTab] = useState<'calendar' | 'favorites' | 'likes'>('calendar');
    const [participantsForEvent, setParticipantsForEvent] = useState<User[]>([]);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

    const favoriteVenues = venues.filter(v => favoriteVenueIds.includes(v.id));

    const visibleEvents = useMemo(() => {
        return allEvents.filter(event => {
            if (event.accessLevels && event.accessLevels.length > 0) {
                if (!event.accessLevels.includes(currentUser.accessLevel)) {
                    return false;
                }
            }
            if (event.type === 'INVITE ONLY') {
                return currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.accessLevel === UserAccessLevel.ACCESS_MALE;
            }
            return true;
        });
    }, [allEvents, currentUser.accessLevel]);

    const likedEvents = useMemo(() => {
        return visibleEvents.filter(event => likedEventIds.includes(Number(event.id)));
    }, [visibleEvents, likedEventIds]);
    
    const getOriginalEventId = (eventId: number | string) => {
        return typeof eventId === 'string' ? parseInt(eventId.split('-')[0], 10) : eventId;
    };

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
        setIsDayModalOpen(true);
    }

    const allMonthlyEvents = useMemo(() => {
        const eventsInMonth: Event[] = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthStartDate = new Date(year, month, 1);
        const monthEndDate = new Date(year, month + 1, 0);

        visibleEvents.forEach(event => {
            const eventStartDate = new Date(event.date + 'T00:00:00');

            if (event.recurrence) {
                const recurrenceEndDate = new Date(event.recurrence.endDate + 'T00:00:00');
                let currentOccurrenceDate = new Date(eventStartDate);

                while (currentOccurrenceDate <= monthEndDate && currentOccurrenceDate <= recurrenceEndDate) {
                    if (currentOccurrenceDate >= monthStartDate) {
                        eventsInMonth.push({
                            ...event,
                            id: `${event.id}-${currentOccurrenceDate.toISOString().split('T')[0]}`,
                            date: currentOccurrenceDate.toISOString().split('T')[0],
                        });
                    }

                    switch (event.recurrence.frequency) {
                        case 'daily':
                            currentOccurrenceDate.setDate(currentOccurrenceDate.getDate() + 1);
                            break;
                        case 'weekly':
                            currentOccurrenceDate.setDate(currentOccurrenceDate.getDate() + 7);
                            break;
                        case 'monthly':
                            currentOccurrenceDate.setMonth(currentOccurrenceDate.getMonth() + 1);
                            break;
                    }
                }
            } else {
                if (eventStartDate >= monthStartDate && eventStartDate <= monthEndDate) {
                    eventsInMonth.push(event);
                }
            }
        });

        return eventsInMonth;
    }, [visibleEvents, currentDate]);
    
    const eventsByDate = useMemo(() => {
        const map = new Map<number, Event[]>();
        allMonthlyEvents.forEach(event => {
            const eventDate = new Date(event.date + "T00:00:00");
            const day = eventDate.getDate();
            if (!map.has(day)) {
                map.set(day, []);
            }
            map.get(day)?.push(event);
        });
        return map;
    }, [allMonthlyEvents]);
    
    const venuesOpenByDate = useMemo(() => {
        const openDays = new Set<number>();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const weekDaysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayName = weekDaysMap[date.getDay()];
            
            const isOpen = venues.some(venue => venue.operatingDays.includes(dayName));
            
            if (isOpen) {
                openDays.add(day);
            }
        }
        return openDays;
    }, [currentDate]);

    const filteredEvents = useMemo(() => {
        if (selectedDate) {
            return eventsByDate.get(selectedDate) || [];
        }
        return [];
    }, [selectedDate, eventsByDate]);

    const venuesOpenOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const dateToCheck = new Date(year, currentDate.getMonth(), selectedDate);
        const dayName = dateToCheck.toLocaleString('en-us', { weekday: 'long' });
        return venues.filter(venue => venue.operatingDays.includes(dayName));
    }, [selectedDate, currentDate, year]);

    const venuesOpenToday = useMemo(() => {
        const today = new Date();
        const dayName = today.toLocaleString('en-us', { weekday: 'long' });
        return venues.filter(venue => venue.operatingDays.includes(dayName));
    }, []);

    const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();

    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const eventsOnDay = eventsByDate.get(i) || [];
            const hasExclusiveEvent = eventsOnDay.some(e => e.type === 'EXCLUSIVE');
            const hasInviteOnlyEvent = eventsOnDay.some(e => e.type === 'INVITE ONLY');
            const hasOpenVenue = venuesOpenByDate.has(i);
            const isSelected = selectedDate === i;
            
            const dayClasses = `relative flex flex-col items-center justify-center h-10 w-10 rounded-full transition-colors duration-200 ${
                isSelected ? 'bg-white text-blue-600 font-bold' : 'text-white font-semibold hover:bg-gray-800'
            }`;

            days.push(
                <button key={i} onClick={() => handleDayClick(i)} className={dayClasses} aria-label={`View events for ${monthName} ${i}`}>
                    <span>{i}</span>
                    <div className="absolute bottom-1.5 flex items-center justify-center gap-0.5">
                        {hasExclusiveEvent && <div className="w-1.5 h-1.5 bg-green-400 rounded-full" title="Exclusive Event"></div>}
                        {hasInviteOnlyEvent && <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" title="Invite Only Event"></div>}
                        {hasOpenVenue && <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" title="Venue open"></div>}
                    </div>
                </button>
            );
        }
        return days;
    }, [currentDate, daysInMonth, firstDayOfMonth, eventsByDate, venuesOpenByDate, selectedDate, monthName]);

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

    const handleViewParticipants = () => {
        setIsParticipantsModalOpen(true);
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

    const renderCalendar = () => (
        <>
            <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Previous month">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">{monthName} {year}</h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Next month">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-gray-400 text-sm mb-4">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 place-items-center">
                {calendarDays}
            </div>

            <Modal 
                isOpen={isDayModalOpen} 
                onClose={() => setIsDayModalOpen(false)} 
                title={`Schedule for ${monthName} ${selectedDate}`}
                className="max-w-2xl"
            >
                 {filteredEvents.length === 0 && venuesOpenOnSelectedDate.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        Nothing scheduled for {monthName} {selectedDate}.
                    </p>
                ) : (
                    <div className="space-y-8">
                        {filteredEvents.length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-gray-300 mb-4">Events</h4>
                                <div className="space-y-4">
                                    {filteredEvents.map(event => {
                                        const originalId = getOriginalEventId(event.id);
                                        const venue = venues.find(v => v.id === event.venueId);
                                        return (
                                            <EventCard 
                                                key={`${event.id}-${event.date}`}
                                                event={event} 
                                                onViewDetails={handleOpenEventModal}
                                                isRsvped={rsvpedEventIds.includes(originalId)}
                                                onRsvp={onRsvp}
                                                isLiked={likedEventIds.includes(originalId)}
                                                onToggleLike={onToggleLike}
                                                venueName={venue?.name}
                                                venueLocation={venue?.location}
                                                isBookmarked={bookmarkedEventIds.includes(originalId)}
                                                onToggleBookmark={onToggleBookmark}
                                                venueCategory={venue?.category}
                                                venueMusicType={venue?.musicType}
                                                guestlistStatus={getGuestlistStatus(event)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {venuesOpenOnSelectedDate.length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-gray-300 mb-4">Open Venues</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {venuesOpenOnSelectedDate.map(venue => (
                                        <FeaturedVenueCard 
                                            key={venue.id}
                                            venue={venue} 
                                            currentUser={currentUser} 
                                            onNavigate={onNavigate}
                                            onBookVenue={onBookVenue}
                                            onViewVenueExperiences={onViewVenueExperiences}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <div className="mt-12">
                <div className="border-b border-gray-800 pb-4 mb-6">
                    <h3 className="text-xl font-bold">Venues Open Today</h3>
                </div>
                {venuesOpenToday.length > 0 ? (
                    <div className="overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                        <div className="flex space-x-4">
                            {venuesOpenToday.map(venue => (
                                <div key={venue.id} className="flex-shrink-0 w-full sm:w-80">
                                    <FeaturedVenueCard 
                                        venue={venue} 
                                        currentUser={currentUser} 
                                        onNavigate={onNavigate}
                                        onBookVenue={onBookVenue}
                                        onViewVenueExperiences={onViewVenueExperiences}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">No venues are open today.</p>
                )}
            </div>
        </>
    );

    const renderFavorites = () => (
        <div>
            <div className="space-y-3">
                {favoriteVenues.length > 0 ? (
                    favoriteVenues.map(venue => (
                        <SavedVenueCard 
                            key={venue.id} 
                            venue={venue} 
                            onToggleFavorite={onToggleVenueFavorite}
                            onViewDetails={onViewVenueDetails}
                        />
                    ))
                ) : (
                <p className="text-gray-400 text-center py-8">You haven't saved any venues yet.</p>
                )}
            </div>
        </div>
    );
    
    const renderLikes = () => (
        <div>
          <div className="space-y-4">
            {likedEvents.length > 0 ? (
              likedEvents.map(event => {
                const venue = venues.find(v => v.id === event.venueId);
                const originalId = getOriginalEventId(event.id);
                return (
                    <EventCard
                      key={event.id}
                      event={event}
                      onViewDetails={handleOpenEventModal}
                      isLiked={true}
                      onToggleLike={() => onToggleLike(originalId)}
                      isRsvped={rsvpedEventIds.includes(originalId)}
                      onRsvp={() => onRsvp(originalId)}
                      venueName={venue?.name}
                      venueLocation={venue?.location}
                      isBookmarked={bookmarkedEventIds.includes(originalId)}
                      onToggleBookmark={() => onToggleBookmark(originalId)}
                      venueCategory={venue?.category}
                      venueMusicType={venue?.musicType}
                      guestlistStatus={getGuestlistStatus(event)}
                    />
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-8">You haven't liked any events yet.</p>
            )}
          </div>
        </div>
      );

    return (
        <>
            <div className="p-4 md:p-8 animate-fade-in text-white">
                <div className="flex border-b border-gray-700 mb-6">
                    <button 
                    onClick={() => setActiveTab('calendar')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'calendar' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                    >
                    Calendar
                    </button>
                    <button 
                    onClick={() => setActiveTab('favorites')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'favorites' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                    >
                    Favorites
                    </button>
                     <button 
                       onClick={() => setActiveTab('likes')}
                       className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'likes' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                   >
                       Likes
                   </button>
                </div>

                {activeTab === 'calendar' && renderCalendar()}
                {activeTab === 'favorites' && renderFavorites()}
                {activeTab === 'likes' && renderLikes()}

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
                        onViewVenueExperiences(venue);
                    }}
                    invitationStatus={invitationRequests.find(req => req.userId === currentUser.id && req.eventId === getOriginalEventId(selectedEventForModal.id))?.status || 'none'}
                    onRequestInvite={onRequestInvite}
                    currentUser={currentUser}
                    isBookmarked={bookmarkedEventIds.includes(getOriginalEventId(selectedEventForModal.id))}
                    onToggleBookmark={onToggleBookmark}
                    onPayForEvent={onPayForEvent}
                    onNavigateToChat={onNavigateToChat}
                    onViewParticipants={handleViewParticipants}
                    isSubscribed={subscribedEventIds.includes(getOriginalEventId(selectedEventForModal.id))}
                    onToggleSubscription={onToggleSubscription}
                    onBookVenue={onBookVenue}
                    isLiked={likedEventIds.includes(getOriginalEventId(selectedEventForModal.id))}
                    onToggleLike={onToggleLike}
                    onJoinGuestlist={onJoinGuestlist}
                />
            )}
            <EventParticipantsModal isOpen={isParticipantsModalOpen} onClose={() => setIsParticipantsModalOpen(false)} participants={participantsForEvent} />
        </>
    );
};
