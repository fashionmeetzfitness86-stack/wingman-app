
/**
 * BookATablePage.tsx  →  Venue Browser
 * ─────────────────────────────────────────────────────────────
 * A premium, browse-only venue directory.
 * Users can explore all Wingman venues — no booking from this page.
 */

import React, { useState, useMemo } from 'react';
import { Venue, User } from '../types';
import { venues } from '../data/mockData';

interface BookATablePageProps {
  // Kept so App.tsx doesn't need changes
  onBookVenue?: (venue: Venue) => void;
  favoriteVenueIds?: number[];
  onToggleFavorite?: (venueId: number) => void;
  onViewVenueDetails: (venue: Venue) => void;
  currentUser: User;
  promoters?: unknown[];
  onJoinGuestlist?: unknown;
  guestlistJoinRequests?: unknown[];
}

const CATEGORY_FILTERS = ['All', 'Nightclub', 'Restaurant', 'Lounge', 'Beach Club', 'Pool Party'] as const;
type CategoryFilter = typeof CATEGORY_FILTERS[number];

const CAT_ICONS: Record<string, string> = {
  All: '✦',
  Nightclub: '🌙',
  Restaurant: '🍽',
  Lounge: '🥂',
  'Beach Club': '🌊',
  'Pool Party': '☀️',
};

const VibeChip: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span
    className="text-xs font-semibold rounded-full px-2.5 py-0.5"
    style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
  >
    {label}
  </span>
);

const VIBE_COLORS: Record<string, string> = {
  'High Energy':    '#A855F7',
  'Trendy':         '#EC4899',
  'Sophisticated':  '#06B6D4',
  'Relaxed':        '#22C55E',
  'Luxurious':      '#F59E0B',
  'Vibrant':        '#EF4444',
};

const VenueBrowseCard: React.FC<{
  venue: Venue;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onViewDetails: (venue: Venue) => void;
}> = ({ venue, isFavorite, onToggleFavorite, onViewDetails }) => {
  const vibeColor = VIBE_COLORS[venue.vibe] ?? '#9CA3AF';

  const DAYS_SHORT: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
    Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
  };

  return (
    <div
      onClick={() => onViewDetails(venue)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl"
      style={{
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onViewDetails(venue)}
      aria-label={`View ${venue.name}`}
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden">
        {venue.coverImage ? (
          <img
            src={venue.coverImage}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">
            <span className="text-4xl">🏛</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 55%)' }}
        />

        {/* Category badge — top left */}
        <div
          className="absolute top-3 left-3 text-xs font-bold rounded-full px-2.5 py-1 flex items-center gap-1"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
        >
          <span>{CAT_ICONS[venue.category] ?? '📍'}</span>
          {venue.category}
        </div>

        {/* Favorite button — top right */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(venue.id); }}
          className="absolute top-3 right-3 p-2 rounded-full transition-all"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className="w-4.5 h-4.5"
            style={{ width: '18px', height: '18px', color: isFavorite ? '#EC4899' : 'white' }}
            fill={isFavorite ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Name + location at bottom of image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-black text-white leading-tight">{venue.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{venue.location}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        {/* Rating + music + vibe */}
        <div className="flex items-center gap-3 flex-wrap">
          {venue.averageRating && (
            <div className="flex items-center gap-1 text-xs font-bold text-white">
              <span className="text-amber-400">★</span>
              {venue.averageRating.toFixed(1)}
              {venue.totalReviews && (
                <span className="text-gray-600 font-normal ml-0.5">({venue.totalReviews})</span>
              )}
            </div>
          )}
          <span className="text-xs text-gray-500">·</span>
          <span className="text-xs text-gray-400">{venue.musicType}</span>
          <VibeChip label={venue.vibe} color={vibeColor} />
        </div>

        {/* Capacity */}
        {venue.capacity && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {venue.capacity.toLocaleString()} capacity
          </div>
        )}

        {/* Operating days */}
        <div className="flex flex-wrap gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(short => {
            const full = Object.entries(DAYS_SHORT).find(([, s]) => s === short)?.[0];
            const open = full ? venue.operatingDays.includes(full) : false;
            return (
              <span
                key={short}
                className="text-xs rounded px-1.5 py-0.5 font-semibold"
                style={open
                  ? { background: 'rgba(236,72,153,0.12)', color: '#EC4899' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#4B5563' }}
              >
                {short}
              </span>
            );
          })}
        </div>

        {/* View details CTA */}
        <button
          onClick={e => { e.stopPropagation(); onViewDetails(venue); }}
          className="w-full text-sm font-bold py-2.5 rounded-xl transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(236,72,153,0.12)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(236,72,153,0.3)';
            (e.currentTarget as HTMLButtonElement).style.color = '#EC4899';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
        >
          View Venue →
        </button>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────

export const BookATablePage: React.FC<BookATablePageProps> = ({
  favoriteVenueIds = [],
  onToggleFavorite = () => {},
  onViewVenueDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const filteredVenues = useMemo(() => {
    const kw = searchTerm.toLowerCase().trim();
    return venues.filter(v => {
      const matchesCat = categoryFilter === 'All' || v.category === categoryFilter;
      if (!matchesCat) return false;
      if (!kw) return true;
      return (
        v.name.toLowerCase().includes(kw) ||
        v.location.toLowerCase().includes(kw) ||
        v.musicType.toLowerCase().includes(kw) ||
        v.vibe.toLowerCase().includes(kw) ||
        v.category.toLowerCase().includes(kw) ||
        v.operatingDays.some(d => d.toLowerCase().startsWith(kw))
      );
    });
  }, [searchTerm, categoryFilter]);

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'transparent' }}>

      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-30 px-4 pt-5 pb-4"
        style={{
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="mb-4">
          <h1 className="text-2xl font-black text-white leading-tight">Venues</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'} · Miami
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            id="venue-search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, genre, vibe, day..."
            className="w-full text-sm text-white placeholder-gray-600 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-[#EC4899]"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="flex-shrink-0 text-xs font-bold rounded-full px-3 py-1.5 transition-all"
              style={categoryFilter === cat
                ? { background: '#EC4899', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Venue grid ── */}
      <div className="px-4 pt-5 pb-28">
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredVenues.map(venue => (
              <VenueBrowseCard
                key={venue.id}
                venue={venue}
                isFavorite={favoriteVenueIds.includes(venue.id)}
                onToggleFavorite={onToggleFavorite}
                onViewDetails={onViewVenueDetails}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
            <span className="text-5xl mb-4">🏛</span>
            <p className="font-semibold text-gray-500">No venues match your search.</p>
            <button
              onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
              className="mt-4 text-sm text-[#EC4899] hover:text-pink-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};