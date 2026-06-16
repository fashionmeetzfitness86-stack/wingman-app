
/**
 * ReserveSpotModal.tsx
 * ─────────────────────────────────────────────────────────────
 * Reusable booking modal for WingmanEventFeed and FeaturedVenuesPage.
 *
 * Behaviour:
 *  - Desktop/tablet : centered (items-center)
 *  - Mobile         : bottom-sheet (items-end)
 *  - max-h-[90vh] with internal overflow-y-auto
 *  - Sticky "Reserve Spot" CTA — always reachable
 *  - Hides bottom nav + FAB while open (z-index + pointer-events)
 *  - ESC key, backdrop click, and X button all close reliably
 *  - Body scroll locked while open — unlocked on close
 *  - Rendered via ReactDOM.createPortal at document.body
 */

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { EventInstance, InstanceBooking, User, UserRole } from '../types';
import { formatEventDate, daysUntilLabel } from '../utils/eventSchedule';

// ─── ICONS ────────────────────────────────────────────────────

const IcoClose = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IcoUsers = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IcoCheck = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IcoLock = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

// ─── TYPE / STATUS CONFIGS ─────────────────────────────────────

const TYPE_CFG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  Nightclub: { label: 'Nightclub',       icon: '🌙', color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' },
  Dinner:    { label: 'Private Dinner',  icon: '🍽️', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)'  },
  Yacht:     { label: 'Yacht',           icon: '⚓',  color: '#06B6D4', bg: 'rgba(6,182,212,0.15)'   },
};

const STATUS_CFG: Record<string, { label: string; dot: string }> = {
  available: { label: 'Available', dot: '#22C55E' },
  limited:   { label: 'Limited',   dot: '#FFFFFF' },
  'sold-out':{ label: 'Sold Out',  dot: '#EF4444' },
  cancelled: { label: 'Cancelled', dot: '#6B7280' },
};

// ─── PROPS ────────────────────────────────────────────────────

export interface ReserveSpotModalProps {
  event: EventInstance;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Omit<InstanceBooking, 'id' | 'bookedAt'>) => void;
  currentUser: User;
  canBook: boolean;
  existingBooking?: InstanceBooking;
  onNavigateToPlans?: () => void;
  onViewFullDetail?: () => void;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────

export const ReserveSpotModal: React.FC<ReserveSpotModalProps> = ({
  event,
  isOpen,
  onClose,
  onConfirm,
  currentUser,
  canBook,
  existingBooking,
  onNavigateToPlans,
  onViewFullDetail,
}) => {
  // ── Hooks — MUST be called unconditionally (React rules) ─────
  const [partySize, setPartySize] = useState(1);
  const [ruleError, setRuleError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Body scroll lock + hide bottom nav
  useEffect(() => {
    if (!isOpen || !event) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const nav = document.querySelector<HTMLElement>('nav[aria-label="Wingman Navigation"]');
    if (nav) {
      nav.dataset.prevZ = nav.style.zIndex;
      nav.style.zIndex = '-1';
      nav.style.pointerEvents = 'none';
      nav.style.visibility = 'hidden';
    }
    return () => {
      document.body.style.overflow = prev;
      if (nav) {
        nav.style.zIndex        = nav.dataset.prevZ ?? '';
        nav.style.pointerEvents = '';
        nav.style.visibility    = '';
        delete nav.dataset.prevZ;
      }
    };
  }, [isOpen, event]);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Reset form when a new event opens
  useEffect(() => {
    if (isOpen && event) { setPartySize(1); setRuleError(''); setConfirmed(false); }
  }, [isOpen, event?.instanceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reserve action — reads event at call-time, safe after guard
  const handleReserve = useCallback(() => {
    if (!event) return;
    const sl = event.totalCapacity - event.spotsBooked;
    if (event.bookingRules?.maxPerBooking && partySize > event.bookingRules.maxPerBooking) {
      setRuleError(`Max ${event.bookingRules.maxPerBooking} per booking.`); return;
    }
    if (partySize > sl) {
      setRuleError(`Only ${sl} spot${sl !== 1 ? 's' : ''} left.`); return;
    }
    setRuleError('');
    setConfirmed(true);
    onConfirm({
      instanceId: event.instanceId,
      userId:     currentUser.id,
      partySize,
      totalPaid:  partySize * event.pricePerPerson,
      guestName:  currentUser.name,
      guestEmail: currentUser.email ?? '',
    });
  }, [event, partySize, currentUser, onConfirm]);

  // ── NULL GUARD — after all hooks, before any event.xxx access ─
  if (!isOpen || !event) return null;

  // ── Derived values — event is guaranteed non-null here ────────
  const spotsLeft = event.totalCapacity - event.spotsBooked;
  const maxParty  = Math.min(event.bookingRules?.maxPerBooking ?? spotsLeft, Math.max(spotsLeft, 1));
  const isBooked  = !!existingBooking || confirmed;
  const tc = TYPE_CFG[event.experienceType]  ?? { label: event.experienceType, icon: '✦', color: '#fff', bg: 'rgba(255,255,255,0.1)' };
  const sc = STATUS_CFG[event.status] ?? { label: event.status, dot: '#6B7280' };
  const total = partySize * event.pricePerPerson;

  const modal = (
    <>
      {/* ── Backdrop ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        } as React.CSSProperties}
      />

      {/* ── Sheet container ──────────────────────────────────── */}
      {/*
          Mobile  → items-end  : slides up from bottom (bottom-sheet)
          Desktop → items-center: centered in viewport
          We use an outer flex wrapper for alignment.
      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Reserve spot for ${event.title}`}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 1010,
          display: 'flex',
          justifyContent: 'center',
          padding: '0',
          pointerEvents: 'none',      /* let clicks fall through to backdrop */
        } as React.CSSProperties}
        /* alignment via classes only — inline styles would override them.
           mobile: bottom-sheet (items-end); desktop: anchored near top */
        className="items-end sm:items-start sm:p-4 sm:pt-6"
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: 480,
            maxHeight: '90vh',
            background: '#141414',
            borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -20px 80px rgba(0,0,0,0.9)',
            overflow: 'hidden',   /* clips child, scrolling is on inner div */
          } as React.CSSProperties}
          className="sm:rounded-2xl sm:border-b"
        >
          {/* ── Drag handle (mobile only) ─────────────────── */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0 sm:hidden">
            <div style={{ width: 36, height: 4, borderRadius: 99, background: '#374151' }} />
          </div>

          {/* ── Cover image ──────────────────────────────── */}
          <div className="relative flex-shrink-0" style={{ height: 130, overflow: 'hidden' }}>
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.1) 60%)' }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 flex items-center justify-center rounded-full text-white transition-all hover:bg-white/20"
              style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.65)', border: 'none', cursor: 'pointer' }}
              aria-label="Close"
            >
              <IcoClose />
            </button>

            {/* Full detail link */}
            {onViewFullDetail && (
              <button
                onClick={() => { onClose(); onViewFullDetail(); }}
                className="absolute top-3 left-3 text-xs font-bold text-white/80 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.65)', border: 'none', cursor: 'pointer' }}
              >
                Details →
              </button>
            )}

            {/* Type badge + title */}
            <div className="absolute bottom-3 left-4">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold mb-1"
                style={{ background: tc.bg, color: tc.color }}
              >
                {tc.icon} {tc.label}
              </span>
              <h2 className="text-lg font-black text-white leading-tight m-0">
                {event.title}
              </h2>
            </div>
          </div>

          {/* ── Scrollable body ───────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            onTouchMove={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 flex flex-col gap-4">

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                <span>📅 {formatEventDate(event.date)}</span>
                <span>🕐 {event.arrivalTime || event.time}</span>
                <span>📍 {event.venue}</span>
              </div>

              {/* Availability pill */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block rounded-full"
                    style={{ width: 8, height: 8, background: sc.dot, flexShrink: 0 }}
                  />
                  <span className="text-white font-semibold">{sc.label}</span>
                </div>
                <span className="text-sm font-black text-white">
                  ${event.pricePerPerson.toLocaleString()}
                  <span className="text-xs text-gray-500 font-normal"> /person</span>
                </span>
              </div>

              {/* Spots count */}
              <div className="flex items-center gap-2 text-sm">
                <IcoUsers />
                <span style={{
                  color: spotsLeft <= 1 ? '#EF4444' : spotsLeft <= 3 ? '#F59E0B' : '#9CA3AF',
                  fontWeight: spotsLeft <= 3 ? 700 : 400,
                }}>
                  {spotsLeft <= 0
                    ? 'Sold out — no spots remaining'
                    : spotsLeft === 1
                    ? '🔴 Only 1 spot left!'
                    : spotsLeft <= 3
                    ? `⚡ ${spotsLeft} spots left`
                    : `${spotsLeft} of ${event.totalCapacity} spots available`}
                </span>
              </div>

              {/* ── ALREADY BOOKED ── */}
              {isBooked && (
                <div className="flex flex-col items-center gap-3 py-3 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.15)' }}
                  >
                    <span style={{ color: '#22C55E' }}><IcoCheck /></span>
                  </div>
                  <div>
                    <p className="font-black text-white text-base m-0">You're In! 🎉</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {existingBooking
                        ? `${existingBooking.partySize} spot${existingBooking.partySize !== 1 ? 's' : ''} · $${existingBooking.totalPaid.toLocaleString()} confirmed`
                        : 'Added to cart — complete payment in My Plans'}
                    </p>
                  </div>
                  {onNavigateToPlans && (
                    <button
                      onClick={() => { onClose(); onNavigateToPlans(); }}
                      className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', border: 'none', cursor: 'pointer' }}
                    >
                      Go to Checkout →
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              )}

              {/* ── NOT AVAILABLE ── */}
              {!isBooked && (event.status === 'sold-out' || event.status === 'cancelled') && (
                <p className="text-center text-gray-500 text-sm py-2">
                  {event.status === 'sold-out' ? 'This event is fully booked.' : 'This event has been cancelled.'}
                </p>
              )}

              {/* ── ACCESS DENIED ── */}
              {!isBooked && !canBook && event.status !== 'sold-out' && event.status !== 'cancelled' && (
                <div className="flex flex-col gap-3 py-2">
                  {currentUser.approvalStatus !== 'approved' ? (
                    /* Pending / not yet approved */
                    <div
                      className="rounded-2xl p-4 flex items-start gap-3"
                      style={{ background: 'rgba(224,64,251,0.07)', border: '1px solid rgba(224,64,251,0.2)' }}
                    >
                      <span className="text-xl flex-shrink-0">🔒</span>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">
                          {currentUser.approvalStatus === 'rejected'
                            ? 'Application not approved'
                            : 'Your profile is under review'}
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {currentUser.approvalStatus === 'rejected'
                            ? 'Your application was not approved. Contact support for more info.'
                            : 'Once approved by our team you\'ll be able to book — we\'ll let you know!'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Approved but profile < 80% */
                    <div
                      className="rounded-2xl p-4 flex flex-col gap-3"
                      style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">📋</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white mb-1">
                            Complete your profile to book
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Your profile needs to be at least <span className="text-white font-semibold">80% complete</span> to book a Wingman experience. Add your phone number and a profile photo to unlock booking.
                          </p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Profile completion</span>
                          <span style={{ color: '#F59E0B' }}>{[
                            currentUser.name?.trim().split(/\s+/).length >= 2 ? 15 : 0,
                            currentUser.email ? 20 : 0,
                            currentUser.phoneNumber ? 25 : 0,
                            (currentUser.profilePhoto && currentUser.profilePhoto.length > 4) ? 30 : 0,
                            currentUser.city ? 10 : 0,
                          ].reduce((a, b) => a + b, 0)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: [
                                currentUser.name?.trim().split(/\s+/).length >= 2 ? 15 : 0,
                                currentUser.email ? 20 : 0,
                                currentUser.phoneNumber ? 25 : 0,
                                (currentUser.profilePhoto && currentUser.profilePhoto.length > 4) ? 30 : 0,
                                currentUser.city ? 10 : 0,
                              ].reduce((a, b) => a + b, 0) + '%',
                              background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1.5">
                          Missing: {[
                            !(currentUser.name?.trim().split(/\s+/).length >= 2) && 'full name',
                            !currentUser.phoneNumber && 'phone number',
                            !(currentUser.profilePhoto && currentUser.profilePhoto.length > 4) && 'profile photo',
                            !currentUser.city && 'city',
                          ].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── BOOKING FORM ── */}
              {!isBooked && canBook && event.status !== 'sold-out' && event.status !== 'cancelled' && (
                <div className="flex flex-col gap-4">

                  {/* Party size stepper */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                      Party Size
                    </p>
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => setPartySize(p => Math.max(1, p - 1))}
                        className="w-11 h-11 rounded-full font-bold text-white text-xl flex items-center justify-center transition-colors hover:bg-gray-700"
                        style={{ background: '#1F2937', border: 'none', cursor: 'pointer' }}
                        aria-label="Decrease party size"
                      >
                        −
                      </button>
                      <span className="text-3xl font-black text-white w-10 text-center">
                        {partySize}
                      </span>
                      <button
                        onClick={() => setPartySize(p => Math.min(maxParty, p + 1))}
                        className="w-11 h-11 rounded-full font-bold text-white text-xl flex items-center justify-center transition-colors hover:bg-gray-700"
                        style={{ background: '#1F2937', border: 'none', cursor: 'pointer' }}
                        aria-label="Increase party size"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500">
                        person{partySize !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    className="flex items-center justify-between py-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <span className="text-sm text-gray-400">Total</span>
                    <span className="text-2xl font-black text-white">
                      ${(partySize * event.pricePerPerson).toLocaleString()}
                    </span>
                  </div>

                  {/* Validation error */}
                  {ruleError && (
                    <div
                      className="rounded-xl px-4 py-2 text-xs text-red-300"
                      style={{ background: 'rgba(127,29,29,0.35)', border: '1px solid rgba(239,68,68,0.35)' }}
                    >
                      {ruleError}
                    </div>
                  )}
                </div>
              )}

              {/* ── Pricing & Alcohol Disclosure ── */}
              {!isBooked && canBook && event.status !== 'sold-out' && event.status !== 'cancelled' && (
                <div
                  className="rounded-xl p-3.5 text-[10.5px] leading-relaxed space-y-1.5"
                  style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}
                >
                  <p className="font-black text-[11px] uppercase tracking-widest" style={{ color: '#F59E0B' }}>
                    🥂 What's Included
                  </p>
                  {event.experienceType === 'Dinner' ? (
                    <p style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <span className="font-semibold text-white/75">$450 flat rate</span> covers access for <span className="font-semibold text-white/75">up to 2 guests</span> to the Wingman hosted dining experience.
                    </p>
                  ) : event.experienceType === 'Yacht' ? (
                    <p style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <span className="font-semibold text-white/75">$400 per person</span> covers access to the Wingman hosted yacht experience.
                    </p>
                  ) : (
                    <p style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <span className="font-semibold text-white/75">$500 per person</span> covers access to the Wingman hosted VIP nightlife experience.
                    </p>
                  )}
                  <div style={{ borderTop: '1px solid rgba(245,158,11,0.15)', paddingTop: '8px', marginTop: '6px' }}>
                    <p className="font-bold text-[10px] uppercase tracking-wide mb-1" style={{ color: 'rgba(239,68,68,0.85)' }}>
                      ⚠ Not Included
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Your payment does <span className="font-semibold text-white/65">not</span> include bottles, bottle service, premium spirits, food, cocktails, or any additional orders. Any extra purchases at the venue are your personal responsibility and will be billed separately.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom padding so sticky CTA doesn't cover last content */}
              <div className="h-2" />
            </div>
          </div>

          {/* ── Sticky CTA ────────────────────────────────── */}
          {!isBooked && canBook && event.status !== 'sold-out' && event.status !== 'cancelled' && (
            <div
              className="flex-shrink-0 px-5 pt-3 pb-8"
              style={{
                background: '#141414',
                borderTop: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <button
                onClick={handleReserve}
                className="w-full py-4 rounded-2xl font-black text-white text-base transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)',
                  boxShadow: '0 8px 28px rgba(224,64,251,0.35)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reserve Spot — ${(partySize * event.pricePerPerson).toLocaleString()}
              </button>
              <p className="text-center text-xs text-gray-600 mt-2">
                {spotsLeft <= 3 && spotsLeft > 0
                  ? `⚠️ Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`
                  : 'Spot reserved instantly · Pay at checkout'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
};
