
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Wingman, Venue, TableOption, UserAccessLevel, User, CartItem, UserRole } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UsersIcon } from './icons/UsersIcon';
import { AddedToPlansModal } from './modals/AddedToPlansModal';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import {
  getExperienceTypeFromCategory,
  calculateWingmanPrice,
  getPriceLabel,
  getPriceBreakdown,
} from '../utils/wingmanPricing';

interface BookingFlowProps {
  wingman: Wingman;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  currentUser: User;
  initialVenue?: Venue;
  initialDate?: string;
  tableBookings: Record<string, number>;
  onNavigateToCheckout: () => void;
  onKeepBooking: () => void;
  venues: Venue[];
}

const DEPOSIT_AMOUNT = 50;
const LARGE_GROUP_MAX_GUESTS = 20;
const YACHT_MAX_GUESTS = 13;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TAX_SERVICE_RATE = 0.36;
const RESTAURANT_BLOCK_SIZE = 2;
// Legacy compat — kept only for header pill restaurant block-bar display
const RESTAURANT_CATEGORIES = ['Restaurant', 'Luxury Restaurant', 'Waterfront Restaurant'];
const isRestaurantVenue = (venue: Venue | null): boolean =>
  !!venue && RESTAURANT_CATEGORIES.some(c => venue.category?.toLowerCase() === c.toLowerCase());

// ─── Shared styled detail row ───────────────────────────────
const DetailRow: React.FC<{ label: string; value: string | number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center">
    <p className="text-[12px] text-gray-500">{label}</p>
    <p className={`text-[12px] font-bold text-right ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</p>
  </div>
);

// ─── Styled text input ──────────────────────────────────────
const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }> = ({ hasError, className, ...props }) => (
  <input
    {...props}
    className={`w-full text-white text-sm rounded-xl px-4 py-3 transition-all outline-none ${className ?? ''}`}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${hasError ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
    }}
  />
);

// ─── Guest stepper ──────────────────────────────────────────
const GuestStepper: React.FC<{
  label: string; icon: string; value: number | '';
  onChange: (v: number | '') => void; hasError?: boolean; maxTotal?: number; currentTotal?: number;
}> = ({ label, icon, value, onChange, hasError, maxTotal, currentTotal }) => {
  const atMax = maxTotal != null && currentTotal != null && currentTotal >= maxTotal;
  return (
  <div
    className="flex-1 flex items-center justify-between rounded-xl px-4 py-3"
    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}` }}
  >
    <div className="flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, Number(value || 0) - 1))}
        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-lg leading-none transition-all hover:opacity-80"
        style={{ background: 'rgba(255,255,255,0.08)' }}
        aria-label={`Decrease ${label}`}
      >−</button>
      <span className="text-white font-black text-sm w-4 text-center">{value === '' ? 0 : value}</span>
      <button
        type="button"
        onClick={() => {
          if (atMax) return;
          onChange(Math.min(LARGE_GROUP_MAX_GUESTS, Number(value || 0) + 1));
        }}
        disabled={atMax}
        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-lg leading-none transition-all"
        style={{ background: atMax ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)', opacity: atMax ? 0.35 : 1 }}
        aria-label={`Increase ${label}`}
      >+</button>
    </div>
  </div>
  );
};

export const BookingFlow: React.FC<BookingFlowProps> = ({
  wingman, onClose, onAddToCart, currentUser, initialVenue, initialDate,
  tableBookings, onNavigateToCheckout, onKeepBooking, venues
}) => {
  const [step, setStep] = useState(initialVenue ? 2 : 1);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(initialVenue || null);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || '');
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null);
  const isPrivilegedUser = useMemo(
    () => currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.role === UserRole.ADMIN,
    [currentUser]
  );
  const [numberOfMaleGuests, setNumberOfMaleGuests] = useState<number | ''>(isPrivilegedUser ? 0 : 1);
  const [numberOfFemaleGuests, setNumberOfFemaleGuests] = useState<number | ''>(isPrivilegedUser ? 1 : 0);
  const [errors, setErrors] = useState<{ date?: string; guests?: string }>({});
  const [bookingFor, setBookingFor] = useState<'self' | 'guest'>('self');
  const [guestDetails, setGuestDetails] = useState({ name: '', email: '', phone: '' });
  const [specialRequests, setSpecialRequests] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | HTMLButtonElement>(null);

  // Body scroll lock
  useEffect(() => {
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
        nav.style.zIndex = nav.dataset.prevZ ?? '';
        nav.style.pointerEvents = '';
        nav.style.visibility = '';
        delete nav.dataset.prevZ;
      }
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Sync initial props
  useEffect(() => {
    if (initialVenue) { setSelectedVenue(initialVenue); setStep(2); }
    if (initialDate) setSelectedDate(initialDate);
  }, [initialVenue, initialDate]);

  // Focus management
  useEffect(() => {
    if (firstInputRef.current) firstInputRef.current.focus();
  }, [step]);

  const wingmanVenues = useMemo(() => {
    const assigned = venues.filter(v => wingman.assignedVenueIds.includes(v.id));
    if (initialVenue && !assigned.find(v => v.id === initialVenue.id)) return [initialVenue, ...assigned];
    return assigned;
  }, [wingman.assignedVenueIds, venues, initialVenue]);

  const minDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const totalGuests = useMemo(() => Number(numberOfMaleGuests || 0) + Number(numberOfFemaleGuests || 0), [numberOfMaleGuests, numberOfFemaleGuests]);

  // ── Central Wingman pricing ──────────────────────────────────────────────────
  const experienceType = useMemo(
    () => getExperienceTypeFromCategory(selectedVenue?.category) ?? 'nightclub',
    [selectedVenue]
  );
  const wingmanTotal = useMemo(
    () => calculateWingmanPrice(experienceType, Math.max(1, totalGuests)),
    [experienceType, totalGuests]
  );
  const wingmanPriceLabel = useMemo(() => getPriceLabel(experienceType), [experienceType]);
  const wingmanPriceBreakdown = useMemo(
    () => getPriceBreakdown(experienceType, Math.max(1, totalGuests)),
    [experienceType, totalGuests]
  );
  const isYachtVenue = useMemo(() => selectedVenue?.category === 'Yacht', [selectedVenue]);
  const guestCap = isYachtVenue ? YACHT_MAX_GUESTS : LARGE_GROUP_MAX_GUESTS;
  const restaurantBlocks = useMemo(
    () => Math.ceil(Math.max(1, totalGuests) / RESTAURANT_BLOCK_SIZE),
    [totalGuests]
  );

  // For Yacht: price is always the flat charter rate regardless of guest count
  const displayTotal = isYachtVenue
    ? (selectedVenue?.yachtPrice4Hours ?? wingmanTotal)
    : wingmanTotal;

  const handleVenueSelect = (venue: Venue) => { setSelectedVenue(venue); setStep(2); };
  const handleTableSelect = (table: TableOption) => { setSelectedTable(table); setStep(4); };

  const validateAndProceed = () => {
    const errs: { date?: string; guests?: string } = {};
    let ok = true;
    if (!selectedDate) { errs.date = 'Please select a date.'; ok = false; }
    else if (selectedDate < minDate) { errs.date = 'Please select a future date.'; ok = false; }
    else if (selectedVenue) {
      const day = WEEKDAYS[new Date(selectedDate + 'T00:00:00').getDay()];
      if (!selectedVenue.operatingDays.some(d => d.toLowerCase() === day.toLowerCase())) {
        errs.date = `${selectedVenue.name} is closed on ${day}s.`;
        ok = false;
      }
    }
    if (step === 2 && totalGuests === 0) { errs.guests = 'Please add at least 1 guest.'; ok = false; }
    setErrors(errs);
    if (ok) setStep(s => s + 1);
  };

  const handleConfirmBooking = () => {
    if (!selectedVenue || !selectedTable || !selectedDate) return;
    if (bookingFor === 'guest' && (!guestDetails.name || !guestDetails.email)) {
      (window as any).showAppToast?.("Please enter the guest's name and email.");
      return;
    }
    const isYacht = selectedVenue.category === 'Yacht';
    const cartItem: CartItem = {
      id: `table-${selectedVenue.id}-${selectedDate}-${selectedTable.id}-exp${experienceType}-guests${Math.max(1, totalGuests)}-${Date.now()}`,
      type: 'table',
      name: selectedVenue.name,
      image: selectedVenue.coverImage,
      date: new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      sortableDate: selectedDate,
      quantity: 1,
      fullPrice: isYacht ? (selectedVenue.yachtPrice4Hours ?? wingmanTotal) : wingmanTotal,
      depositPrice: isYacht ? 600 : undefined,
      paymentOption: isYacht ? 'deposit' : 'full',
      tableDetails: {
        venue: selectedVenue,
        tableOption: selectedTable,
        wingman,
        numberOfGuests: totalGuests,
        guestDetails: bookingFor === 'guest'
          ? guestDetails
          : { name: currentUser.name, email: currentUser.email, phone: currentUser.phoneNumber || '' },
        specialRequests,
      },
    };
    onAddToCart(cartItem);
    setShowSuccessModal(true);
  };

  // ── Step labels for progress bar ────────────────────────────
  const STEPS = initialVenue
    ? ['Date & Guests', 'Select Table', 'Confirm']
    : ['Venue', 'Date & Guests', 'Select Table', 'Confirm'];
  const totalSteps = STEPS.length;
  const currentStepIdx = initialVenue ? step - 2 : step - 1;

  // ─────────────────────────────────────────────────────────────
  // STEP RENDERERS
  // ─────────────────────────────────────────────────────────────

  const renderStep1Venue = () => (
    <div role="region" aria-label="Select a Venue" className="space-y-3">
      {wingmanVenues.map((venue, i) => (
        <button
          key={venue.id}
          onClick={() => handleVenueSelect(venue)}
          ref={i === 0 ? firstInputRef as React.RefObject<HTMLButtonElement> : null}
          className="w-full text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
          aria-label={`Select ${venue.name}`}
        >
          <div className="relative h-24 overflow-hidden">
            <img src={venue.coverImage} alt={venue.name} className="w-full h-full object-cover" style={{ filter: 'brightness(0.55)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
            <div className="absolute bottom-3 left-4 right-4">
              <p className="font-black text-white text-sm leading-tight">{venue.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{venue.location}</p>
            </div>
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between">
            <p className="text-[10px] text-gray-500">Open: <span className="text-gray-400">{venue.operatingDays.join(', ')}</span></p>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(224,64,251,0.12)', color: '#E040FB', border: '1px solid rgba(224,64,251,0.2)' }}>
              Available
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  const renderStep2DateGuests = () => (
    <div role="region" aria-label="Select Date and Guests" className="space-y-5">
      <div>
        <label htmlFor="booking-date" className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
          Select Date
        </label>
        <input
          type="date"
          id="booking-date"
          ref={firstInputRef as React.RefObject<HTMLInputElement>}
          value={selectedDate}
          onChange={e => { setSelectedDate(e.target.value); setErrors({ ...errors, date: undefined }); }}
          min={minDate}
          aria-invalid={!!errors.date}
          className="w-full text-white text-sm rounded-xl px-4 py-3 transition-all outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${errors.date ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
            colorScheme: 'dark',
          }}
        />
        {errors.date && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs mt-2 animate-fade-in">
            <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.date}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Guests</label>
        <div className="flex gap-3">
          <GuestStepper label="Men"   icon="♂" value={numberOfMaleGuests}   onChange={setNumberOfMaleGuests}   hasError={!!errors.guests} maxTotal={guestCap} currentTotal={totalGuests} />
          <GuestStepper label="Women" icon="♀" value={numberOfFemaleGuests} onChange={setNumberOfFemaleGuests} hasError={!!errors.guests} maxTotal={guestCap} currentTotal={totalGuests} />
        </div>
        {totalGuests > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-gray-600">{totalGuests} guest{totalGuests !== 1 ? 's' : ''} total</p>
            {isYachtVenue && (
              <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: totalGuests >= guestCap ? '#EF4444' : 'rgba(0,212,255,0.6)' }}>
                {totalGuests >= guestCap ? '⚠ Max capacity reached' : `${guestCap - totalGuests} spots left`}
              </p>
            )}
          </div>
        )}
        {errors.guests && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs mt-2 animate-fade-in">
            <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errors.guests}</span>
          </div>
        )}
      </div>

      {totalGuests > 0 && (
        isYachtVenue ? (
          // ── Yacht: flat charter price card (cyan) ──
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00D4FF' }}>⚓ Charter Pricing</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(0,212,255,0.55)' }}>
                  Flat rate · {totalGuests} guest{totalGuests !== 1 ? 's' : ''} · max {guestCap}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>$600 deposit or pay in full at checkout</p>
              </div>
              <p className="text-xl font-black" style={{ color: '#00D4FF' }}>${displayTotal.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          // ── Standard: per-guest amber pricing card ──
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Experience Pricing</p>
                <p className="text-[11px] text-amber-400/60 mt-0.5">
                  {wingmanPriceBreakdown}
                </p>
              </div>
              <p className="text-xl font-black text-amber-400">${displayTotal.toLocaleString()}</p>
            </div>
            {experienceType === 'restaurant' && (
              <div className="flex gap-2 mt-2">
                {Array.from({ length: restaurantBlocks }).map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full" style={{ background: 'rgba(245,158,11,0.4)' }} />
                ))}
              </div>
            )}
          </div>
        )
      )}

      <button
        onClick={validateAndProceed}
        className="w-full font-black py-4 rounded-2xl text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: '0 8px 24px rgba(224,64,251,0.3)' }}
      >
        Continue
      </button>
    </div>
  );

  const renderStep3Table = () => {
    const tablesForVenue = selectedVenue?.tableOptions && selectedVenue.tableOptions.length > 0
      ? selectedVenue.tableOptions
      : [{ id: 'general-inquiry', name: 'General Reservation Request', area: 'General', minSpend: 0, description: 'Submit a request and your Wingman will follow up with options.', capacityHint: 'Small Groups' } as TableOption];

    return (
      <div role="region" aria-label="Select a Table" className="space-y-3">
        {tablesForVenue.map((table, i) => {
          const tableKey = `${table.id}-${selectedDate}`;
          const booked = tableBookings[tableKey] || 0;
          const available = table.totalAvailable === undefined || booked < table.totalAvailable;
          const isSelected = selectedTable?.id === table.id;

          return (
            <button
              key={table.id}
              onClick={() => available && handleTableSelect(table)}
              ref={i === 0 ? firstInputRef as React.RefObject<HTMLButtonElement> : null}
              disabled={!available}
              className="w-full text-left rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
              style={{
                background: isSelected ? 'rgba(224,64,251,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(224,64,251,0.35)' : 'rgba(255,255,255,0.08)'}`,
              }}
              aria-disabled={!available}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-black text-white text-sm">{table.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{table.description}</p>
                </div>
                {!available && (
                  <span className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    Sold Out
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-3.5 h-3.5 text-gray-600" />
                  <div>
                    <p className="text-[9px] text-gray-600 uppercase tracking-wide">Capacity</p>
                    <p className="text-[11px] font-bold text-gray-300">{table.capacityHint}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-600 uppercase tracking-wide">Est. Total</p>
                  <p className="text-sm font-black text-amber-400">${wingmanTotal.toLocaleString()}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderStep4Confirm = () => {
    if (!selectedVenue || !selectedTable) return null;
    const dateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <div role="region" aria-label="Confirm Booking" className="space-y-4">
        <div className="rounded-2xl p-4 space-y-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3">Reservation Summary</p>
          <DetailRow label="Venue" value={selectedVenue.name} />
          <DetailRow label="Date" value={dateLabel} />
          <DetailRow label="Table" value={selectedTable.name} />
          <DetailRow label="Wingman" value={wingman.name} />
          <DetailRow label="Guests" value={Math.max(1, totalGuests)} />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '10px' }} className="space-y-2">
            <DetailRow label="Pricing" value={wingmanPriceLabel} />
            <DetailRow label={wingmanPriceBreakdown} value={`$${wingmanTotal.toLocaleString()}`} />
            <div className="flex justify-between items-center pt-1">
              <p className="text-xs font-black text-white">Total</p>
              <p className="text-base font-black text-amber-400">
                ${wingmanTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Booking for</p>
          <div className="flex gap-2">
            {(['self', 'guest'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setBookingFor(opt)}
                className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all"
                style={bookingFor === opt
                  ? { background: 'linear-gradient(135deg, #E040FB, #7B61FF)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {opt === 'self' ? 'Myself' : 'A Guest'}
              </button>
            ))}
          </div>
        </div>

        {bookingFor === 'guest' && (
          <div className="space-y-2.5 animate-fade-in">
            <StyledInput type="text" value={guestDetails.name} onChange={e => setGuestDetails({ ...guestDetails, name: e.target.value })} placeholder="Guest Full Name" required aria-label="Guest Full Name" />
            <StyledInput type="email" value={guestDetails.email} onChange={e => setGuestDetails({ ...guestDetails, email: e.target.value })} placeholder="Guest Email" required aria-label="Guest Email" />
            <StyledInput type="tel" value={guestDetails.phone} onChange={e => setGuestDetails({ ...guestDetails, phone: e.target.value })} placeholder="Guest Phone (Optional)" aria-label="Guest Phone" />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Special Requests <span className="normal-case font-normal text-gray-700">(optional)</span></label>
          <textarea
            value={specialRequests}
            onChange={e => setSpecialRequests(e.target.value)}
            placeholder="Booth preference, birthday setup, dietary needs…"
            rows={3}
            className="w-full text-white text-sm rounded-xl px-4 py-3 outline-none resize-none placeholder-gray-700 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>

        <div className="rounded-xl px-4 py-3 text-[10px] leading-relaxed" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#4B5563' }}>
          You are purchasing access to a hosted Wingman Experience. You are not purchasing bottles, bottle service, or ownership of a table. Any additional bottles, drinks, food, or upgrades requested at the venue are paid separately by you directly to the venue.
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderStep1Venue();
      case 2: return renderStep2DateGuests();
      case 3: return renderStep3Table();
      case 4: return renderStep4Confirm();
      default: return null;
    }
  };

  const stickyFooterCTA = step === 4 && selectedVenue && selectedTable ? (
    <div className="flex-shrink-0 px-5 pt-3 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={handleConfirmBooking}
        className="w-full font-black py-4 rounded-2xl text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: '0 8px 28px rgba(224,64,251,0.35)' }}
      >
        Confirm &amp; Add to Plans — ${wingmanTotal.toLocaleString()}
      </button>
      <p className="text-center text-[10px] text-gray-700 mt-2">Reserved instantly · Pay at checkout</p>
    </div>
  ) : null;

  const modal = (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        } as React.CSSProperties}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1010,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', pointerEvents: 'none',
        } as React.CSSProperties}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            width: '100%', maxWidth: 480, maxHeight: '92vh',
            background: '#0E0E10',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.09)',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 32px 80px rgba(0,0,0,0.95)',
            overflow: 'hidden',
          } as React.CSSProperties}
        >
          {/* ── Header ─────────────────────────────────────── */}
          <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-3">
                <h2 id="booking-modal-title" className="font-black text-white text-base leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {step === 1 ? 'Select a Venue' : step === 2 ? 'Date & Guests' : step === 3 ? 'Select a Table' : 'Confirm Details'}
                </h2>
                {step > 1 && selectedVenue && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-[10px] font-semibold" style={{ color: '#E040FB' }}>
                      at {selectedVenue.name}
                    </p>
                    {/* ── Live pricing pill — always visible ── */}
                    {totalGuests > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}
                      >
                        🍽 ${wingmanTotal.toLocaleString()} · {wingmanPriceBreakdown}
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                        style={{ background: 'rgba(245,158,11,0.10)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
                      >
                        {wingmanPriceLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:opacity-80 flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.07)' }}
                aria-label="Close booking flow"
              >
                <CloseIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Step progress bar */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full flex-1 transition-all duration-500"
                  style={{
                    background: i <= currentStepIdx
                      ? 'linear-gradient(90deg, #E040FB, #7B61FF)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {STEPS.map((label, i) => (
                <p key={i} className="text-[9px] font-bold uppercase tracking-widest" style={{ color: i === currentStepIdx ? '#E040FB' : '#374151' }}>
                  {label}
                </p>
              ))}
            </div>
          </div>

          {/* ── Scrollable body ─────────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain p-5"
            style={{ minHeight: 0, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' } as React.CSSProperties}
            onTouchMove={e => e.stopPropagation()}
          >
            {renderStepContent()}
          </div>

          {/* ── Sticky CTA (step 4) ─────────────────────────── */}
          {stickyFooterCTA}

          {/* ── Back nav ────────────────────────────────────── */}
          {step > 1 && (
            <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: stickyFooterCTA ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-white transition-colors text-xs font-semibold"
                aria-label="Go to previous step"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Back
              </button>
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <AddedToPlansModal
          isOpen={true}
          onClose={() => { setShowSuccessModal(false); onClose(); }}
          venueName={selectedVenue ? selectedVenue.name : ''}
          onCheckout={onNavigateToCheckout}
          onKeepBooking={onKeepBooking}
          keepBookingLabel="Keep Booking"
        />
      )}
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
};
