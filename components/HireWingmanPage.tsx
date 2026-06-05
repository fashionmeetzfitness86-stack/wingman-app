import React, { useState } from 'react';
import { Page, User, Wingman } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { SparkleIcon } from './icons/SparkleIcon';

interface HireWingmanPageProps {
  onNavigate: (page: Page) => void;
  currentUser: User;
  wingmen: Wingman[];
  showToast: (msg: string, type: 'success' | 'error') => void;
  onSubmitRequest?: (req: HireRequest) => void;
}

export interface HireRequest {
  id: number;
  userId: number;
  userName: string;
  email: string;
  phone: string;
  arrivalDate: string;
  departureDate: string;
  partySize: number;
  budget: string;
  vibe: string[];
  preferredGender: string;
  message: string;
  preferredWingmanId?: number;
  status: 'pending' | 'matched' | 'confirmed' | 'declined';
  submittedAt: string;
}

const VIBE_OPTIONS = [
  { label: 'Nightclubs', emoji: '🌙' },
  { label: 'Rooftop Bars', emoji: '🌃' },
  { label: 'Private Dining', emoji: '🍽️' },
  { label: 'Yacht / Boat', emoji: '⛵' },
  { label: 'Pool Parties', emoji: '☀️' },
  { label: 'Lounges', emoji: '🥂' },
  { label: 'Live Music', emoji: '🎶' },
  { label: 'VIP Guestlists', emoji: '🎟️' },
];

const BUDGET_OPTIONS = [
  { label: '$500 – $1,000', value: '500-1000' },
  { label: '$1,000 – $2,500', value: '1000-2500' },
  { label: '$2,500 – $5,000', value: '2500-5000' },
  { label: '$5,000+', value: '5000+' },
];

const GENDER_OPTIONS = ['No preference', 'Male', 'Female', 'Non-binary'];

// ── Styled field wrapper
const FieldLabel: React.FC<{ label: string; required?: boolean; hint?: string }> = ({ label, required, hint }) => (
  <div className="mb-2">
    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted, #8A8E99)' }}>
      {label}{required && <span style={{ color: '#E040FB' }}>*</span>}
    </label>
    {hint && <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-sub, #4A4E5A)' }}>{hint}</p>}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 14,
  padding: '12px 16px',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
};

export const HireWingmanPage: React.FC<HireWingmanPageProps> = ({
  onNavigate, currentUser, wingmen, showToast, onSubmitRequest,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [arrivalDate,    setArrivalDate]    = useState('');
  const [departureDate,  setDepartureDate]  = useState('');
  const [partySize,      setPartySize]      = useState(2);
  const [budget,         setBudget]         = useState('');
  const [vibes,          setVibes]          = useState<string[]>([]);
  const [preferredGender,setPreferredGender]= useState('No preference');
  const [preferredWingmanId, setPreferredWingmanId] = useState<number | undefined>();
  const [phone,          setPhone]          = useState(currentUser.phoneNumber || '');
  const [email,          setEmail]          = useState(currentUser.email || '');
  const [message,        setMessage]        = useState('');
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [submitted,      setSubmitted]      = useState(false);

  const toggleVibe = (v: string) =>
    setVibes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const canStep1 = arrivalDate && departureDate && partySize >= 1 && budget;
  const canStep2 = vibes.length > 0;

  const handleSubmit = () => {
    if (!email.trim() || !phone.trim()) {
      showToast('Please fill in your contact details.', 'error');
      return;
    }
    setIsSubmitting(true);
    const req: HireRequest = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      email,
      phone,
      arrivalDate,
      departureDate,
      partySize,
      budget,
      vibe: vibes,
      preferredGender,
      message,
      preferredWingmanId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onSubmitRequest?.(req);
      showToast('Your request was sent! We\'ll match you within 24 hrs. 🎉', 'success');
    }, 1200);
  };

  // ── Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-32 animate-fade-in text-center" style={{ background: '#08080A' }}>
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-4xl"
          style={{ background: 'linear-gradient(135deg, #E040FB22, #7B61FF22)', border: '1px solid rgba(224,64,251,0.3)' }}
        >
          🎉
        </div>
        <h1 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Request Submitted!
        </h1>
        <p className="text-sm text-gray-400 mb-2 max-w-xs leading-relaxed">
          Your Wingman request for <strong className="text-white">{arrivalDate} – {departureDate}</strong> is in review.
        </p>
        <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
          We'll personally match you with the best available Wingman and reach out within <strong className="text-white">24 hours</strong>.
        </p>
        <div
          className="w-full max-w-sm rounded-2xl px-5 py-4 mb-6 text-left"
          style={{ background: 'rgba(224,64,251,0.08)', border: '1px solid rgba(224,64,251,0.2)' }}
        >
          <p className="text-xs font-bold text-white mb-1">What happens next?</p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>✓ Our team reviews your vibe & dates</li>
            <li>✓ We match you with an available Wingman</li>
            <li>✓ You receive a confirmation & itinerary</li>
            <li>✓ Payment is handled securely on arrival</li>
          </ul>
        </div>
        <button
          onClick={() => onNavigate('back' as Page)}
          className="text-sm font-bold px-8 py-3 rounded-2xl transition-all"
          style={{ background: 'linear-gradient(135deg,#E040FB,#7B61FF)', color: '#fff' }}
        >
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36 animate-fade-in" style={{ background: '#08080A' }}>

      {/* ── Sticky header */}
      <div
        className="sticky top-0 z-30 px-5 pt-5 pb-4"
        style={{ background: 'rgba(8,8,10,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => onNavigate('back' as Page)}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: '#9ca3af' }}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#E040FB' }}>
              Wingman Concierge
            </p>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Hire a Wingman
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Visiting Miami? We'll be your guide.</p>
          </div>
          {/* Step indicator */}
          <div className="flex gap-1.5 pb-1">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: step === s ? 24 : 8,
                  background: s <= step ? 'linear-gradient(90deg,#E040FB,#7B61FF)' : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">

        {/* ── STEP 1: Trip Details */}
        {step === 1 && (
          <div className="animate-fade-in space-y-5">
            <div
              className="rounded-2xl px-5 py-4"
              style={{ background: 'rgba(224,64,251,0.06)', border: '1px solid rgba(224,64,251,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <SparkleIcon className="w-4 h-4" style={{ color: '#E040FB' } as any} />
                <p className="text-xs font-bold text-white">Step 1 of 3 — Your Trip</p>
              </div>
              <p className="text-xs text-gray-500">Tell us when you're coming and how big your group is.</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Arrival Date" required />
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={e => setArrivalDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  className="placeholder-gray-700"
                />
              </div>
              <div>
                <FieldLabel label="Departure Date" required />
                <input
                  type="date"
                  value={departureDate}
                  onChange={e => setDepartureDate(e.target.value)}
                  min={arrivalDate || new Date().toISOString().split('T')[0]}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  className="placeholder-gray-700"
                />
              </div>
            </div>

            {/* Party size */}
            <div>
              <FieldLabel label="Group Size" required hint="How many people in your crew?" />
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPartySize(p => Math.max(1, p - 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >−</button>
                <span className="text-2xl font-black text-white w-10 text-center">{partySize}</span>
                <button
                  onClick={() => setPartySize(p => Math.min(20, p + 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >+</button>
                <span className="text-xs text-gray-500">{partySize === 1 ? 'Just you' : `${partySize} people`}</span>
              </div>
            </div>

            {/* Budget */}
            <div>
              <FieldLabel label="Budget Range" required hint="Approximate total spend for your nights out" />
              <div className="grid grid-cols-2 gap-2">
                {BUDGET_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBudget(opt.value)}
                    className="px-3 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    style={budget === opt.value
                      ? { background: 'rgba(224,64,251,0.15)', color: '#E040FB', border: '1px solid rgba(224,64,251,0.35)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!canStep1}
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-black text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#E040FB,#7B61FF)', boxShadow: '0 8px 28px rgba(224,64,251,0.3)' }}
            >
              Continue — Choose Your Vibe →
            </button>
          </div>
        )}

        {/* ── STEP 2: Vibe + Wingman Preference */}
        {step === 2 && (
          <div className="animate-fade-in space-y-5">
            <div
              className="rounded-2xl px-5 py-4"
              style={{ background: 'rgba(123,97,255,0.07)', border: '1px solid rgba(123,97,255,0.18)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">✨</span>
                <p className="text-xs font-bold text-white">Step 2 of 3 — Your Vibe</p>
              </div>
              <p className="text-xs text-gray-500">What kind of experience are you looking for?</p>
            </div>

            {/* Vibe selector */}
            <div>
              <FieldLabel label="Scene & Activities" required hint="Select all that apply" />
              <div className="grid grid-cols-2 gap-2">
                {VIBE_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => toggleVibe(opt.label)}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 text-left"
                    style={vibes.includes(opt.label)
                      ? { background: 'rgba(123,97,255,0.15)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.35)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender preference */}
            <div>
              <FieldLabel label="Wingman Gender Preference" hint="Totally optional, we'll find the best match" />
              <div className="flex gap-2 flex-wrap">
                {GENDER_OPTIONS.map(g => (
                  <button
                    key={g}
                    onClick={() => setPreferredGender(g)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
                    style={preferredGender === g
                      ? { background: 'rgba(0,212,255,0.12)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional: browse wingmen */}
            {wingmen.length > 0 && (
              <div>
                <FieldLabel label="Request a Specific Wingman" hint="Optional — or we'll pick the best available" />
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {/* None option */}
                  <button
                    onClick={() => setPreferredWingmanId(undefined)}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95"
                    style={!preferredWingmanId
                      ? { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>🎲</div>
                    <span className="text-[10px] font-bold text-white whitespace-nowrap">Best Match</span>
                  </button>
                  {wingmen.slice(0, 6).map(w => (
                    <button
                      key={w.id}
                      onClick={() => setPreferredWingmanId(w.id === preferredWingmanId ? undefined : w.id)}
                      className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95"
                      style={preferredWingmanId === w.id
                        ? { background: 'rgba(224,64,251,0.12)', border: '1px solid rgba(224,64,251,0.3)' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <img src={w.profilePhoto} alt={w.name} className="w-12 h-12 rounded-xl object-cover" />
                      <span className="text-[10px] font-bold text-white whitespace-nowrap max-w-[60px] truncate">{w.name.split(' ')[0]}</span>
                      <span className="text-[9px] text-gray-500">⭐ {w.rating.toFixed(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-2xl font-bold text-sm text-gray-400 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ← Back
              </button>
              <button
                disabled={!canStep2}
                onClick={() => setStep(3)}
                className="flex-[2] py-4 rounded-2xl font-black text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#E040FB,#7B61FF)', boxShadow: '0 8px 28px rgba(224,64,251,0.3)' }}
              >
                Continue — Contact →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Contact + Message */}
        {step === 3 && (
          <div className="animate-fade-in space-y-5">
            <div
              className="rounded-2xl px-5 py-4"
              style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">📬</span>
                <p className="text-xs font-bold text-white">Step 3 of 3 — Contact Details</p>
              </div>
              <p className="text-xs text-gray-500">How we'll reach you to confirm your Wingman.</p>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <div>
                <FieldLabel label="Email" required />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={inputStyle}
                  className="placeholder-gray-700"
                />
              </div>
              <div>
                <FieldLabel label="WhatsApp / Phone" required hint="We'll send your confirmation here" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (305) 000-0000"
                  style={inputStyle}
                  className="placeholder-gray-700"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <FieldLabel label="Special Requests or Notes" hint="VIP bottle service, birthday, bachelor/bachelorette, etc." />
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Tell us anything that'll make your experience unforgettable..."
                style={{ ...inputStyle, resize: 'none' }}
                className="placeholder-gray-700"
              />
            </div>

            {/* Summary card */}
            <div
              className="rounded-2xl px-5 py-4 space-y-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs font-bold text-white mb-3">Request Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-gray-500">Dates</span>
                <span className="text-white font-semibold">{arrivalDate} → {departureDate}</span>
                <span className="text-gray-500">Group</span>
                <span className="text-white font-semibold">{partySize} {partySize === 1 ? 'person' : 'people'}</span>
                <span className="text-gray-500">Budget</span>
                <span className="text-white font-semibold">${budget.replace('-', ' – $')}</span>
                <span className="text-gray-500">Vibe</span>
                <span className="text-white font-semibold truncate">{vibes.slice(0, 2).join(', ')}{vibes.length > 2 ? ` +${vibes.length - 2}` : ''}</span>
                {preferredWingmanId && (
                  <>
                    <span className="text-gray-500">Wingman</span>
                    <span style={{ color: '#E040FB' }} className="font-semibold text-xs">
                      {wingmen.find(w => w.id === preferredWingmanId)?.name?.split(' ')[0] ?? 'Requested'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 rounded-2xl font-bold text-sm text-gray-400 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ← Back
              </button>
              <button
                disabled={isSubmitting || !email.trim() || !phone.trim()}
                onClick={handleSubmit}
                className="flex-[2] py-4 rounded-2xl font-black text-white text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#E040FB,#7B61FF,#00D4FF)', boxShadow: '0 8px 28px rgba(224,64,251,0.35)' }}
              >
                {isSubmitting ? 'Sending…' : '🎉 Send My Request →'}
              </button>
            </div>

            <p className="text-[11px] text-center text-gray-600 pb-2">
              No payment required now. We'll confirm availability and send you a secure payment link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
