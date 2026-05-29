import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const WingmanWordmark: React.FC = () => (
  <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>
    WINGMAN
  </h1>
);

interface ResetPasswordScreenProps {
  onDone: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onDone }) => {
  const [phase, setPhase] = useState<'verifying' | 'invalid' | 'ready' | 'saving' | 'success'>('verifying');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    let mounted = true;

    const finishUrl = () => {
      if (window.location.pathname === '/reset-password') {
        window.history.replaceState({}, '', '/reset-password');
      }
    };

    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' && session) {
        setPhase('ready');
        finishUrl();
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) {
        setPhase((p) => (p === 'verifying' ? 'ready' : p));
      } else {
        setTimeout(() => {
          if (!mounted) return;
          setPhase((p) => (p === 'verifying' ? 'invalid' : p));
        }, 1500);
      }
    });

    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setPhase('saving');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || 'Could not update password.');
      setPhase('ready');
      return;
    }
    await supabase.auth.signOut();
    setPhase('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#080808', overflowY: 'auto' }}>
      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center"><WingmanWordmark /></div>

          {phase === 'verifying' && (
            <p className="text-center text-sm text-gray-500">Verifying reset link…</p>
          )}

          {phase === 'invalid' && (
            <div className="text-center">
              <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Link Expired or Invalid
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                This password reset link is no longer valid. Request a new one from the login screen.
              </p>
              <button
                onClick={onDone}
                className="w-full font-bold py-4 rounded-xl text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
                Back to Login
              </button>
            </div>
          )}

          {phase === 'success' && (
            <div className="text-center">
              <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Password Updated
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                You can now sign in with your new password.
              </p>
              <button
                onClick={onDone}
                className="w-full font-bold py-4 rounded-xl text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 50%, #374151 100%)', color: '#000' }}>
                Go to Login
              </button>
            </div>
          )}

          {(phase === 'ready' || phase === 'saving') && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Set a New Password
                </h1>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Choose a password you haven't used before. At least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="w-full rounded-xl px-4 py-3.5 pr-16 text-sm text-white placeholder-gray-600 outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400 hover:text-white">
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
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
                  disabled={phase === 'saving'}
                  className="w-full font-bold py-4 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
                  style={{
                    background: phase === 'saving' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 50%, #374151 100%)',
                    color: phase === 'saving' ? '#9CA3AF' : '#000',
                  }}>
                  {phase === 'saving' ? 'Saving…' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
