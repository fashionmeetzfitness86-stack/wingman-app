
/**
 * FeaturedVenuesPage.tsx  →  Featured Venues
 * ─────────────────────────────────────────────────────────────
 * Premium venue directory with direct experience booking.
 * Each venue card shows upcoming Wingman experiences with live
 * spot counts and a "Reserve Spot" CTA that opens the booking modal.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Venue, User, UserRole, EventInstance, InstanceBooking } from '../types';
import { venues } from '../data/mockData';
import {
  generateEventFeed,
  formatEventDate,
  daysUntilLabel,
  computeStatus,
} from '../utils/eventSchedule';
import { useScrollLock } from '../utils/useScrollLock';

// ─── PROPS ────────────────────────────────────────────────────

interface FeaturedVenuesPageProps {
  onBookVenue?: (venue: Venue) => void;
  favoriteVenueIds?: number[];
  onToggleFavorite?: (venueId: number) => void;
  onViewVenueDetails: (venue: Venue) => void;
  onViewDetail?: (instance: EventInstance) => void;
  currentUser: User;
  wingmen?: unknown[];
  onJoinGuestlist?: unknown;
  guestlistJoinRequests?: unknown[];
  bookedMap?: Record<string, number>;
  cancelMap?: Record<string, boolean>;
  instanceBookings?: InstanceBooking[];
  bookmarkedInstanceIds?: string[];
  onBook?: (booking: Omit<InstanceBooking, 'id' | 'bookedAt'>) => void;
  onToggleBookmark?: (instanceId: string) => void;
  onNavigateToPlans?: () => void;
  pendingCartMap?: Record<string, number>;
}

// ─── INLINE ICONS ─────────────────────────────────────────────

const IconHeart = ({ filled, className, style }: { filled?: boolean; className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const IconSearch = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);
const IconUsers = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconClose = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconCheck = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconBookmark = ({ filled, className, style }: { filled?: boolean; className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

// ─── CONFIG ───────────────────────────────────────────────────

const CATEGORY_FILTERS = ['All', 'Nightclub', 'Restaurant', 'Lounge', 'Beach Club', 'Pool Party'] as const;
type CategoryFilter = typeof CATEGORY_FILTERS[number];

const CAT_ICONS: Record<string, string> = {
  All: '✦', Nightclub: '🌙', Restaurant: '🍽', Lounge: '🥂', 'Beach Club': '🌊', 'Pool Party': '☀️',
};

const VIBE_COLORS: Record<string, string> = {
  'High Energy': '#9CA3AF', 'Trendy': '#FFFFFF', 'Sophisticated': '#06B6D4',
  'Relaxed': '#22C55E', 'Luxurious': '#F59E0B', 'Vibrant': '#EF4444',
};

const DAYS_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

const TYPE_ICONS: Record<string, string> = { Nightclub: '🌙', Dinner: '🍽', Yacht: '⚓' };
const TYPE_COLORS: Record<string, string> = { Nightclub: '#9CA3AF', Dinner: '#F59E0B', Yacht: '#06B6D4' };


const ExperienceRow: React.FC<{
  instance: EventInstance;
  isBooked: boolean;
  isInCart: boolean;
  isBookmarked: boolean;
  canBook: boolean;
  onOpenModal: () => void;
  onToggleBookmark: (e: React.MouseEvent) => void;
}> = ({ instance, isBooked, isInCart, isBookmarked, canBook, onOpenModal, onToggleBookmark }) => {
  const spotsLeft = instance.totalCapacity - instance.spotsBooked;
  const color = TYPE_COLORS[instance.experienceType] ?? '#FFFFFF';
  const icon = TYPE_ICONS[instance.experienceType] ?? '✦';

  const ctaLabel = isBooked ? 'Booked ✓' : isInCart ? 'In Cart 🛒' : instance.status === 'sold-out' ? 'Full' : instance.status === 'cancelled' ? 'Cancelled' : 'Reserve';
  const ctaStyle = isBooked
    ? { background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
    : isInCart
    ? { background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }
    : instance.status === 'sold-out' || instance.status === 'cancelled'
    ? { background: 'rgba(255,255,255,0.04)', color: '#4B5563', cursor: 'default' }
    : { background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)', color: '#fff', boxShadow: '0 2px 8px rgba(255,255,255,0.2)' };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.03]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      onClick={onOpenModal}
    >
      {/* Type dot */}
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-bold text-white truncate">{icon} {instance.experienceType}</span>
          <span className="text-[10px] text-gray-600">·</span>
          <span className="text-[10px] text-gray-500">{daysUntilLabel(instance.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span>{instance.arrivalTime || instance.time}</span>
          <span>·</span>
          <span
            style={{
              color: spotsLeft <= 1 ? '#EF4444' : spotsLeft <= 2 ? '#FFFFFF' : spotsLeft <= 5 ? '#F59E0B' : '#6B7280',
              fontWeight: spotsLeft <= 2 ? 700 : 400,
            }}
          >
            {spotsLeft <= 0 ? 'Full' : spotsLeft === 1 ? '🔴 1 left' : spotsLeft <= 2 ? `⚡ ${spotsLeft} left` : `${spotsLeft} spots`}
          </span>
        </div>
      </div>

      {/* Price + bookmark */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-black text-white">${instance.pricePerPerson.toLocaleString()}</span>
        <button
          onClick={e => { e.stopPropagation(); onToggleBookmark(e); }}
          className="p-1 rounded-full transition-colors"
          aria-label="Bookmark"
        >
          <IconBookmark className="w-3.5 h-3.5" filled={isBookmarked} style={{ color: isBookmarked ? '#FFFFFF' : 'rgba(255,255,255,0.3)' } as React.CSSProperties} />
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={e => { e.stopPropagation(); onOpenModal(); }}
        className="text-[11px] font-bold rounded-full px-3 py-1.5 flex-shrink-0 transition-all"
        style={ctaStyle}
      >
        {ctaLabel}
      </button>
    </div>
  );
};

// ─── FEATURED VENUE CARD ─────────────────────────────────────

const FeaturedVenueCard: React.FC<{
  venue: Venue;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onViewDetails: (venue: Venue) => void;
  experiences: EventInstance[];
  isBooked: (inst: EventInstance) => boolean;
  isInCart: (inst: EventInstance) => boolean;
  isBookmarked: (inst: EventInstance) => boolean;
  canBook: boolean;
  onOpenBooking: (inst: EventInstance) => void;
  onToggleBookmark: (instanceId: string) => void;
}> = ({ venue, isFavorite, onToggleFavorite, onViewDetails, experiences, isBooked, isInCart, isBookmarked, canBook, onOpenBooking, onToggleBookmark }) => {
  const vibeColor = VIBE_COLORS[venue.vibe] ?? '#9CA3AF';
  const [expanded, setExpanded] = useState(true);

  // Show only next 3 upcoming experiences for this venue
  const upcomingExp = experiences.slice(0, 3);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
    >
      {/* Cover */}
      <div className="relative h-36 sm:h-44 overflow-hidden cursor-pointer group" onClick={() => onViewDetails(venue)}>
        {venue.coverImage ? (
          <img src={venue.coverImage} alt={venue.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center"><span className="text-4xl">🏛</span></div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 55%)' }} />

        {/* Category badge */}
        <div className="absolute top-3 left-3 text-xs font-bold rounded-full px-2.5 py-1 flex items-center gap-1"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}>
          {CAT_ICONS[venue.category] ?? '📍'} {venue.category}
        </div>

        {/* Fav button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(venue.id); }}
          className="absolute top-3 right-3 p-2 rounded-full transition-all"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        >
          <IconHeart className="w-4 h-4" filled={isFavorite} style={{ color: isFavorite ? '#FFFFFF' : 'white' } as React.CSSProperties} />
        </button>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-black text-white leading-tight">{venue.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{venue.location}</p>
        </div>
      </div>

      {/* Meta strip */}
      <div className="px-4 py-3 flex items-center gap-3 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {venue.averageRating && (
          <div className="flex items-center gap-1 text-xs font-bold text-white">
            <span style={{ color: '#F59E0B' }}>★</span>
            {venue.averageRating.toFixed(1)}
            {venue.totalReviews && <span className="text-gray-600 font-normal ml-0.5">({venue.totalReviews})</span>}
          </div>
        )}
        <span className="text-xs text-gray-500">·</span>
        <span className="text-xs text-gray-400">{venue.musicType}</span>
        <span className="text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: `${vibeColor}18`, color: vibeColor, border: `1px solid ${vibeColor}30` }}>{venue.vibe}</span>

        {/* Days */}
        <div className="flex flex-wrap gap-1 ml-auto">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(short => {
            const full = Object.entries(DAYS_SHORT).find(([, s]) => s === short)?.[0];
            const open = full ? venue.operatingDays.includes(full) : false;
            return (
              <span key={short} className="text-[10px] rounded px-1 py-0.5 font-semibold"
                style={open ? { background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' } : { background: 'rgba(255,255,255,0.04)', color: '#374151' }}>
                {short}
              </span>
            );
          })}
        </div>
      </div>

      {/* Experiences section */}
      {upcomingExp.length > 0 ? (
        <div>
          {/* Section header */}
          <button
            className="w-full flex items-center justify-between px-4 py-2.5 text-left"
            onClick={() => setExpanded(e => !e)}
            style={{ borderBottom: expanded ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
          >
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upcoming Experiences</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-white"
                style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)' }}>
                {upcomingExp.length}
              </span>
              <svg className={`w-3.5 h-3.5 text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expanded && upcomingExp.map(inst => (
            <ExperienceRow
              key={inst.instanceId}
              instance={inst}
              isBooked={isBooked(inst)}
              isInCart={isInCart(inst)}
              isBookmarked={isBookmarked(inst)}
              canBook={canBook}
              onOpenModal={() => onOpenBooking(inst)}
              onToggleBookmark={e => { e.stopPropagation(); onToggleBookmark(inst.instanceId); }}
            />
          ))}
        </div>
      ) : (
        <div className="px-4 py-3 text-xs text-gray-600 italic">No upcoming experiences this week.</div>
      )}

      {/* View venue link */}
      <button
        onClick={() => onViewDetails(venue)}
        className="w-full text-xs font-semibold py-3 text-gray-500 hover:text-gray-300 transition-colors"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        View Venue Details →
      </button>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────

export const FeaturedVenuesPage: React.FC<FeaturedVenuesPageProps> = ({
  favoriteVenueIds = [],
  onToggleFavorite = () => {},
  onViewVenueDetails,
  onViewDetail,
  currentUser,
  bookedMap = {},
  cancelMap = {},
  instanceBookings = [],
  bookmarkedInstanceIds = [],
  onBook = () => {},
  onToggleBookmark = () => {},
  onNavigateToPlans,
  pendingCartMap = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const isApproved = currentUser.approvalStatus === 'approved';
  const hasActiveSub = currentUser.subscriptionStatus === 'active';
  const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.WINGMAN;
  const canBook = isAdmin || (isApproved && hasActiveSub);

  // Generate all upcoming instances
  const allInstances = useMemo(() => generateEventFeed(bookedMap, cancelMap, 4), [bookedMap, cancelMap]);

  // Filter venues
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
        v.category.toLowerCase().includes(kw)
      );
    });
  }, [searchTerm, categoryFilter]);

  // Map instances to venues by venue name matching
  const getVenueExperiences = useCallback((venue: Venue): EventInstance[] => {
    return allInstances.filter(inst =>
      inst.venue.toLowerCase().includes(venue.name.toLowerCase().replace(' miami', '').replace(' beach', '').split(' ')[0]) ||
      venue.name.toLowerCase().includes(inst.venue.toLowerCase().replace(' miami', '').replace(' beach', '').split(' ')[0])
    );
  }, [allInstances]);

  // An instance is 'confirmed booked' if user has a paid InstanceBooking
  const isConfirmedBooked = (inst: EventInstance) =>
    instanceBookings.some(b => b.instanceId === inst.instanceId && b.userId === currentUser.id);

  // An instance is 'in cart' if user has a pending reservation (unpaid, in cart)
  const isInCart = (inst: EventInstance) =>
    (pendingCartMap[inst.instanceId] ?? 0) > 0;

  // Combined: show as 'booked' in the UI if either confirmed OR in cart
  const isBooked = (inst: EventInstance) => isConfirmedBooked(inst) || isInCart(inst);

  const isBookmarked = (inst: EventInstance) => bookmarkedInstanceIds.includes(inst.instanceId);

  const handleOpenInstance = useCallback((inst: EventInstance) => {
    if (onViewDetail) {
      onViewDetail(inst);
    }
  }, [onViewDetail]);

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'transparent' }}>

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 px-4 pt-5 pb-4"
        style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mb-4">
          <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Featured Venues
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'} · Miami — tap to reserve a spot
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <IconSearch className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            id="venue-search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search venues, vibe, genre..."
            className="w-full text-sm text-white placeholder-gray-600 rounded-xl pl-9 pr-4 py-2.5 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-white">✕</button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORY_FILTERS.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className="flex-shrink-0 text-xs font-bold rounded-full px-3 py-1.5 transition-all"
              style={categoryFilter === cat
                ? { background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }}>
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Access notice ── */}
      {!canBook && (
        <div className="mx-4 mt-5 rounded-2xl px-4 py-3 text-sm flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span className="text-xl">🔒</span>
          <p className="text-gray-300">
            <span className="font-bold" style={{ color: '#FFFFFF' }}>Approved members only.</span> Browse venues and experiences — booking requires an approved account.
          </p>
        </div>
      )}

      {/* ── Venue grid ── */}
      <div className="px-4 pt-5 pb-28">
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredVenues.map(venue => (
              <FeaturedVenueCard
                key={venue.id}
                venue={venue}
                isFavorite={favoriteVenueIds.includes(venue.id)}
                onToggleFavorite={onToggleFavorite}
                onViewDetails={onViewVenueDetails}
                experiences={getVenueExperiences(venue)}
                isBooked={isBooked}
                isInCart={isInCart}
                isBookmarked={isBookmarked}
                canBook={canBook}
                onOpenBooking={handleOpenInstance}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
            <span className="text-5xl mb-4">🏛</span>
            <p className="font-semibold text-gray-500">No venues match your search.</p>
            <button onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
              className="mt-4 text-sm font-semibold hover:underline transition-colors" style={{ color: '#FFFFFF' }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};