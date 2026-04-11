import React from 'react';
import { Venue, User, UserAccessLevel, Page } from '../types';
import { SparkleIcon } from './icons/SparkleIcon';
import { BookTableIcon } from './icons/BookTableIcon';
import { UsersIcon } from './icons/UsersIcon';

interface FeaturedVenueCardProps {
  venue: Venue;
  currentUser: User;
  onNavigate: (page: Page) => void;
  onBookVenue: (venue: Venue) => void;
  onViewVenueExperiences: (venue: Venue) => void;
}

export const FeaturedVenueCard: React.FC<FeaturedVenueCardProps> = ({ venue, currentUser, onNavigate, onBookVenue, onViewVenueExperiences }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="relative">
        <img src={venue.coverImage} alt={venue.name} className="w-full h-32 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3">
          <h3 className="text-lg font-bold text-white">{venue.name}</h3>
          <p className="text-xs text-gray-300">{venue.location}</p>
        </div>
      </div>
      <div className="p-3 flex justify-center gap-2">
        {currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL && (
            <button 
              onClick={() => onBookVenue(venue)}
              className="flex flex-col items-center justify-center flex-1 gap-1.5 text-center bg-gray-800 text-gray-300 font-semibold py-2 px-2 rounded-md text-xs transition-colors hover:bg-gray-700 hover:text-white"
              aria-label={`Join guestlist for ${venue.name}`}
            >
                <UsersIcon className="w-4 h-4" />
                <span>Guestlist</span>
            </button>
        )}
        <button 
          onClick={() => onViewVenueExperiences(venue)}
          className="flex flex-col items-center justify-center flex-1 gap-1.5 text-center bg-gray-800 text-gray-300 font-semibold py-2 px-2 rounded-md text-xs transition-colors hover:bg-gray-700 hover:text-white"
          aria-label={`View experiences at ${venue.name}`}
        >
            <SparkleIcon className="w-4 h-4" />
            <span>Experiences</span>
        </button>
        <button 
          onClick={() => onBookVenue(venue)}
          className="flex flex-col items-center justify-center flex-1 gap-1.5 text-center bg-gray-800 text-gray-300 font-semibold py-2 px-2 rounded-md text-xs transition-colors hover:bg-gray-700 hover:text-white"
          aria-label={`Book a table at ${venue.name}`}
        >
            <BookTableIcon className="w-4 h-4" />
            <span>Book Table</span>
        </button>
      </div>
    </div>
  );
};