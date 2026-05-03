/**
 * WelcomePage.tsx
 * ─────────────────────────────────────────────────────────────
 * Gated entry point for the Wingman platform.
 *
 * States:
 *  - "browse"  — pre-access view, limited event browsing
 *  - "enter"   — passcode + email entry form
 *  - "success" — brief success state before redirect
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  validatePasscode,
  grantPasscodeAccess,
  formatTimeRemaining,
  ACCESS_DURATION_MS,
} from '../utils/accessControl';
import { generateEventFeed } from '../utils/eventSchedule';

// ─── Icons ────────────────────────────────────────────────────

const IcoLock = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const IcoEye = ({ shown }: { shown: boolean }) => shown ? (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const IcoCalendar = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IcoClock = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IcoMenu = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const IcoClose = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IcoShield = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// ─── Wingman Logo ─────────────────────────────────────────────

const WingmanWordmark: React.FC = () => (
  <div className="flex flex-col items-center gap-3 select-none">
    <svg width="44" height="52" viewBox="0 0 48 56" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#738596" />
          <stop offset="100%" stopColor="#1A252C" />
        </linearGradient>
      </defs>
      <path d="M24 2C15.163 2 8 9.163 8 18c0 12.444 16 34 16 34s16-21.556 16-34C40 9.163 32.837 2 24 2z"
        stroke="url(#wg2)" strokeWidth="3" fill="none" />
      <circle cx="24" cy="18" r="5" fill="url(#wg2)" />
      <path d="M14 10 C8 4, 2 6, 4 14 C6 18, 12 18, 14 14"
        stroke="url(#wg2)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
    <div className="text-center">
      <span
        className="text-3xl font-black tracking-widest"
        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.15em' }}
      >
        <span style={{
          background: 'linear-gradient(90deg, #FFFFFF, #738596, #1A252C)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>W</span>
        <span className="text-white">INGMAN</span>
      </span>
      <p className="text-[10px] tracking-[0.4em] text-gray-500 uppercase mt-1">Miami · Private Access</p>
    </div>
  </div>
);

// ─── Preview event card (blurred/restricted) ──────────────────

const PreviewEventCard: React.FC<{ title: string; date: string; time: string; type: string }> = ({ title, date, time, type }) => {
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const typeColor = type === 'Nightclub' ? '#A855F7' : type === 'Dinner' ? '#F59E0B' : '#06B6D4';
  const typeIcon = type === 'Nightclub' ? '🌙' : type === 'Dinner' ? '🍽️' : '⛵';

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Blurred cover placeholder */}
      <div className="h-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl opacity-20">{typeIcon}</div>
        </div>
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="w-4 h-4 text-gray-400"><IcoLock /></div>
            </div>
          </div>
        </div>
        {/* Type badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}>
          {typeIcon} {type}
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-white text-sm mb-2 truncate">{title}</h3>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><IcoCalendar /> {formattedDate}</span>
          <span className="flex items-center gap-1"><IcoClock /> {time}</span>
        </div>
        {/* Hidden details tease */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-12 rounded-full bg-gray-800" />
            <span className="text-[9px] text-gray-700">/ person</span>
          </div>
          <div className="text-[10px] font-bold rounded-full px-2.5 py-1 text-gray-600"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            🔒 Access Required
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PROPS ────────────────────────────────────────────────────

interface WelcomePageProps {
  onAccessGranted: () => void;
  onLoginInstead: () => void;
  onLogin?: (email: string, password: string, stayLoggedIn: boolean) => boolean;
}

// ─── Login Screen ──────────────────────────────────────────────

const LoginScreen: React.FC<{
  onBack: () => void;
  onLogin: (email: string, password: string, stayLoggedIn: boolean) => boolean;
  onForgotPassword: () => void;
}> = ({ onBack, onLogin, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }
    setLoading(true);
    setTimeout(() => {
      const ok = onLogin(email.trim().toLowerCase(), password, stayLoggedIn);
      if (!ok) {
        setError('Email or password not recognised. Please try again.');
      }
      setLoading(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#080808', overflowY: 'auto' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 flex-shrink-0">
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
          ← Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10 text-center">
            <WingmanWordmark />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Welcome Back
            </h1>
            <p className="text-xs text-gray-500">Log in to access your exclusive concierge.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all pr-12"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors">
                  <IcoEye shown={showPw} />
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-[11px] text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-4 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
              style={{
                background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 50%, #374151 100%)',
                color: loading ? '#9CA3AF' : '#000',
              }}>
              {loading ? 'Signing in…' : 'Log In'}
            </button>

            {/* Stay logged in */}
            <label
              className="flex items-center gap-2.5 cursor-pointer mt-3"
              onClick={() => setStayLoggedIn(s => !s)}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={stayLoggedIn
                  ? { background: '#fff', border: '1px solid #fff' }
                  : { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                {stayLoggedIn && (
                  <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[11px] text-gray-500 select-none">Stay logged in</span>
            </label>
          </form>

          <button
            onClick={onForgotPassword}
            className="w-full text-center text-[11px] text-gray-600 hover:text-gray-400 transition-colors mt-5">
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Forgot Password Screen ────────────────────────────────────

const ForgotPasswordScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#080808', overflowY: 'auto' }}>
      <div className="flex items-center px-5 pt-5 pb-2 flex-shrink-0">
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
          ← Back to Login
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center"><WingmanWordmark /></div>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Check Your Email</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                If an account exists for <span className="text-white font-semibold">{email}</span>, you will receive a password reset link shortly.
              </p>
              <p className="text-[10px] text-gray-700">Didn't receive it? Check your spam folder or contact your host.</p>
              <button onClick={onBack}
                className="mt-8 w-full font-bold py-4 rounded-xl text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Forgot Password?
                </h1>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Enter the email linked to your account. We'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                  />
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-3 text-[11px] text-red-400"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold py-4 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
                  style={{
                    background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 50%, #374151 100%)',
                    color: loading ? '#9CA3AF' : '#000',
                  }}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────

export const WelcomePage: React.FC<WelcomePageProps> = ({ onAccessGranted, onLoginInstead, onLogin }) => {
  const [mode, setMode] = useState<'browse' | 'enter' | 'login' | 'forgotPassword' | 'success'>('browse');
  const [prevMode, setPrevMode] = useState<'browse' | 'enter'>('browse');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(ACCESS_DURATION_MS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper: navigate to login, remembering which screen to return to
  const goToLogin = (from: 'browse' | 'enter') => { setPrevMode(from); setMode('login'); };

  // Pre-generate sample events for the preview
  const previewInstances = useMemo(() => {
    try {
      return generateEventFeed({}, {}, 1).slice(0, 6);
    } catch {
      return [];
    }
  }, []);

  // Countdown timer in success state
  useEffect(() => {
    if (mode !== 'success') return;
    const interval = setInterval(() => {
      setCountdown(c => c - 1000);
    }, 1000);
    const timeout = setTimeout(() => {
      onAccessGranted();
    }, 3000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [mode, onAccessGranted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!passcode.trim()) {
      setError('Please enter your access passcode.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (validatePasscode(passcode)) {
        grantPasscodeAccess(email.trim().toLowerCase());
        setMode('success');
      } else {
        setError('Invalid passcode. Please check and try again.');
      }
      setIsSubmitting(false);
    }, 800);
  };

  // ── Login Mode ───────────────────────────────────────────────
  if (mode === 'login') {
    return (
      <LoginScreen
        onBack={() => setMode(prevMode)}
        onLogin={onLogin ?? (() => false)}
        onForgotPassword={() => setMode('forgotPassword')}
      />
    );
  }

  // ── Forgot Password Mode ─────────────────────────────────────
  if (mode === 'forgotPassword') {
    return <ForgotPasswordScreen onBack={() => setMode('login')} />;
  }

  // ── Success State ────────────────────────────────────────────

  if (mode === 'success') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50"
        style={{ background: '#080808' }}>
        <div className="text-center px-8 animate-fade-in">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Access Granted
          </h2>
          <p className="text-gray-400 text-sm mb-6">Welcome to WINGMAN. You have 24 hours.</p>
          <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-white/[0.04] rounded-full px-4 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Redirecting to platform...
          </div>
        </div>
      </div>
    );
  }

  // ── Enter Passcode State ──────────────────────────────────────

  if (mode === 'enter') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: '#080808', overflowY: 'auto' }}
      >
        {/* Back to browse */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2 flex-shrink-0">
          <button
            onClick={() => { setMode('browse'); setError(''); }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            ← Browse
          </button>
          <button
            onClick={() => goToLogin('enter')}
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Already have an account →
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="mb-10 text-center">
              <WingmanWordmark />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <div className="w-7 h-7 text-white"><IcoLock /></div>
              </div>
              <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Enter Your Access Code
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                This platform is invite-only. Enter your email and the passcode you received to unlock access.
              </p>
            </div>

            {/* ── WARNING NOTICE ── */}
            <div
              className="rounded-2xl p-4 mb-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-start gap-3">
                <div className="text-gray-400 flex-shrink-0 mt-0.5"><IcoShield /></div>
                <div>
                  <p className="text-xs font-bold text-gray-300 mb-1">Temporary Access</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Access is temporary. You have <span className="text-white font-semibold">24 hours</span> to create your profile. After that, access will expire and a new passcode will be required.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="wm-email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${error && !email.trim() ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Access Passcode
                </label>
                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    id="wm-passcode"
                    value={passcode}
                    onChange={e => { setPasscode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="••••••••"
                    autoComplete="off"
                    className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all pr-12"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      fontFamily: showPasscode ? 'inherit' : 'monospace',
                      letterSpacing: showPasscode ? 'normal' : '0.15em',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <IcoEye shown={showPasscode} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-[11px] text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-bold py-4 rounded-xl text-white text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
                style={{
                  background: isSubmitting
                    ? 'rgba(255,255,255,0.08)'
                    : 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 50%, #374151 100%)',
                  color: isSubmitting ? '#9CA3AF' : '#000',
                }}
              >
                {isSubmitting ? 'Verifying…' : 'Unlock Access'}
              </button>
            </form>

            <p className="text-center text-[10px] text-gray-700 mt-6">
              Passcode rotates every 6 hours. Contact your host if access has expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Browse / Landing State ────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#080808', overflowY: 'auto' }}>
      
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
        <WingmanWordmark />
        <button
          onClick={() => goToLogin('browse')}
          className="text-xs font-semibold text-gray-500 hover:text-white transition-colors"
        >
          Login
        </button>
      </div>

      {/* Hero section */}
      <div className="px-5 py-8 text-center flex-shrink-0">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold text-gray-400 mb-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          Private Access Network · Miami
        </div>

        <h1
          className="text-4xl font-black text-white leading-tight mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          This is not for<br />
          <span style={{
            background: 'linear-gradient(90deg, #FFFFFF 0%, #738596 60%, #1A252C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>everyone.</span>
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto mb-8">
          WINGMAN is a controlled access network for curated nightlife, private dinners, and yacht experiences in Miami.
        </p>

        {/* CTA */}
        <button
          onClick={() => setMode('enter')}
          className="w-full max-w-xs mx-auto block font-bold py-4 rounded-xl text-black text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #D1D5DB 100%)',
            boxShadow: '0 8px 32px rgba(255,255,255,0.1)',
          }}
        >
          Enter Passcode
        </button>
        <p className="text-[10px] text-gray-700 mt-3">Have a passcode? Unlock full access in seconds.</p>

        {/* Instagram link */}
        <a
          href="https://www.instagram.com/wingman.miami"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-5 group"
          aria-label="Follow Wingman on Instagram"
        >
          <svg
            className="w-5 h-5 transition-opacity group-hover:opacity-100 opacity-40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="white" stroke="none" />
          </svg>
          <span className="text-[11px] text-gray-600 group-hover:text-gray-400 transition-colors tracking-wide">
            @wingman.miami
          </span>
        </a>
      </div>
    </div>
  );
};
