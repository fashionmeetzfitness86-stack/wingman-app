
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
const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconBookmark = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
  'limited':   { label: 'Limited',    color: '#F59E0B', dot: '#F59E0B' },
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
  cancelMap: Record<string, boolean>;
  onAdminCancel?: (instanceId: string) => void;
  onAdminRestore?: (instanceId: string) => void;
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
      <div className="relative h-44 overflow-hidden">
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
              style={{ color: isBookmarked ? '#EC4899' : 'white' } as React.CSSProperties}
            />
          </button>
        </div>

        {/* Booked badge */}
        {isBooked && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#EC4899] rounded-full px-2.5 py-1 text-xs font-bold text-white">
            <IconCheck className="w-3.5 h-3.5" /> Booked
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base leading-tight mb-0.5 truncate">{instance.title}</h3>
        <p className="text-xs text-gray-500 mb-3 truncate">{instance.venue}</p>

        {/* Date + time row */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span>{formatEventDate(instance.date)}</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span>{instance.time}</span>
        </div>

        {/* Capacity bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <IconUsers className="w-3 h-3" />
              {spotsLeft > 0 ? `${spotsLeft} of ${instance.totalCapacity} spots left` : 'No spots left'}
            </span>
            <span className="text-xs font-bold" style={{ color: sc.color }}>{sc.label}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#22c55e'
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
                ? { background: 'rgba(236,72,153,0.12)', color: '#EC4899', border: '1px solid rgba(236,72,153,0.3)' }
                : instance.status === 'sold-out' || instance.status === 'cancelled'
                ? { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }
                : { background: '#EC4899', color: '#fff' }
            }
          >
            {isBooked ? 'View Booking' : instance.status === 'sold-out' ? 'Sold Out' : instance.status === 'cancelled' ? 'Cancelled' : 'Book Now'}
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
  isAdmin: boolean;
  onAdminCancel?: () => void;
  onAdminRestore?: () => void;
}> = ({ instance, currentUser, isBooked, existingBooking, onClose, onConfirm, isAdmin, onAdminCancel, onAdminRestore }) => {
  const [partySize, setPartySize] = useState(1);
  const [step, setStep] = useState<'detail' | 'confirm' | 'done'>(isBooked ? 'done' : 'detail');
  const [ruleError, setRuleError] = useState('');
  const tc = TYPE_CONFIG[instance.experienceType];
  const sc = STATUS_CONFIG[instance.status];
  const spotsLeft = instance.totalCapacity - instance.spotsBooked;

  const canBook = !isBooked && instance.status !== 'sold-out' && instance.status !== 'cancelled';
  const maxParty = Math.min(
    instance.bookingRules.maxPerBooking ?? spotsLeft,
    spotsLeft
  );

  const validateAndProceed = () => {
    const rules = instance.bookingRules;
    if (rules.minMenPerBooking && partySize < rules.minMenPerBooking) {
      setRuleError(`Minimum ${rules.minMenPerBooking} men required per booking for this event.`);
      return;
    }
    if (rules.maxPerBooking && partySize > rules.maxPerBooking) {
      setRuleError(`Maximum ${rules.maxPerBooking} people per booking for this event.`);
      return;
    }
    if (partySize > spotsLeft) {
      setRuleError(`Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining.`);
      return;
    }
    setRuleError('');
    setStep('confirm');
  };

  const handleConfirm = () => {
    onConfirm(partySize);
    setStep('done');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#111] rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.1)', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cover */}
        <div className="relative h-52">
          <img src={instance.coverImage} alt={instance.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <IconClose className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold mb-2"
              style={{ background: tc.bg, color: tc.color }}
            >
              {tc.icon} {tc.label}
            </div>
            <h2 className="text-xl font-black text-white leading-tight">{instance.title}</h2>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">📅 {formatEventDate(instance.date)}</span>
            <span className="flex items-center gap-1.5">🕐 {instance.time}</span>
            <span className="flex items-center gap-1.5">📍 {instance.venue}</span>
          </div>

          {/* Status + spots */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: sc.dot }} />
              <span className="font-semibold text-white">{sc.label}</span>
            </div>
            <span className="text-sm text-gray-400">
              {instance.spotsBooked}/{instance.totalCapacity} spots booked
            </span>
          </div>

          {/* Rules */}
          {(instance.bookingRules.minMenPerBooking || instance.bookingRules.maxPerBooking) && (
            <div className="rounded-xl px-4 py-3 text-xs text-gray-400 space-y-1"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-semibold text-gray-300 mb-1">Booking Rules</p>
              {instance.bookingRules.minMenPerBooking && (
                <p>• Minimum {instance.bookingRules.minMenPerBooking} men per booking</p>
              )}
              {instance.bookingRules.maxPerBooking && (
                <p>• Maximum {instance.bookingRules.maxPerBooking} people per booking</p>
              )}
            </div>
          )}

          {/* ── Step: Detail (select party size) ── */}
          {step === 'detail' && canBook && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Party Size</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPartySize(p => Math.max(1, p - 1))}
                    className="w-10 h-10 rounded-full bg-gray-800 text-white text-xl font-bold flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >−</button>
                  <span className="text-2xl font-black text-white w-8 text-center">{partySize}</span>
                  <button
                    onClick={() => setPartySize(p => Math.min(maxParty, p + 1))}
                    className="w-10 h-10 rounded-full bg-gray-800 text-white text-xl font-bold flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >+</button>
                  <span className="text-sm text-gray-500 ml-2">person{partySize !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-800">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-2xl font-black text-white">${(partySize * instance.pricePerPerson).toLocaleString()}</span>
              </div>

              {ruleError && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-sm text-red-300">
                  {ruleError}
                </div>
              )}

              <button
                onClick={validateAndProceed}
                className="w-full font-bold py-4 rounded-2xl text-white text-base transition-all active:scale-[0.98]"
                style={{ background: '#EC4899', boxShadow: '0 8px 24px rgba(236,72,153,0.25)' }}
              >
                Continue — ${(partySize * instance.pricePerPerson).toLocaleString()}
              </button>
            </div>
          )}

          {/* ── Step: Confirm ── */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="rounded-2xl p-4 space-y-2"
                style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.2)' }}>
                <p className="text-sm font-bold text-white mb-3">Booking Summary</p>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Event</span><span className="text-white font-medium truncate ml-4">{instance.title}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Date</span><span className="text-white">{formatEventDate(instance.date)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Time</span><span className="text-white">{instance.time}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Party</span><span className="text-white">{partySize} person{partySize !== 1 ? 's' : ''}</span></div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-800"><span className="text-gray-300 font-semibold">Total</span><span className="text-white font-black text-lg">${(partySize * instance.pricePerPerson).toLocaleString()}</span></div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('detail')}
                  className="flex-1 py-3 rounded-2xl bg-gray-800 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition-colors">
                  Back
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 py-3 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.98]"
                  style={{ background: '#EC4899' }}>
                  Confirm Booking
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Done ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center py-6 gap-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.12)' }}>
                <IconCheck className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="font-bold text-white text-lg mb-1">
                  {isBooked && step === 'done' && !existingBooking ? 'Booking Confirmed!' : 'You\'re already booked!'}
                </p>
                {existingBooking && (
                  <p className="text-sm text-gray-400">
                    {existingBooking.partySize} spot{existingBooking.partySize !== 1 ? 's' : ''} · ${existingBooking.totalPaid.toLocaleString()} paid
                  </p>
                )}
              </div>
              <button onClick={onClose}
                className="text-sm font-semibold text-white border border-gray-700 rounded-full px-6 py-2.5 hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          )}

          {/* Not bookable */}
          {!canBook && step !== 'done' && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                {instance.status === 'sold-out' ? 'This event is fully booked.' : 'This event was cancelled.'}
              </p>
            </div>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <div className="pt-3 border-t border-gray-800 flex items-center gap-2">
              <span className="text-xs text-gray-600 flex-1">Admin</span>
              {instance.status !== 'cancelled' ? (
                <button onClick={onAdminCancel}
                  className="text-xs text-red-400 border border-red-900/50 rounded-lg px-3 py-1.5 hover:bg-red-900/20 transition-colors">
                  Cancel Event
                </button>
              ) : (
                <button onClick={onAdminRestore}
                  className="text-xs text-green-400 border border-green-900/50 rounded-lg px-3 py-1.5 hover:bg-green-900/20 transition-colors">
                  Restore Event
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
  cancelMap,
  onAdminCancel,
  onAdminRestore,
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

  // ── Booking handler ──
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
    setSelected(null);
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
      <div className="sticky top-0 z-30 px-4 pt-5 pb-3"
        style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">
              Experiences
            </h1>
            <p className="text-xs text-gray-500">
              {filtered.length} upcoming · scroll to discover
            </p>
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-2 transition-colors"
            style={showFilters
              ? { background: '#EC4899', color: '#fff' }
              : { background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <IconFilter className="w-3.5 h-3.5" />
            Filter
            <IconChevron className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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
                className="flex-shrink-0 text-xs font-bold rounded-full px-3 py-1.5 transition-all"
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
              className="flex-shrink-0 text-xs font-bold rounded-full px-3 py-1.5 transition-all"
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
                className="flex-shrink-0 text-xs font-bold rounded-full px-3 py-1.5 transition-all"
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

      <div className="px-4 pt-5 pb-24 space-y-10">

        {/* ── Access notice ── */}
        {!canBook && !isAdmin && (
          <div className="rounded-2xl px-4 py-3 text-sm flex items-center gap-3"
            style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.2)' }}>
            <span className="text-xl">🔒</span>
            <p className="text-gray-300">
              <span className="font-bold text-[#EC4899]">Approved members only.</span> You can browse all events — booking requires an approved account and active membership.
            </p>
          </div>
        )}

        {/* ── Event grid ── */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">🗓</p>
            <p className="font-semibold">No events match your filters.</p>
            <button onClick={() => { setTypeFilter('All'); setDayFilter(null); }}
              className="mt-4 text-sm text-[#EC4899] hover:text-pink-300 transition-colors">
              Clear filters
            </button>
          </div>
        )}

        {/* ── Infinite scroll loader ── */}
        <div ref={loaderRef} className="flex justify-center py-4">
          {hasMore ? (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : visible.length > 0 ? (
            <p className="text-xs text-gray-700">You've seen all upcoming events</p>
          ) : null}
        </div>

        {/* ── Weekly Schedule View ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-black text-white">Weekly Schedule</h2>
            <span className="text-xs text-gray-600">Recurring every week</span>
          </div>
          <div className="space-y-3">
            {scheduleByDay.map(({ day, dayIndex, entries }) => {
              if (entries.length === 0) return null;
              const isToday = new Date().getDay() === dayIndex;
              return (
                <div key={day}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: isToday ? 'rgba(236,72,153,0.05)' : 'rgba(255,255,255,0.02)',
                    border: isToday ? '1px solid rgba(236,72,153,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest w-8">{day}</span>
                    {isToday && <span className="text-xs font-bold text-[#EC4899]">Today</span>}
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
                          <p className="text-xs font-bold text-white">{entry.time}</p>
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
          isAdmin={isAdmin}
          onAdminCancel={onAdminCancel ? () => { onAdminCancel(selected.instanceId); setSelected(null); } : undefined}
          onAdminRestore={onAdminRestore ? () => { onAdminRestore(selected.instanceId); setSelected(null); } : undefined}
        />
      )}
    </div>
  );
};
