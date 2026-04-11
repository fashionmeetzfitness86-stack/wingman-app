import React, { useState, useMemo } from 'react';
import { Venue, User, Promoter, GuestlistJoinRequest } from '../types';
import { venues } from '../data/mockData';
import { VenueCard } from './VenueCard';

interface BookATablePageProps {
  onBookVenue: (venue: Venue) => void;
  favoriteVenueIds: number[];
  onToggleFavorite: (venueId: number) => void;
  onViewVenueDetails: (venue: Venue) => void;
  currentUser: User;
  promoters: Promoter[];
  onJoinGuestlist: (promoter: Promoter, venue: Venue) => void;
  guestlistJoinRequests: GuestlistJoinRequest[];
}

export const BookATablePage: React.FC<BookATablePageProps> = ({ 
    onBookVenue, 
    favoriteVenueIds, 
    onToggleFavorite, 
    onViewVenueDetails,
    currentUser,
    promoters,
    onJoinGuestlist,
    guestlistJoinRequests
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVenues = useMemo(() => {
    const keywords = searchTerm.toLowerCase().split(' ').filter(kw => kw.trim() !== '');
    
    if (keywords.length === 0) {
      return venues;
    }

    return venues.filter(venue => {
      return keywords.every(keyword => {
        if (keyword === 'daytime') {
          return venue.category === 'Pool Party' || venue.category === 'Beach Club';
        }
        return (
          venue.name.toLowerCase().includes(keyword) ||
          venue.category.toLowerCase().includes(keyword) ||
          venue.location.toLowerCase().includes(keyword) ||
          venue.musicType.toLowerCase().includes(keyword) ||
          venue.vibe.toLowerCase().includes(keyword) ||
          venue.operatingDays.some(day => day.toLowerCase().startsWith(keyword))
        );
      });
    });
  }, [searchTerm]);

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Select a <span className="text-white">Venue</span>
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
          Choose your destination for an unforgettable night. Each venue offers a unique experience curated by our elite promoters.
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="mb-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
          <label htmlFor="search-venue" className="sr-only">Search by venue name, genre, day, etc.</label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          </div>
          <input
            type="text"
            id="search-venue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by venue, day, genre, vibe..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]"
          />
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredVenues.map(venue => (
          <VenueCard 
            key={venue.id} 
            venue={venue} 
            onBook={onBookVenue}
            isFavorite={favoriteVenueIds.includes(venue.id)}
            onToggleFavorite={onToggleFavorite}
            onViewDetails={onViewVenueDetails}
            currentUser={currentUser}
            promoters={promoters}
            onJoinGuestlist={onJoinGuestlist}
            guestlistJoinRequests={guestlistJoinRequests}
          />
        ))}
        {filteredVenues.length === 0 && (
            <p className="text-center text-gray-400 sm:col-span-2 py-16">No venues match your search criteria.</p>
        )}
      </div>
    </div>
  );
};