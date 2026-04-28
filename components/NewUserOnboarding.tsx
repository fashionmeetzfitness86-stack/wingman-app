import React, { useState, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OnboardingProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hometown: string;
  gender: string;
  photoUrl: string;
}

interface NewUserOnboardingProps {
  onComplete: (profile: OnboardingProfile) => void;
  onDismiss: () => void;
  prefillEmail?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "What's your name?",      subtitle: 'How should we introduce you?' },
  { id: 2, title: 'Contact Info',            subtitle: 'So your Wingman can reach you.' },
  { id: 3, title: 'Where are you from?',    subtitle: 'Your city & identity.' },
  { id: 4, title: 'Your Photo',             subtitle: 'Put a face to the name.' },
] as const;

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Prefer not to say'];

function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressDots: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <div className="flex items-center gap-2 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className="h-1 flex-1 rounded-full transition-all duration-500"
        style={{
          background: i < step
            ? 'linear-gradient(90deg,#E040FB,#7B61FF)'
            : 'rgba(255,255,255,0.12)',
        }}
      />
    ))}
  </div>
);

// ─── Field ───────────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div>
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {label} <span style={{ color: '#E040FB' }}>*</span>
    </label>
    {children}
    {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }> = ({
  hasError, ...props
}) => (
  <input
    {...props}
    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
    style={{
      background: 'rgba(255,255,255,0.06)',
      border: `1px solid ${hasError ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
    }}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const NewUserOnboarding: React.FC<NewUserOnboardingProps> = ({
  onComplete,
  onDismiss,
  prefillEmail = '',
}) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName]   = useState('');
  const [lastName,  setLastName]    = useState('');
  const [email,     setEmail]       = useState(prefillEmail);
  const [phone,     setPhone]       = useState('');
  const [hometown,  setHometown]    = useState('');
  const [gender,    setGender]      = useState('');
  const [photoUrl,  setPhotoUrl]    = useState('');
  const [errors,    setErrors]      = useState<Record<string, string>>({});
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const clearErr = (k: string) => setErrors(p => { const n = { ...p }; delete n[k]; return n; });

  // ─── Validation per step ────────────────────────────────────────

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!firstName.trim()) e.firstName = 'First name is required.';
      if (!lastName.trim())  e.lastName  = 'Last name is required.';
    }
    if (step === 2) {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        e.email = 'A valid email is required.';
      if (!phone.trim() || phone.replace(/\D/g, '').length < 7)
        e.phone = 'A valid phone number is required.';
    }
    if (step === 3) {
      if (!hometown.trim()) e.hometown = 'Hometown is required.';
      if (!gender)          e.gender   = 'Please select your gender.';
    }
    if (step === 4) {
      if (!photoUrl) e.photo = 'Please upload a profile photo.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < STEPS.length) { setStep(s => s + 1); return; }
    // All done
    onComplete({ firstName, lastName, email, phone, hometown, gender, photoUrl });
  };

  const back = () => { setErrors({}); setStep(s => Math.max(1, s - 1)); };

  // ─── Photo upload ────────────────────────────────────────────────

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const url = await fileToDataURL(file);
      setPhotoUrl(url);
      clearErr('photo');
    } catch {
      setErrors(p => ({ ...p, photo: 'Could not load image. Try again.' }));
    }
    setPhotoLoading(false);
  };

  // ─── Step content ────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Field label="First Name" error={errors.firstName}>
              <Input
                value={firstName}
                onChange={e => { setFirstName(e.target.value); clearErr('firstName'); }}
                placeholder="John"
                autoFocus
                hasError={!!errors.firstName}
              />
            </Field>
            <Field label="Last Name" error={errors.lastName}>
              <Input
                value={lastName}
                onChange={e => { setLastName(e.target.value); clearErr('lastName'); }}
                placeholder="Doe"
                hasError={!!errors.lastName}
              />
            </Field>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Field label="Email Address" error={errors.email}>
              <Input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearErr('email'); }}
                placeholder="you@example.com"
                hasError={!!errors.email}
              />
            </Field>
            <Field label="Phone Number" error={errors.phone}>
              <Input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); clearErr('phone'); }}
                placeholder="+1 (305) 000-0000"
                hasError={!!errors.phone}
              />
            </Field>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Field label="Hometown / City" error={errors.hometown}>
              <Input
                value={hometown}
                onChange={e => { setHometown(e.target.value); clearErr('hometown'); }}
                placeholder="Miami, FL"
                hasError={!!errors.hometown}
              />
            </Field>
            <Field label="Gender" error={errors.gender}>
              <div className="grid grid-cols-2 gap-2">
                {GENDERS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setGender(g); clearErr('gender'); }}
                    className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={gender === g
                      ? { background: 'linear-gradient(135deg,#E040FB,#7B61FF)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {g}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-[10px] text-red-400 mt-1">{errors.gender}</p>}
            </Field>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {/* Photo preview */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative w-28 h-28 rounded-full flex items-center justify-center overflow-hidden transition-all group"
                style={{
                  background: photoUrl ? 'transparent' : 'rgba(255,255,255,0.06)',
                  border: errors.photo
                    ? '2px dashed rgba(239,68,68,0.6)'
                    : photoUrl
                    ? 'none'
                    : '2px dashed rgba(255,255,255,0.15)',
                }}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : photoLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <div className="text-center">
                    <div className="text-3xl mb-1">📷</div>
                    <p className="text-[10px] text-gray-600">Tap to upload</p>
                  </div>
                )}
                {photoUrl && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-semibold">Change</p>
                  </div>
                )}
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />

              <div className="text-center">
                <p className="text-xs text-gray-500">Upload a clear photo of yourself.</p>
                <p className="text-[10px] text-gray-700 mt-0.5">JPG, PNG — max 5MB</p>
              </div>
              {errors.photo && <p className="text-[10px] text-red-400">{errors.photo}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStep = STEPS[step - 1];

  return (
    // Backdrop
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col"
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -16px 64px rgba(0,0,0,0.9)',
          maxHeight: '92dvh',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">
              Step {step} of {STEPS.length}
            </p>
            <h2
              className="text-xl font-black text-white leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {currentStep.title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{currentStep.subtitle}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-600 hover:text-gray-300 transition-colors text-xs mt-1"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* Progress */}
        <div className="px-6">
          <ProgressDots step={step} total={STEPS.length} />
        </div>

        {/* Content */}
        <div className="px-6 pb-4 flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer */}
        <div
          className="px-6 pb-8 pt-4 flex gap-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#111' }}
        >
          {step > 1 && (
            <button
              onClick={back}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#E040FB,#7B61FF,#00D4FF)', boxShadow: '0 8px 24px rgba(224,64,251,0.3)' }}
          >
            {step === STEPS.length ? '✓ Complete Profile' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Profile Gate Banner ──────────────────────────────────────────────────────
// Shows inline when user tries to pay without a complete profile.

export const ProfileGateBanner: React.FC<{ onSetupProfile: () => void }> = ({ onSetupProfile }) => (
  <div
    className="rounded-2xl p-4 flex items-start gap-3"
    style={{ background: 'rgba(224,64,251,0.08)', border: '1px solid rgba(224,64,251,0.3)' }}
  >
    <span className="text-xl flex-shrink-0">🔒</span>
    <div className="flex-1">
      <p className="text-sm font-bold text-white mb-0.5">Profile Required to Pay</p>
      <p className="text-xs text-gray-400 leading-relaxed">
        Complete your profile before confirming a reservation. It only takes 2 minutes.
      </p>
    </div>
    <button
      onClick={onSetupProfile}
      className="flex-shrink-0 text-[11px] font-bold rounded-full px-3 py-1.5 text-white transition-all"
      style={{ background: 'linear-gradient(135deg,#E040FB,#7B61FF)' }}
    >
      Setup →
    </button>
  </div>
);

// ─── Utility: check if passcode-user profile is complete ─────────────────────

export const ONBOARDING_KEY = 'wm_onboarding_complete';

export function isOnboardingComplete(): boolean {
  try { return localStorage.getItem(ONBOARDING_KEY) === 'true'; }
  catch { return false; }
}

export function markOnboardingComplete(): void {
  try { localStorage.setItem(ONBOARDING_KEY, 'true'); }
  catch {}
}
