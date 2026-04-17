
/**
 * EventDetailPage.tsx
 * ─────────────────────────────────────────────────────────────
 * High-conversion Event Detail Page for Wingman.
 * Drives the user from browsing → booking in a single scroll.
 *
 * Props surface mirrors WingmanEventFeed so it plugs into the
 * same onBook / bookedMap / instanceBookings state in App.tsx.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { User, UserRole, EventInstance, InstanceBooking, Page } from '../types';
import { formatEventDate, daysUntilLabel } from '../utils/eventSchedule';

// ─── ICONS (inline, no deps) ─────────────────────────────────

const IcoArrow = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const IcoCalendar = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IcoClock = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IcoPin = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IcoUsers = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IcoShield = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IcoStar = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IcoCheck = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IcoLock = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IcoMoon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const IcoFork = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v6a3 3 0 006 0V3M6 9v12M15 3a3 3 0 013 3v1a3 3 0 01-3 3h-1v7" />
  </svg>
);
const IcoAnchor = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.71.71m14.14 14.14.71.71M3 12H2m20 0h-1M4.22 19.78l.71-.71m14.14-14.14.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

// ─── TYPE CONFIG ─────────────────────────────────────────────

const TYPE_CFG = {
  Nightclub: {
    icon: <IcoMoon />,
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.15)',
    label: 'Nightclub',
    tagline: 'Curated nightlife access',
    expect: [
      { icon: '🍾', title: 'Hosted Table', desc: 'Premium reserved section with your Wingman host present all night.' },
      { icon: '🎶', title: 'Priority Entry', desc: 'Skip the line — direct access, no wait, no hassle.' },
      { icon: '👥', title: 'Curated Group', desc: 'Handpicked guests who match the vibe. No randomness.' },
    ],
  },
  Dinner: {
    icon: <IcoFork />,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    label: 'Private Dinner',
    tagline: 'Exclusive dining experience',
    expect: [
      { icon: '🕯️', title: 'Premium Venue', desc: "Reserved at Miami's most sought-after dining destinations." },
      { icon: '🥂', title: 'Curated Group', desc: 'Intimate setting with like-minded guests. Max 10 seats.' },
      { icon: '🍽️', title: 'Hosted Evening', desc: 'Your Wingman hosts the conversation, sets the tone.' },
    ],
  },
  Yacht: {
    icon: <IcoAnchor />,
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.15)',
    label: 'Yacht Experience',
    tagline: 'On-water luxury',
    expect: [
      { icon: '⛵', title: 'Private Charter', desc: 'Exclusive vessel, not shared with the public.' },
      { icon: '🌊', title: 'Biscayne Bay', desc: "Miami's most iconic waterway — skyline views guaranteed." },
      { icon: '🛥️', title: 'Full Amenities', desc: 'Music, drinks, and a curated group of 12 max.' },
    ],
  },
};

const STATUS_CFG = {
  available: { label: 'Available', color: '#22C55E', dot: '#22C55E', pulse: false },
  limited:   { label: 'Limited',   color: '#E040FB', dot: '#E040FB', pulse: true  },
  'sold-out':{ label: 'Sold Out',  color: '#EF4444', dot: '#EF4444', pulse: false },
  cancelled: { label: 'Cancelled', color: '#6B7280', dot: '#6B7280', pulse: false },
};

// ─── MOCK ATTENDEE AVATARS ───────────────────────────────────

const AVATARS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
];

// ─── PROPS ───────────────────────────────────────────────────

interface EventDetailPageProps {
  instance: EventInstance;
  currentUser: User;
  bookedMap: Record<string, number>;
  instanceBookings: InstanceBooking[];
  onNavigate: (page: Page) => void;
  onBook: (booking: Omit<InstanceBooking, 'id' | 'bookedAt'>) => void;
  onNavigateToPlans: () => void;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  instance,
  currentUser,
  instanceBookings,
  onNavigate,
  onBook,
  onNavigateToPlans,
}) => {
  const [partySize, setPartySize] = useState(1);
  const [ruleError, setRuleError] = useState('');
  const [booked, setBooked] = useState(false);

  const tc = TYPE_CFG[instance.experienceType];
  const sc = STATUS_CFG[instance.status];

  const spotsLeft = instance.totalCapacity - instance.spotsBooked;
  const pct = Math.round((instance.spotsBooked / instance.totalCapacity) * 100);
  const maxParty = Math.min(instance.bookingRules.maxPerBooking ?? spotsLeft, spotsLeft);

  const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.WINGMAN;
  const isApproved = currentUser.approvalStatus === 'approved';
  const hasActiveSub = currentUser.subscriptionStatus === 'active';
  const canBook = isAdmin || (isApproved && hasActiveSub);

  const existingBooking = useMemo(
    () => instanceBookings.find(b => b.instanceId === instance.instanceId && b.userId === currentUser.id),
    [instanceBookings, instance.instanceId, currentUser.id],
  );
  const isBooked = !!existingBooking || booked;

  // Attendee count for social proof
  const confirmedCount = instance.spotsBooked;
  const shownAvatars = AVATARS.slice(0, Math.min(confirmedCount, 5));

  const handleReserve = useCallback(() => {
    const rules = instance.bookingRules;
    if (rules.minMenPerBooking && partySize < rules.minMenPerBooking) {
      setRuleError(`Minimum ${rules.minMenPerBooking} men required per booking.`);
      return;
    }
    if (rules.maxPerBooking && partySize > rules.maxPerBooking) {
      setRuleError(`Max ${rules.maxPerBooking} people per booking.`);
      return;
    }
    if (partySize > spotsLeft) {
      setRuleError(`Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining.`);
      return;
    }
    setRuleError('');
    setBooked(true);
    onBook({
      instanceId: instance.instanceId,
      userId: currentUser.id,
      partySize,
      totalPaid: partySize * instance.pricePerPerson,
      guestName: currentUser.name,
      guestEmail: currentUser.email ?? '',
    });
  }, [instance, partySize, spotsLeft, currentUser, onBook]);

  const urgencyLabel = spotsLeft <= 2
    ? `⚠️ Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`
    : spotsLeft <= Math.ceil(instance.totalCapacity * 0.4)
    ? `🔥 Filling fast — ${spotsLeft} spots left`
    : `${spotsLeft} of ${instance.totalCapacity} spots available`;

  return (
    <div className="min-h-screen pb-32 animate-fade-in" style={{ background: '#0a0a0a', color: '#fff' }}>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: '55vh', minHeight: 340, maxHeight: 520 }}>
        <img
          src={instance.coverImage}
          alt={instance.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(10,10,10,0.92) 85%, #0a0a0a 100%)',
        }} />

        {/* Back button */}
        <button
          onClick={() => onNavigate('eventTimeline')}
          className="absolute top-4 left-4 flex items-center gap-1.5 font-semibold text-sm text-white py-2 px-3 rounded-full backdrop-blur-sm transition-all active:scale-95"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <IcoArrow />
          Feed
        </button>

        {/* Days-until pill */}
        <div className="absolute top-4 right-4">
          <span
            className="text-xs font-black px-3 py-1.5 rounded-full"
            style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.color}40` }}
          >
            {daysUntilLabel(instance.date)}
          </span>
        </div>

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          {/* Type badge */}
          <div className="flex items-center gap-1.5 mb-3">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.color}30` }}
            >
              {tc.icon} {tc.label}
            </div>
            {/* Status pill */}
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${sc.dot}40`, color: sc.color }}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.pulse ? 'animate-pulse' : ''}`}
                style={{ background: sc.dot }} />
              {sc.label}
            </div>
          </div>

          <h1 className="text-2xl font-black leading-tight text-white mb-1">
            {instance.title}
          </h1>
          <p className="text-sm text-gray-400">{tc.tagline}</p>
        </div>
      </div>

      {/* ─── BODY ────────────────────────────────────────────── */}
      <div className="px-5 pt-5 space-y-6 max-w-lg mx-auto">

        {/* KEY INFO CARDS */}
        <div className="grid grid-cols-3 gap-2">
          {/* Date */}
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex justify-center mb-1 text-gray-400"><IcoCalendar /></div>
            <p className="text-xs text-gray-500 mb-0.5">Date</p>
            <p className="text-xs font-black text-white leading-tight">{formatEventDate(instance.date)}</p>
          </div>
          {/* Time */}
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex justify-center mb-1 text-gray-400"><IcoClock /></div>
            <p className="text-xs text-gray-500 mb-0.5">Time</p>
            <p className="text-xs font-black text-white">{instance.time}</p>
          </div>
          {/* Price */}
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex justify-center mb-1" style={{ color: '#E040FB' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Per Person</p>
            <p className="text-xs font-black text-white">${instance.pricePerPerson.toLocaleString()}</p>
          </div>
        </div>

        {/* LOCATION */}
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="mt-0.5 flex-shrink-0" style={{ color: tc.color }}><IcoPin /></div>
          <div>
            <p className="text-sm font-bold text-white">{instance.venue}</p>
            <p className="text-xs text-gray-500 mt-0.5">{instance.address}</p>
          </div>
        </div>

        {/* CAPACITY METER */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div style={{ color: '#E040FB' }}><IcoUsers /></div>
              <span className="text-sm font-bold text-white">Capacity</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: sc.color }}>{urgencyLabel}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 70 ? 'linear-gradient(90deg, #E040FB, #EF4444)' : 'linear-gradient(90deg, #E040FB, #7B61FF)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-600">{instance.spotsBooked} reserved</span>
            <span className="text-xs text-gray-600">{instance.totalCapacity} total</span>
          </div>
        </div>

        {/* SOCIAL PROOF */}
        {confirmedCount > 0 && (
          <div className="flex items-center gap-3 py-1">
            <div className="flex">
              {shownAvatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border-2"
                  style={{ borderColor: '#0a0a0a', marginLeft: i > 0 ? -10 : 0 }}
                />
              ))}
              {confirmedCount > 5 && (
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                  style={{ borderColor: '#0a0a0a', marginLeft: -10, background: 'rgba(224,64,251,0.3)' }}>
                  +{confirmedCount - 5}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">{confirmedCount} {confirmedCount === 1 ? 'person' : 'people'}</span> already joined
            </p>
            <div className="flex items-center gap-1 ml-auto">
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ color: '#F59E0B' }}><IcoStar /></div>
              ))}
            </div>
          </div>
        )}

        {/* WHAT TO EXPECT ─────────────────────────────────── */}
        <div>
          <h2 className="text-base font-black text-white mb-3">What to Expect</h2>
          <div className="space-y-2.5">
            {tc.expect.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOOKING RULES */}
        {(instance.bookingRules.minMenPerBooking || instance.bookingRules.maxPerBooking) && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(224,64,251,0.05)', border: '1px solid rgba(224,64,251,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ color: '#E040FB' }}><IcoShield /></div>
              <p className="text-sm font-bold text-white">Booking Rules</p>
            </div>
            <div className="space-y-1">
              {instance.bookingRules.minMenPerBooking && (
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span style={{ color: '#E040FB' }}>•</span>
                  Minimum {instance.bookingRules.minMenPerBooking} men required per booking
                </p>
              )}
              {instance.bookingRules.maxPerBooking && (
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span style={{ color: '#E040FB' }}>•</span>
                  Maximum {instance.bookingRules.maxPerBooking} {instance.bookingRules.maxPerBooking === 1 ? 'person' : 'people'} per booking
                </p>
              )}
            </div>
          </div>
        )}

        {/* TRUST SIGNALS */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: '🔒', label: 'Secure Payment' },
            { icon: '✅', label: 'Vetted Members' },
            { icon: '⚡', label: 'Instant Confirm' },
          ].map((t, i) => (
            <div key={i} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xl mb-1">{t.icon}</div>
              <p className="text-xs text-gray-500 font-medium">{t.label}</p>
            </div>
          ))}
        </div>

        {/* SPACER for sticky CTA */}
        <div className="h-4" />
      </div>

      {/* ─── STICKY BOTTOM CTA ───────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-6 pt-3"
        style={{
          background: 'linear-gradient(to top, #0a0a0a 60%, rgba(10,10,10,0.95) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as React.CSSProperties}
      >
        <div className="max-w-lg mx-auto">

          {/* ── ALREADY BOOKED STATE ── */}
          {isBooked && (
            <div className="space-y-3">
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.2)' }}>
                  <div style={{ color: '#22C55E' }}><IcoCheck /></div>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Spot Reserved 🎉</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {existingBooking
                      ? `${existingBooking.partySize} spot${existingBooking.partySize !== 1 ? 's' : ''} · $${existingBooking.totalPaid.toLocaleString()} confirmed`
                      : 'Added to cart — complete payment in My Plans'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { onNavigateToPlans(); }}
                className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-[0.98] hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: '0 8px 32px rgba(224,64,251,0.3)' }}
              >
                View in My Plans →
              </button>
            </div>
          )}

          {/* ── BOOKING FORM ── */}
          {!isBooked && instance.status !== 'sold-out' && instance.status !== 'cancelled' && canBook && (
            <div className="space-y-3">
              {/* Party size + price row */}
              <div className="flex items-center gap-3">
                {/* Party size stepper */}
                <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button
                    onClick={() => setPartySize(p => Math.max(1, p - 1))}
                    className="w-7 h-7 rounded-full bg-black/40 text-white text-lg font-bold flex items-center justify-center hover:bg-black/60 transition-colors active:scale-95"
                  >−</button>
                  <span className="text-base font-black text-white w-5 text-center">{partySize}</span>
                  <button
                    onClick={() => setPartySize(p => Math.min(maxParty, p + 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition-colors active:scale-95"
                    style={{ background: 'rgba(224,64,251,0.3)', color: '#E040FB' }}
                  >+</button>
                </div>

                {/* CTA button */}
                <button
                  onClick={handleReserve}
                  className="flex-1 py-3.5 rounded-2xl font-black text-white text-base transition-all active:scale-[0.97] hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: '0 8px 32px rgba(224,64,251,0.3)' }}
                >
                  Join Experience · ${(partySize * instance.pricePerPerson).toLocaleString()}
                </button>
              </div>

              {/* Spots reminder */}
              <p className="text-center text-xs text-gray-600">
                {spotsLeft <= 3
                  ? <span style={{ color: '#E040FB' }} className="font-bold">⚠️ {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left — books instantly</span>
                  : `${spotsLeft} spots remaining · Payment at checkout`}
              </p>

              {/* Rule error */}
              {ruleError && (
                <div className="rounded-xl px-3 py-2 text-xs text-red-300 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {ruleError}
                </div>
              )}
            </div>
          )}

          {/* ── SOLD OUT ── */}
          {!isBooked && instance.status === 'sold-out' && (
            <button
              disabled
              className="w-full py-4 rounded-2xl font-black text-gray-500 text-base cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Sold Out
            </button>
          )}

          {/* ── CANCELLED ── */}
          {!isBooked && instance.status === 'cancelled' && (
            <button
              disabled
              className="w-full py-4 rounded-2xl font-black text-gray-600 text-base cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Event Cancelled
            </button>
          )}

          {/* ── NOT APPROVED / NO SUBSCRIPTION ── */}
          {!isBooked && !canBook && instance.status !== 'sold-out' && instance.status !== 'cancelled' && (
            <div className="space-y-2">
              <button
                disabled
                className="w-full py-4 rounded-2xl font-black text-gray-500 text-base cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <IcoLock />
                Members Only
              </button>
              <p className="text-center text-xs text-gray-600">
                {!isApproved ? 'Apply for access to join Wingman experiences' : 'An active subscription is required to book'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
