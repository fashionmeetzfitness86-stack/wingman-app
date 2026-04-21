/**
 * AccessControlTab.tsx
 * ─────────────────────────────────────────────────────────────
 * Admin panel for managing the platform's gated access system.
 * Allows the admin to:
 *  - View the current active passcode
 *  - Update the passcode (cycles every 6 hours)
 *  - See who has active passcode sessions
 *  - Monitor access expiry
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdminPasscode,
  setAdminPasscode,
  getPasscodeLastUpdated,
} from '../../utils/accessControl';

// ─── Icons ───────────────────────────────────────────────────

const IcoRefresh = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IcoCopy = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const IcoShield = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IcoCheck = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IcoKey = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const IcoClock = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ─── Utils ────────────────────────────────────────────────────

function generateRandomPasscode(): string {
  const words = ['MIAMI', 'NIGHT', 'WING', 'VIP', 'ACCESS', 'ELITE', 'PRIV', 'LUXE', 'NOIR', 'CLUB'];
  const numbers = String(Math.floor(Math.random() * 900) + 100);
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}${numbers}`;
}

function formatRelativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  return `${diffHours}h ago`;
}

function getNextRotationTime(lastUpdated: number | null): string {
  if (!lastUpdated) return 'First rotation pending';
  const nextAt = lastUpdated + 6 * 60 * 60 * 1000;
  const diffMs = nextAt - Date.now();
  if (diffMs <= 0) return 'Overdue — update now';
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  return `Next rotation in ${h}h ${m}m`;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────

export const AccessControlTab: React.FC = () => {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentCode, setShowCurrentCode] = useState(false);
  const [nextRotationLabel, setNextRotationLabel] = useState('');

  const refresh = useCallback(() => {
    setCurrentCode(getAdminPasscode());
    setLastUpdated(getPasscodeLastUpdated());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const update = () => setNextRotationLabel(getNextRotationTime(lastUpdated));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSave = () => {
    setError('');
    const trimmed = newCode.trim().toUpperCase();
    if (!trimmed) {
      setError('Passcode cannot be empty.');
      return;
    }
    if (trimmed.length < 6) {
      setError('Passcode must be at least 6 characters.');
      return;
    }
    if (trimmed.length > 20) {
      setError('Passcode must be 20 characters or fewer.');
      return;
    }
    if (!/^[A-Z0-9]+$/.test(trimmed)) {
      setError('Only letters and numbers are allowed.');
      return;
    }
    setAdminPasscode(trimmed);
    refresh();
    setNewCode('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGenerateRandom = () => {
    setNewCode(generateRandomPasscode());
  };

  const isOverdue = lastUpdated ? Date.now() - lastUpdated > 6 * 60 * 60 * 1000 : false;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-white"><IcoShield /></div>
        </div>
        <div>
          <h2 className="text-lg font-black text-white">Access Control</h2>
          <p className="text-xs text-gray-500">Manage platform entry passcode and access sessions</p>
        </div>
      </div>

      {/* ── CURRENT PASSCODE ──────────────────────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-gray-400"><IcoKey /></div>
            <p className="text-sm font-bold text-white">Current Passcode</p>
          </div>
          <div className="flex items-center gap-2">
            {isOverdue && (
              <span className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-full px-2 py-0.5 animate-pulse">
                Rotation Overdue
              </span>
            )}
            <div className="flex items-center gap-1 text-[10px] text-gray-600">
              <IcoClock />
              {lastUpdated ? formatRelativeTime(lastUpdated) : 'Default'}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between mb-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', fontFamily: 'monospace' }}
        >
          <span className="text-lg font-black text-white tracking-[0.3em]">
            {showCurrentCode ? currentCode : '•'.repeat(currentCode.length)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCurrentCode(!showCurrentCode)}
              className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showCurrentCode ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <IcoCheck /> : <IcoCopy />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <p className="text-[11px] text-gray-500">{nextRotationLabel}</p>
        </div>
      </div>

      {/* ── UPDATE PASSCODE ───────────────────────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-sm font-bold text-white mb-4">Update Passcode</p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              id="admin-passcode-input"
              value={newCode}
              onChange={e => { setNewCode(e.target.value.toUpperCase()); setError(''); setSaved(false); }}
              placeholder="Enter new passcode…"
              maxLength={20}
              className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
              }}
            />
            <button
              onClick={handleGenerateRandom}
              title="Generate random passcode"
              className="px-3 rounded-xl transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <IcoRefresh className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {error && (
            <p className="text-[11px] text-red-400">{error}</p>
          )}

          <div
            className="rounded-xl px-4 py-3 text-[11px] text-gray-500"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ul className="space-y-0.5">
              <li>• Letters and numbers only (no spaces)</li>
              <li>• 6 – 20 characters</li>
              <li>• Paste the code to your private channel after updating</li>
            </ul>
          </div>

          <button
            onClick={handleSave}
            className="w-full font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]"
            style={saved
              ? { background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }
              : { background: 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 100%)', color: '#000' }
            }
          >
            {saved ? '✓ Passcode Updated' : 'Set New Passcode'}
          </button>
        </div>
      </div>

      {/* ── ACCESS RULES ─────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-sm font-bold text-white mb-4">Access System Rules</p>
        <div className="space-y-3">
          {[
            { icon: '🔐', label: 'Entry Requirements', desc: 'Email + passcode required to unlock platform' },
            { icon: '⏱️', label: 'Passcode Sessions', desc: 'Each passcode unlocks 24 hours of access' },
            { icon: '🔄', label: 'Passcode Rotation', desc: 'Rotate every 6 hours for maximum exclusivity' },
            { icon: '👤', label: 'Account Creation', desc: 'Creating an account grants permanent access (no passcode needed)' },
            { icon: '👁️', label: 'Pre-Access Preview', desc: 'Visitors can see event titles & dates only — prices and booking are hidden' },
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-base flex-shrink-0">{rule.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-300">{rule.label}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
