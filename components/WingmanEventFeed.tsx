
/**
 * WingmanEventFeed.tsx
 * ─────────────────────────────────────────────────────────────
 * Infinite-scroll event feed for the Wingman platform.
 * Replaces the old ExclusiveExperiencesPage for the 'exclusiveExperiences' route.
 *
 * Features:
 *  - Auto-generated weekly recurring instances (4 weeks)
 *  - Filter bar: All / Nightclub / Dinner / Yacht + day-of-week
 *  - Infinite scroll (loads 8 cards at a time)
 *  - Booking modal with capacity + rule enforcement
 *  - Real-time spot count updates
 *  - Admin cancel / management
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { User, UserRole, EventInstance, InstanceBooking, ExperienceType } from '../types';
import { generateEventFeed, WEEKLY_SCHEDULE, formatEventDate, daysUntilLabel, computeStatus } from '../utils/eventSchedule';

// ─── ICONS (inline SVG — no new icon files needed) ───────────

const IconAnchor = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.71.71m14.14 14.14.71.71M3 12H2m20 0h-1M4.22 19.78l.71-.71m14.14-14.14.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);
const IconMoon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const IconFork = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v6a3 3 0 006 0V3M6 9v12M15 3a3 3 0 013 3v1a3 3 0 01-3 3h-1v7" />
  </svg>
);
const IconClose = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconChevron = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const IconFilter = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
  </svg>
);
const IconUsers = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconCheck = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconBookmark = ({ className, filled, style }: { className?: string; filled?: boolean; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

// ─── TYPE-SPECIFIC CONFIG ─────────────────────────────────────

const TYPE_CONFIG: Record<ExperienceType, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  Nightclub: { icon: <IconMoon className="w-3.5 h-3.5" />, color: '#A855F7', bg: 'rgba(168,85,247,0.12)', label: 'Nightclub' },
  Dinner:    { icon: <IconFork className="w-3.5 h-3.5" />, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  label: 'Dinner'    },
  Yacht:     { icon: <IconAnchor className="w-3.5 h-3.5" />, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)', label: 'Yacht'   },
};

const STATUS_CONFIG = {
  'available': { label: 'Available',  color: '#22c55e', dot: '#22c55e' },
  'limited':   { label: 'Limited',    color: '#E040FB', dot: '#E040FB' },
  'sold-out':  { label: 'Sold Out',   color: '#EF4444', dot: '#EF4444' },
  'cancelled': { label: 'Cancelled',  color: '#6B7280', dot: '#6B7280' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PAGE_SIZE = 8;

// ─── PROPS ───────────────────────────────────────────────────

interface WingmanEventFeedProps {
  currentUser: User;
  bookedMap: Record<string, number>;
  instanceBookings: InstanceBooking[];
  bookmarkedInstanceIds: string[];
  onToggleBookmark: (instanceId: string) => void;
  onBook: (booking: Omit<InstanceBooking, 'id' | 'bookedAt'>) => void;
  onNavigateToPlans?: () => void;
  onViewDetail?: (instance: EventInstance) => void;
  cancelMap: Record<string, boolean>;
  onAdminCancel?: (instanceId: string) => void;
  onAdminRestore?: (instanceId: string) => void;
  onAdminForceSoldOut?: (instanceId: string) => void;
}

// ─── EVENT CARD ───────────────────────────────────────────────

const EventCard: React.FC<{
  instance: EventInstance;
  onOpen: () => void;
  isBooked: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
}> = ({ instance, onOpen, isBooked, isBookmarked, onToggleBookmark }) => {
  const tc = TYPE_CONFIG[instance.experienceType];
  const sc = STATUS_CONFIG[instance.status];
  const spotsLeft = instance.totalCapacity - instance.spotsBooked;
  const pct = (instance.spotsBooked / instance.totalCapacity) * 100;

  return (
    <div
      onClick={onOpen}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.015] active:scale-[0.99]"
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
      aria-label={`View ${instance.title}`}
    >
      {/* Cover image */}
      <div className="relative h-36 sm:h-40 overflow-hidden">
        <img
          src={instance.coverImage}
          alt={instance.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)' }} />

        {/* Type badge — top left */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
          style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.color}30` }}
        >
          {tc.icon} {tc.label}
        </div>

        {/* Day label — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="text-xs font-bold text-white bg-black/50 rounded-full px-2.5 py-1">
            {daysUntilLabel(instance.date)}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onToggleBookmark(e); }}
            className="p-1.5 rounded-full transition-colors"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            aria-label={isBookmarked ? 'Remove from watchlist' : 'Save to watchlist'}
          >
            <IconBookmark className="w-4 h-4" filled={isBookmarked}
              style={{ color: isBookmarked ? '#E040FB' : 'rgba(255,255,255,0.7)' } as React.CSSProperties}
            />
          </button>
        </div>

        {/* Booked badge */}
        {isBooked && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF)' }}
          >
            <IconCheck className="w-3.5 h-3.5" /> Booked
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-white text-base leading-tight mb-0.5 truncate">{instance.title}</h3>
        <p className="text-xs text-gray-500 mb-2 truncate">{instance.venue}</p>

        {/* Date + time row */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>{formatEventDate(instance.date)}</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span>{instance.arrivalTime || instance.time}</span>
        </div>

        {/* Capacity bar + urgency label */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs flex items-center gap-1" style={{
              color: spotsLeft <= 1 ? '#EF4444' : spotsLeft <= 2 ? '#E040FB' : spotsLeft <= 5 ? '#F59E0B' : '#6B7280',
              fontWeight: spotsLeft <= 2 ? 700 : 400,
            }}>
              <IconUsers className="w-3 h-3" />
              {spotsLeft <= 0
                ? 'No spots left'
                : spotsLeft === 1
                ? '🔴 1 spot left!'
                : spotsLeft === 2
                ? '⚡ 2 spots left'
                : spotsLeft <= 5
                ? `${spotsLeft} spots left`
                : `${spotsLeft} of ${instance.totalCapacity} spots`}
            </span>
            <span className="text-xs font-bold" style={{ color: sc.color }}>{sc.label}</span>
          </div>
          <div className="h-1 rounded-full bg-gray-800/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? '#EF4444' : pct >= 90 ? '#EF4444' : pct >= 70 ? '#E040FB' : '#22c55e'
              }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-white">${instance.pricePerPerson.toLocaleString()}</span>
            <span className="text-xs text-gray-500"> / person</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onOpen(); }}
            className="text-xs font-bold rounded-full px-4 py-2 transition-all"
            style={
              isBooked
                ? { background: 'rgba(224,64,251,0.12)', color: '#E040FB', border: '1px solid rgba(224,64,251,0.3)' }
                : instance.status === 'sold-out' || instance.status === 'cancelled'
                ? { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)', cursor: 'default' }
                : { background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', color: '#fff', boxShadow: '0 4px 12px rgba(224,64,251,0.25)' }
            }
          >
            {isBooked ? 'View Booking' : instance.status === 'sold-out' ? 'Sold Out' : instance.status === 'cancelled' ? 'Cancelled' : 'Reserve Spot'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── BOOKING MODAL ────────────────────────────────────────────

const BookingModal: React.FC<{
  instance: EventInstance;
  currentUser: User;
  isBooked: boolean;
  existingBooking?: InstanceBooking;
  onClose: () => void;
  onConfirm: (partySize: number) => void;
  onNavigateToPlans?: () => void;
  onViewDetail?: () => void;
  isAdmin: boolean;
  onAdminCancel?: () => void;
  onAdminRestore?: () => void;
  onAdminForceSoldOut?: () => void;
}> = ({ instance, isBooked, existingBooking, onClose, onConfirm, onNavigateToPlans, onViewDetail, isAdmin, onAdminCancel, onAdminRestore, onAdminForceSoldOut }) => {
  const [partySize, setPartySize] = useState(1);
  const [ruleError, setRuleError] = useState('');
  const tc = TYPE_CONFIG[instance.experienceType];
  const sc = STATUS_CONFIG[instance.status];
  const spotsLeft = instance.totalCapacity - instance.spotsBooked;

  const canBook = !isBooked && instance.status !== 'sold-out' && instance.status !== 'cancelled';
  const maxParty = Math.min(
    instance.bookingRules.maxPerBooking ?? spotsLeft,
    spotsLeft
  );

  const handleAddToCart = () => {
    const rules = instance.bookingRules;
    if (rules.maxPerBooking && partySize > rules.maxPerBooking) {
      setRuleError(`Maximum ${rules.maxPerBooking} people per booking for this event.`);
      return;
    }
    if (partySize > spotsLeft) {
      setRuleError(`Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining.`);
      return;
    }
    setRuleError('');
    onConfirm(partySize);
    onClose();
    if (onNavigateToPlans) onNavigateToPlans();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } as React.CSSProperties}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          background: '#161616',
          border: '1px solid rgba(255,255,255,0.12)',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 -8px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cover */}
        <div className="relative h-32 sm:h-40">
          <img src={instance.coverImage} alt={instance.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-white"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <IconClose className="w-4 h-4" />
          </button>
          {/* Full Details link */}
          {onViewDetail && (
            <button
              onClick={() => { onClose(); onViewDetail(); }}
              className="absolute top-3 left-3 text-[10px] font-bold text-white/70 hover:text-white flex items-center gap-1 transition-colors"
              style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '999px', padding: '4px 8px' }}
            >
              Details →
            </button>
          )}
          <div className="absolute bottom-3 left-4">
            <div
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold mb-1"
              style={{ background: tc.bg, color: tc.color }}
            >
              {tc.icon} {tc.label}
            </div>
            <h2 className="text-lg font-black text-white leading-tight">{instance.title}</h2>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Meta row */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">📅 {formatEventDate(instance.date)}</span>
            <span className="flex items-center gap-1">🕐 {instance.arrivalTime || instance.time}</span>
            <span className="flex items-center gap-1">📍 {instance.venue}</span>
          </div>

          {/* Status + spots */}
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
              <span className="font-semibold text-white">{sc.label}</span>
            </div>
            <span className="text-[11px] text-gray-400">
              {spotsLeft} left
            </span>
          </div>

          {/* Booking Rules */}
          {(instance.bookingRules.maxPerBooking) && (
            <div className="rounded-xl px-3 py-2 text-[10px] text-gray-400"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-semibold text-gray-300">Max {instance.bookingRules.maxPerBooking} per booking</p>
            </div>
          )}

          {/* ── Already booked ── */}
          {isBooked && (
            <div className="flex flex-col items-center py-2 gap-3 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(224,64,251,0.12)' }}>
                <div style={{ color: '#E040FB' }}>
                  <IconCheck className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="font-bold text-white text-sm mb-0.5">You're In! 🎉</p>
                <p className="text-[11px] text-gray-400">
                  {existingBooking
                    ? `${existingBooking.partySize} spot${existingBooking.partySize !== 1 ? 's' : ''} · $${existingBooking.totalPaid.toLocaleString()}`
                    : 'Your spot is reserved.'}
                </p>
              </div>
              {onNavigateToPlans && (
                <button
                  onClick={() => { onClose(); onNavigateToPlans(); }}
                  className="w-full font-bold py-3 rounded-xl text-white text-xs transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: '0 8px 24px rgba(224,64,251,0.25)' }}
                >
                  View My Plans →
                </button>
              )}
            </div>
          )}

          {/* ── Booking form ── */}
          {!isBooked && canBook && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-2">Party Size</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPartySize(p => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-full bg-gray-800 text-white text-lg font-bold flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >−</button>
                  <span className="text-xl font-black text-white w-6 text-center">{partySize}</span>
                  <button
                    onClick={() => setPartySize(p => Math.min(maxParty, p + 1))}
                    className="w-8 h-8 rounded-full bg-gray-800 text-white text-lg font-bold flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-800">
                <span className="text-gray-400 text-[11px]">Total</span>
                <span className="text-lg font-black text-white">${(partySize * instance.pricePerPerson).toLocaleString()}</span>
              </div>

              {ruleError && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2 text-[11px] text-red-300">
                  {ruleError}
                </div>
              )}

              <button
                onClick={handleAddToCart}
                className="w-full font-bold py-3 rounded-xl text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: '0 8px 24px rgba(224,64,251,0.25)' }}
              >
                Reserve — ${(partySize * instance.pricePerPerson).toLocaleString()}
              </button>
            </div>
          )}

          {/* ── Not bookable ── */}
          {!isBooked && !canBook && (
            <div className="text-center py-2">
              <p className="text-gray-500 text-[11px]">
                {instance.status === 'sold-out'
                  ? 'This event is fully booked.'
                  : instance.status === 'cancelled'
                  ? 'This event was cancelled.'
                  : 'Booking requires an approved active membership.'}
              </p>
            </div>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <div className="pt-2 border-t border-gray-800 flex items-center gap-2">
              <span className="text-[9px] text-gray-600 flex-1">Admin</span>
              {instance.status !== 'sold-out' && onAdminForceSoldOut && (
                  <button onClick={() => { onAdminForceSoldOut(); onClose(); }} className="text-[9px] text-pink-400 border border-pink-900/50 rounded px-1.5 py-1 hover:bg-pink-900/20 transition-colors">
                    Sold Out
                  </button>
              )}
              {instance.status !== 'cancelled' ? (
                <button onClick={() => { if(onAdminCancel) onAdminCancel(); onClose(); }}
                  className="text-[9px] text-red-400 border border-red-900/50 rounded px-1.5 py-1 hover:bg-red-900/20 transition-colors">
                  Cancel
                </button>
              ) : (
                <button onClick={() => { if(onAdminRestore) onAdminRestore(); onClose(); }}
                  className="text-[9px] text-green-400 border border-green-900/50 rounded px-1.5 py-1 hover:bg-green-900/20 transition-colors">
                  Restore
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN FEED ────────────────────────────────────────────────

export const WingmanEventFeed: React.FC<WingmanEventFeedProps> = ({
  currentUser,
  bookedMap,
  instanceBookings,
  bookmarkedInstanceIds,
  onToggleBookmark,
  onBook,
  onNavigateToPlans,
  onViewDetail,
  cancelMap,
  onAdminCancel,
  onAdminRestore,
  onAdminForceSoldOut,
}) => {
  const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.WINGMAN;
  const isApproved = currentUser.approvalStatus === 'approved';
  const hasActiveSub = currentUser.subscriptionStatus === 'active';
  const canBook = isAdmin || (isApproved && hasActiveSub);

  // ── Filters ──
  const [typeFilter, setTypeFilter] = useState<ExperienceType | 'All'>('All');
  const [dayFilter, setDayFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── Pagination ──
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  // ── Modal ──
  const [selected, setSelected] = useState<EventInstance | null>(null);

  // ── Generate feed ──
  const allInstances = useMemo(
    () => generateEventFeed(bookedMap, cancelMap, 4),
    [bookedMap, cancelMap],
  );

  // ── Filter ──
  const filtered = useMemo(() => {
    let out = allInstances;
    if (typeFilter !== 'All') out = out.filter(i => i.experienceType === typeFilter);
    if (dayFilter !== null) out = out.filter(i => new Date(i.date + 'T00:00:00').getDay() === dayFilter);
    return out;
  }, [allInstances, typeFilter, dayFilter]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  // ── Infinite scroll observer ──
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(p => p + 1);
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [typeFilter, dayFilter]);

  // ── Booking handler — called by modal, modal handles close + navigation ──
  const handleBook = useCallback((partySize: number) => {
    if (!selected) return;
    onBook({
      instanceId: selected.instanceId,
      userId: currentUser.id,
      partySize,
      totalPaid: partySize * selected.pricePerPerson,
      guestName: currentUser.name,
      guestEmail: currentUser.email,
    });
  }, [selected, currentUser, onBook]);

  const getUserBooking = (instance: EventInstance) =>
    instanceBookings.find(b => b.instanceId === instance.instanceId && b.userId === currentUser.id);

  // ── Schedule overview data ──
  const activeSchedule = WEEKLY_SCHEDULE.filter(s => s.isActive);
  const scheduleByDay = DAYS.map((d, i) => ({
    day: d,
    dayIndex: i,
    entries: activeSchedule.filter(s => s.dayOfWeek === i),
  }));

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'transparent' }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 px-4 pt-4 pb-2"
        style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black text-white leading-tight">
              Experiences
            </h1>
            <p className="text-[10px] text-gray-500">
              {filtered.length} upcoming
            </p>
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-3 py-1.5 transition-colors"
            style={showFilters
              ? { background: '#EC4899', color: '#fff' }
              : { background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <IconFilter className="w-3 h-3" />
            Filter
          </button>
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['All', 'Nightclub', 'Dinner', 'Yacht'] as const).map(t => {
            const active = typeFilter === t;
            const cfg = t !== 'All' ? TYPE_CONFIG[t] : null;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="flex-shrink-0 text-[10px] font-bold rounded-full px-3 py-1 transition-all"
                style={active
                  ? { background: cfg?.color ?? '#EC4899', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Day filter — expanded */}
        {showFilters && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none animate-fade-in">
            <button
              onClick={() => setDayFilter(null)}
              className="flex-shrink-0 text-[10px] font-bold rounded-full px-3 py-1 transition-all"
              style={dayFilter === null
                ? { background: '#EC4899', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              All days
            </button>
            {DAYS.map((d, i) => (
              <button
                key={d}
                onClick={() => setDayFilter(dayFilter === i ? null : i)}
                className="flex-shrink-0 text-[10px] font-bold rounded-full px-3 py-1 transition-all"
                style={dayFilter === i
                  ? { background: '#EC4899', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 pb-20 space-y-8">

        {/* ── Access notice ── */}
        {!canBook && !isAdmin && (
          <div className="rounded-xl px-3 py-2 text-[11px] flex items-center gap-2"
            style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.2)' }}>
            <span>🔒</span>
            <p className="text-gray-300">
              <span className="font-bold text-purple-400">Approved members only.</span>
            </p>
          </div>
        )}

        {/* ── Event grid ── */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {visible.map(instance => (
              <EventCard
                key={instance.instanceId}
                instance={instance}
                onOpen={() => setSelected(instance)}
                isBooked={!!getUserBooking(instance)}
                isBookmarked={bookmarkedInstanceIds.includes(instance.instanceId)}
                onToggleBookmark={() => onToggleBookmark(instance.instanceId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-3xl mb-2">🗓</p>
            <p className="text-xs font-semibold">No events match your filters.</p>
          </div>
        )}

        {/* ── Infinite scroll loader ── */}
        <div ref={loaderRef} className="flex justify-center py-2">
          {hasMore ? (
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
              <div className="w-1 h-1 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : visible.length > 0 ? (
            <p className="text-[10px] text-gray-700">You've seen all events</p>
          ) : null}
        </div>

        {/* ── Weekly Schedule View ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-black text-white">Weekly Schedule</h2>
          </div>
          <div className="space-y-2">
            {scheduleByDay.map(({ day, dayIndex, entries }) => {
              if (entries.length === 0) return null;
              const isToday = new Date().getDay() === dayIndex;
              return (
                <div key={day}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: isToday ? 'rgba(236,72,153,0.05)' : 'rgba(255,255,255,0.02)',
                    border: isToday ? '1px solid rgba(236,72,153,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest w-8">{day}</span>
                    {isToday && <span className="text-xs font-bold text-purple-400">Today</span>}
                  </div>
                  {entries.map(entry => {
                    const tc2 = TYPE_CONFIG[entry.experienceType];
                    return (
                      <div key={entry.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tc2.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{entry.title}</p>
                          <p className="text-xs text-gray-500 truncate">{entry.venue}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-white">{entry.arrivalTime || entry.time}</p>
                          <p className="text-xs text-gray-600">${entry.pricePerPerson}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Booking Modal ── */}
      {selected && (
        <BookingModal
          instance={selected}
          currentUser={currentUser}
          isBooked={!!getUserBooking(selected)}
          existingBooking={getUserBooking(selected)}
          onClose={() => setSelected(null)}
          onConfirm={canBook ? handleBook : () => {}}
          onNavigateToPlans={onNavigateToPlans}
          onViewDetail={onViewDetail ? () => onViewDetail(selected) : undefined}
          isAdmin={isAdmin}
          onAdminCancel={onAdminCancel ? () => { onAdminCancel(selected.instanceId); setSelected(null); } : undefined}
          onAdminRestore={onAdminRestore ? () => { onAdminRestore(selected.instanceId); setSelected(null); } : undefined}
          onAdminForceSoldOut={onAdminForceSoldOut ? () => { onAdminForceSoldOut(selected.instanceId); setSelected(null); } : undefined}
        />
      )}
    </div>
  );
};
