
import React, { useState } from 'react';
import { Promoter, Venue, User, Page, Event, Experience } from '../types';
import { venues as mockVenues } from '../data/mockData';
import { SavedVenueCard } from './SavedVenueCard';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { SavedPromoterCard } from './SavedPromoterCard';
import { EventCard } from './EventCard';
import { ExperienceCard } from './ExperienceCard';

interface FavoritesPageProps {
  promoters: Promoter[];
  onSelectPromoter: (promoter: Promoter) => void;
  onToggleFavorite: (promoterId: number) => void;
  onNavigate: (page: Page) => void;
  favoriteVenueIds: number[];
  onToggleVenueFavorite: (venueId: number) => void;
  onViewVenueDetails: (venue: Venue) => void;
  currentUser: User;
  events?: Event[];
  likedEventIds?: number[];
  onToggleLikeEvent?: (eventId: number | string) => void;
  onViewEvent?: (event: Event) => void;
  venues?: Venue[];
  bookmarkedEventIds?: number[];
  onToggleBookmarkEvent?: (eventId: number | string) => void;
  likedExperienceIds?: number[];
  experiences?: Experience[];
  onToggleLikeExperience?: (experienceId: number) => void;
  bookmarkedExperienceIds?: number[];
  onToggleBookmarkExperience?: (experienceId: number) => void;
}

type Tab = 'promoters' | 'venues' | 'events' | 'bookmarks' | 'experiences';

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ 
    promoters,
    onSelectPromoter,
    onToggleFavorite,
    onNavigate, 
    favoriteVenueIds, 
    onToggleVenueFavorite,
    onViewVenueDetails,
    currentUser,
    events = [],
    likedEventIds = [],
    onToggleLikeEvent,
    onViewEvent,
    venues = mockVenues,
    bookmarkedEventIds = [],
    onToggleBookmarkEvent,
    likedExperienceIds = [],
    experiences = [],
    onToggleLikeExperience,
    bookmarkedExperienceIds = [],
    onToggleBookmarkExperience
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('events');

  const favoriteVenues = venues.filter(v => favoriteVenueIds.includes(v.id));
  const favoritePromoters = promoters.filter(p => (currentUser.favoritePromoterIds || []).includes(p.id));
  
  const favoriteEvents = events.filter(e => {
      const originalId = typeof e.id === 'string' ? parseInt(e.id.split('-')[0], 10) : e.id;
      return likedEventIds.includes(originalId);
  });

  const bookmarkedEvents = events.filter(e => {
      const originalId = typeof e.id === 'string' ? parseInt(e.id.split('-')[0], 10) : e.id;
      return bookmarkedEventIds.includes(originalId);
  });

  const favoriteExperiences = experiences.filter(e => likedExperienceIds.includes(e.id));

  return (
    <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
      <button onClick={() => onNavigate('userProfile')} className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold">
        <ChevronLeftIcon className="w-5 h-5"/>
        Back to Profile
      </button>
      
      <h1 className="text-3xl font-bold text-white mb-6">My Favorites</h1>

      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-sm md:text-lg font-semibold transition-colors whitespace-nowrap ${activeTab === 'events' ? 'text-white border-b-2 border-[#EC4899]' : 'text-gray-400'}`}
          >
            Events ({favoriteEvents.length})
          </button>
          <button 
            onClick={() => setActiveTab('experiences')}
            className={`px-4 py-2 text-sm md:text-lg font-semibold transition-colors whitespace-nowrap ${activeTab === 'experiences' ? 'text-white border-b-2 border-[#EC4899]' : 'text-gray-400'}`}
          >
            Experiences ({favoriteExperiences.length})
          </button>
          <button 
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 text-sm md:text-lg font-semibold transition-colors whitespace-nowrap ${activeTab === 'bookmarks' ? 'text-white border-b-2 border-[#EC4899]' : 'text-gray-400'}`}
          >
            Saved ({bookmarkedEvents.length})
          </button>
          <button 
            onClick={() => setActiveTab('promoters')}
            className={`px-4 py-2 text-sm md:text-lg font-semibold transition-colors whitespace-nowrap ${activeTab === 'promoters' ? 'text-white border-b-2 border-[#EC4899]' : 'text-gray-400'}`}
          >
            Promoters ({favoritePromoters.length})
          </button>
          <button 
            onClick={() => setActiveTab('venues')}
            className={`px-4 py-2 text-sm md:text-lg font-semibold transition-colors whitespace-nowrap ${activeTab === 'venues' ? 'text-white border-b-2 border-[#EC4899]' : 'text-gray-400'}`}
          >
            Venues ({favoriteVenues.length})
          </button>
      </div>

      {activeTab === 'events' && (
        <div className="space-y-4">
            {favoriteEvents.length > 0 ? (
                favoriteEvents.map(event => {
                    const venue = venues.find(v => v.id === event.venueId);
                    const originalId = typeof event.id === 'string' ? parseInt(event.id.split('-')[0], 10) : event.id;
                    return (
                        <EventCard 
                            key={event.id}
                            event={event}
                            onViewDetails={onViewEvent || (() => {})}
                            isLiked={true}
                            onToggleLike={onToggleLikeEvent}
                            isBookmarked={bookmarkedEventIds.includes(originalId)}
                            onToggleBookmark={onToggleBookmarkEvent}
                            venueName={venue?.name}
                            venueLocation={venue?.location}
                        />
                    );
                })
            ) : (
                 <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-gray-400">You haven't liked any events yet.</p>
                 </div>
            )}
        </div>
      )}

       {activeTab === 'experiences' && (
        <div className="space-y-6">
            {favoriteExperiences.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteExperiences.map(exp => (
                        <ExperienceCard 
                            key={exp.id}
                            experience={exp}
                            currentUser={currentUser}
                            onViewDetails={() => {}} // Could expand in modal
                            onBook={() => {}} // Could trigger booking flow
                            isLiked={true}
                            onToggleLike={() => onToggleLikeExperience?.(exp.id)}
                            isBookmarked={bookmarkedExperienceIds?.includes(exp.id)}
                            onToggleBookmark={() => onToggleBookmarkExperience?.(exp.id)}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-gray-400">You haven't liked any experiences yet.</p>
                 </div>
            )}
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
            {bookmarkedEvents.length > 0 ? (
                bookmarkedEvents.map(event => {
                    const venue = venues.find(v => v.id === event.venueId);
                    const originalId = typeof event.id === 'string' ? parseInt(event.id.split('-')[0], 10) : event.id;
                    return (
                        <EventCard 
                            key={event.id}
                            event={event}
                            onViewDetails={onViewEvent || (() => {})}
                            isLiked={likedEventIds.includes(originalId)}
                            onToggleLike={onToggleLikeEvent}
                            isBookmarked={true}
                            onToggleBookmark={onToggleBookmarkEvent}
                            venueName={venue?.name}
                            venueLocation={venue?.location}
                        />
                    );
                })
            ) : (
                 <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-gray-400">You haven't bookmarked any events yet.</p>
                    <p className="text-xs text-gray-500 mt-2">Bookmarked events also appear in your "My Plans" watchlist.</p>
                 </div>
            )}
        </div>
      )}

      {activeTab === 'promoters' && (
        <div className="space-y-3">
            {favoritePromoters.length > 0 ? (
                favoritePromoters.map(promoter => (
                    <SavedPromoterCard 
                        key={promoter.id}
                        promoter={promoter}
                        onSelect={onSelectPromoter}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))
            ) : (
                 <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-gray-400">You haven't favorited any promoters yet.</p>
                 </div>
            )}
        </div>
      )}

      {activeTab === 'venues' && (
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
                 <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-gray-400">You haven't saved any venues yet.</p>
                 </div>
            )}
        </div>
      )}
    </div>
  );
};
