
import React, { useState, useMemo } from 'react';
import { Promoter, Page, User, UserAccessLevel, UserRole } from '../types';
import { venues } from '../data/mockData';
import { PromoterCard } from './PromoterCard';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CustomSelect } from './ui/CustomSelect';
import { ToggleSwitch } from './ui/ToggleSwitch';

interface PromoterDirectoryProps {
  promoters: Promoter[];
  isLoading: boolean;
  onViewProfile: (promoter: Promoter) => void;
  onBookPromoter: (promoter: Promoter) => void;
  onToggleFavorite: (promoterId: number) => void;
  currentUser: User;
  onNavigate: (page: Page) => void;
  onJoinGuestlist: (promoter: Promoter) => void;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden animate-pulse">
        <div className="w-full h-48 bg-gray-800"></div>
        <div className="p-4">
            <div className="h-6 w-3/4 bg-gray-800 rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-gray-800 rounded"></div>
            <div className="h-10 w-full bg-gray-800 rounded-lg mt-6"></div>
            <div className="h-10 w-full bg-gray-800 rounded-lg mt-2"></div>
        </div>
    </div>
);

export const PromoterDirectory: React.FC<PromoterDirectoryProps> = ({ promoters, isLoading, onViewProfile, onBookPromoter, onToggleFavorite, currentUser, onNavigate, onJoinGuestlist }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedVenueId, setSelectedVenueId] = useState('all');
  const [showEarnings, setShowEarnings] = useState(false);

  const cities = useMemo(() => [...new Set(promoters.map(p => p.city))], [promoters]);

  const filteredPromoters = useMemo(() => {
    return promoters.filter(promoter => {
      const nameMatch = searchTerm === '' || promoter.name.toLowerCase().includes(searchTerm.toLowerCase());
      const cityMatch = selectedCity === 'all' || promoter.city === selectedCity;
      const venueMatch = selectedVenueId === 'all' || promoter.assignedVenueIds.includes(parseInt(selectedVenueId, 10));
      return nameMatch && cityMatch && venueMatch;
    });
  }, [searchTerm, selectedCity, selectedVenueId, promoters]);
  
  const sortedVenues = useMemo(() => [...venues].sort((a, b) => a.name.localeCompare(b.name)), []);

  const venueOptions = useMemo(() => [
    { value: 'all', label: 'All Venues', imageUrl: '' },
    ...sortedVenues.map(venue => ({
      value: venue.id.toString(),
      label: venue.name,
      imageUrl: venue.coverImage || undefined,
    }))
  ], [sortedVenues]);

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Find Your <span className="text-[#EC4899]">Wingman</span>
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
          Connect with Miami's elite promoters to unlock exclusive access to the city's most sought-after nightlife experiences.
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="mb-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
            <label htmlFor="search-promoter" className="sr-only">Search by promoter name</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </div>
            <input
                type="text"
                id="search-promoter"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by promoter..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]"
            />
            </div>
            <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-grow md:w-48">
                <label htmlFor="filter-city" className="sr-only">Filter by city</label>
                <select
                id="filter-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 appearance-none focus:ring-[#EC4899] focus:border-[#EC4899] pr-8"
                >
                <option value="all">All Cities</option>
                {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                ))}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative flex-grow md:w-48">
                <label htmlFor="filter-venue" className="sr-only">Filter by venue</label>
                <CustomSelect
                    value={selectedVenueId}
                    onChange={setSelectedVenueId}
                    options={venueOptions}
                    placeholder="All Venues"
                />
            </div>
            </div>
        </div>
        {currentUser.role === UserRole.ADMIN && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <label className="text-sm font-semibold text-gray-300">Show Promoter Earnings</label>
                <ToggleSwitch
                    checked={showEarnings}
                    onChange={() => setShowEarnings(!showEarnings)}
                    label="Show promoter earnings"
                />
            </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredPromoters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromoters.map(promoter => (
            <PromoterCard 
              key={promoter.id} 
              promoter={promoter} 
              onViewProfile={() => onViewProfile(promoter)}
              onBook={() => onBookPromoter(promoter)}
              isFavorite={(currentUser.favoritePromoterIds || []).includes(promoter.id)}
              onToggleFavorite={onToggleFavorite}
              onJoinGuestlist={onJoinGuestlist}
              currentUser={currentUser}
              showEarnings={showEarnings}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900">No Promoters Found</h3>
          <p className="text-gray-700 mt-2">Try adjusting your filters to find a match.</p>
        </div>
      )}
    </div>
  );
};
