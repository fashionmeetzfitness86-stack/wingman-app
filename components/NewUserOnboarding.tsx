import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OnboardingProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hometown: string;
  gender: string;
  photoUrl: string;
  password: string;
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
  { id: 5, title: 'Create a Password',      subtitle: 'Secure your account for next time.' },
] as const;

const GENDERS = ['Man', 'Woman'];

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

// ─── Photo Crop Editor ────────────────────────────────────────────────────────

const SIZE = 240; // display canvas size (px)
const OUTPUT = 256; // exported image size (px)

const PhotoCropEditor: React.FC<{
  src: string;
  onConfirm: (dataUrl: string) => void;
  onReplace: () => void;
}> = ({ src, onConfirm, onReplace }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);

  // crop state
  const [zoom,    setZoom]    = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotate,  setRotate]  = useState(0); // 0 / 90 / 180 / 270
  const [loaded,  setLoaded]  = useState(false);

  // drag state (refs to avoid stale closure)
  const dragging   = useRef(false);
  const dragStart  = useRef({ x: 0, y: 0 });
  const offsetSnap = useRef({ x: 0, y: 0 });

  // ── Load image ──────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // fit the image inside the crop circle by default
      const rads = (rotate * Math.PI) / 180;
      const cos  = Math.abs(Math.cos(rads));
      const sin  = Math.abs(Math.sin(rads));
      const rotW = img.naturalWidth * cos + img.naturalHeight * sin;
      const rotH = img.naturalWidth * sin + img.naturalHeight * cos;
      const fitZoom = Math.max(SIZE / rotW, SIZE / rotH);
      setZoom(fitZoom);
      setOffsetX(0);
      setOffsetY(0);
      setLoaded(true);
    };
    img.src = src;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // ── Draw canvas ─────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !loaded) return;
    const ctx = canvas.getContext('2d')!;
    const r   = SIZE / 2;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.clip();

    // apply pan + zoom + rotate from centre
    ctx.translate(r + offsetX, r + offsetY);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    // circle border
    ctx.beginPath();
    ctx.arc(r, r, r - 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(224,64,251,0.7)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // crosshair guide lines (subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r, 4); ctx.lineTo(r, SIZE - 4);
    ctx.moveTo(4, r); ctx.lineTo(SIZE - 4, r);
    ctx.stroke();
  }, [zoom, offsetX, offsetY, rotate, loaded]);

  useEffect(() => { draw(); }, [draw]);

  // ── Mouse drag ──────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current  = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetSnap.current = { x: offsetX, y: offsetY };
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    setOffsetX(offsetSnap.current.x + e.clientX - dragStart.current.x);
    setOffsetY(offsetSnap.current.y + e.clientY - dragStart.current.y);
  }, []);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  // ── Touch drag ──────────────────────────────────────────────────
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      offsetSnap.current = { x: offsetX, y: offsetY };
      dragging.current = true;
    }
  };
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging.current || !lastTouch.current || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - lastTouch.current.x;
    const dy = e.touches[0].clientY - lastTouch.current.y;
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setOffsetX(x => x + dx);
    setOffsetY(y => y + dy);
  }, []);
  const onTouchEnd = useCallback(() => { dragging.current = false; }, []);

  // ── Wheel zoom ──────────────────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(5, Math.max(0.3, z - e.deltaY * 0.002)));
  }, []);

  // attach global listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [onMouseMove, onMouseUp, onWheel, onTouchMove, onTouchEnd]);

  // ── Export crop ─────────────────────────────────────────────────
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;
    const out    = document.createElement('canvas');
    out.width    = OUTPUT;
    out.height   = OUTPUT;
    const ctx    = out.getContext('2d')!;
    const r      = OUTPUT / 2;
    const scale  = OUTPUT / SIZE;

    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(r + offsetX * scale, r + offsetY * scale);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(zoom * scale, zoom * scale);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
    onConfirm(out.toDataURL('image/jpeg', 0.88));
  };

  const handleRotate = () => setRotate(r => (r + 90) % 360);
  const handleCenter = () => { setOffsetX(0); setOffsetY(0); };
  const handleFit    = () => {
    const img = imgRef.current;
    if (!img) return;
    const rads = (rotate * Math.PI) / 180;
    const cos  = Math.abs(Math.cos(rads));
    const sin  = Math.abs(Math.sin(rads));
    const rotW = img.naturalWidth * cos + img.naturalHeight * sin;
    const rotH = img.naturalWidth * sin + img.naturalHeight * cos;
    setZoom(Math.max(SIZE / rotW, SIZE / rotH));
    setOffsetX(0);
    setOffsetY(0);
  };
  const handleFill = () => {
    const img = imgRef.current;
    if (!img) return;
    const rads = (rotate * Math.PI) / 180;
    const cos  = Math.abs(Math.cos(rads));
    const sin  = Math.abs(Math.sin(rads));
    const rotW = img.naturalWidth * cos + img.naturalHeight * sin;
    const rotH = img.naturalWidth * sin + img.naturalHeight * cos;
    setZoom(Math.min(SIZE / rotW, SIZE / rotH) * 2.5);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] text-gray-500 text-center">Drag to reposition · Scroll/pinch to zoom</p>

      {/* Canvas crop area */}
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        style={{ cursor: 'grab', borderRadius: '50%', touchAction: 'none', userSelect: 'none' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      />

      {/* Zoom slider */}
      <div className="w-full flex items-center gap-3 px-1">
        <span className="text-gray-600 text-xs">−</span>
        <input
          type="range"
          min={0.3}
          max={5}
          step={0.01}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#E040FB' }}
        />
        <span className="text-gray-600 text-xs">+</span>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-1.5 w-full">
        {[
          { label: '↺ Rotate',  action: handleRotate },
          { label: '⊙ Center',  action: handleCenter },
          { label: '⤢ Fit',     action: handleFit    },
          { label: '⊡ Fill',    action: handleFill   },
        ].map(({ label, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className="py-2 rounded-lg text-[10px] font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Confirm / change */}
      <div className="flex gap-2 w-full">
        <button
          type="button"
          onClick={onReplace}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Change Photo
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#E040FB,#7B61FF)', boxShadow: '0 6px 18px rgba(224,64,251,0.3)' }}
        >
          Use This Photo ✓
        </button>
      </div>
    </div>
  );
};

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
  const [photoUrl,  setPhotoUrl]    = useState('');   // final exported crop
  const [rawPhotoUrl, setRawPhotoUrl] = useState(''); // original upload
  const [errors,    setErrors]      = useState<Record<string, string>>({});
  const [photoLoading, setPhotoLoading] = useState(false);
  const [password,    setPassword]    = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (step === 5) {
      if (password.length < 8)        e.password  = 'Password must be at least 8 characters.';
      if (password !== confirmPw)      e.confirmPw = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < STEPS.length) { setStep(s => s + 1); return; }
    // All done — save password then call onComplete
    saveUserPassword(email.trim().toLowerCase(), password);
    onComplete({ firstName, lastName, email, phone, hometown, gender, photoUrl, password });
  };

  const back = () => { setErrors({}); setStep(s => Math.max(1, s - 1)); };

  // ─── Photo upload ────────────────────────────────────────────────

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const url = await fileToDataURL(file);
      setRawPhotoUrl(url);
      setPhotoUrl(''); // reset confirmed crop when new file is picked
      clearErr('photo');
    } catch {
      setErrors(p => ({ ...p, photo: 'Could not load image. Try again.' }));
    }
    setPhotoLoading(false);
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    setPhotoUrl(croppedDataUrl);
    clearErr('photo');
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
          <div className="space-y-3">
            {/* No image yet — show upload prompt */}
            {!rawPhotoUrl && (
              <div className="flex flex-col items-center gap-4 py-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: errors.photo ? '2px dashed rgba(239,68,68,0.5)' : '2px dashed rgba(255,255,255,0.15)',
                  }}
                >
                  {photoLoading
                    ? <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><div className="text-4xl mb-1">📷</div><p className="text-[10px] text-gray-500">Tap to upload</p></>}
                </button>
                <p className="text-[11px] text-gray-500">JPG, PNG — max 5MB</p>
                {errors.photo && <p className="text-[10px] text-red-400">{errors.photo}</p>}
              </div>
            )}

            {/* Crop editor — shown when image is loaded but not yet confirmed */}
            {rawPhotoUrl && !photoUrl && (
              <PhotoCropEditor
                src={rawPhotoUrl}
                onConfirm={handleCropConfirm}
                onReplace={() => { setRawPhotoUrl(''); setTimeout(() => fileRef.current?.click(), 50); }}
              />
            )}

            {/* Confirmed preview — show after crop is accepted */}
            {photoUrl && (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-28 h-28 rounded-full overflow-hidden"
                  style={{ border: '3px solid rgba(224,64,251,0.6)', boxShadow: '0 0 20px rgba(224,64,251,0.3)' }}
                >
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-semibold text-green-400">✓ Photo confirmed</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setPhotoUrl(''); }}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    ← Re-crop
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPhotoUrl(''); setRawPhotoUrl(''); setTimeout(() => fileRef.current?.click(), 50); }}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Change Photo
                  </button>
                </div>
                {errors.photo && <p className="text-[10px] text-red-400">{errors.photo}</p>}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>
        );

      case 5: {
        const pwStrength = password.length === 0 ? 0
          : password.length < 8 ? 1
          : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 : 2;
        const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
        const strengthColor = ['', '#EF4444', '#F59E0B', '#22C55E'];
        return (
          <div className="space-y-4">
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearErr('password'); clearErr('confirmPw'); }}
                  placeholder="Min. 8 characters"
                  hasError={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= pwStrength ? strengthColor[pwStrength] : 'rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: strengthColor[pwStrength] }}>
                    {strengthLabel[pwStrength]}
                  </span>
                </div>
              )}
            </Field>
            <Field label="Confirm Password" error={errors.confirmPw}>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); clearErr('confirmPw'); }}
                  placeholder="Repeat your password"
                  hasError={!!errors.confirmPw}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
            </Field>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              This password will let you log back in without a passcode next time.
            </p>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const currentStep = STEPS[step - 1];

  return (
    // Backdrop
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl flex flex-col"
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -16px 64px rgba(0,0,0,0.9)',
          maxHeight: '85vh',
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

// ─── Password storage (keyed by lowercase email) ─────────────────────────────

const PW_STORE_KEY = 'wm_passwords';

export function saveUserPassword(email: string, password: string): void {
  try {
    const store: Record<string, string> = JSON.parse(localStorage.getItem(PW_STORE_KEY) ?? '{}');
    store[email.trim().toLowerCase()] = password;
    localStorage.setItem(PW_STORE_KEY, JSON.stringify(store));
  } catch {}
}

export function verifyUserPassword(email: string, password: string): boolean {
  try {
    const store: Record<string, string> = JSON.parse(localStorage.getItem(PW_STORE_KEY) ?? '{}');
    return store[email.trim().toLowerCase()] === password;
  } catch { return false; }
}

export function hasUserPassword(email: string): boolean {
  try {
    const store: Record<string, string> = JSON.parse(localStorage.getItem(PW_STORE_KEY) ?? '{}');
    return !!store[email.trim().toLowerCase()];
  } catch { return false; }
}
