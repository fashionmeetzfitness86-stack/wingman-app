import React from 'react';
import { Page, User } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ShieldIcon, EyeIcon, QuestionMarkCircleIcon, FlagIcon } from './icons/FeatureIcons';
import { BellIcon } from './icons/BellIcon';
import { MoonIcon } from './icons/MoonIcon';
import { useTheme } from '../contexts/ThemeContext';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { UserSwitchIcon } from './icons/UserSwitchIcon';

interface SettingsPageProps {
  onNavigate: (page: Page) => void;
  users?: User[];
  onSwitchUser?: (user: User) => void;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const SettingsRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  right?: React.ReactNode;
  accent?: string;
  isDark: boolean;
}> = ({ icon, label, sublabel, onClick, right, accent = 'var(--settings-icon-color)', isDark }) => (
  <button
    onClick={onClick}
    className="group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left"
    style={{
      background: 'var(--settings-row-bg)',
      border: '1px solid var(--settings-row-border)',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--settings-row-hover)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--settings-row-bg)'; }}
  >
    {/* Icon bubble */}
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
      style={{
        background: `${accent}18`,
        border: `1px solid ${accent}30`,
        color: accent,
      }}
    >
      {icon}
    </div>

    {/* Label */}
    <div className="flex-1 min-w-0">
      <span
        className="text-sm font-semibold block leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        {label}
      </span>
      {sublabel && (
        <span className="text-xs mt-0.5 block" style={{ color: 'var(--color-text-muted)' }}>
          {sublabel}
        </span>
      )}
    </div>

    {/* Right slot */}
    {right ?? (
      onClick && (
        <ChevronRightIcon
          className="w-4 h-4 flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-text-muted)' } as any}
        />
      )
    )}
  </button>
);

const SectionLabel: React.FC<{ title: string; isDark: boolean }> = ({ title, isDark }) => (
  <p
    className="text-[10px] font-bold uppercase tracking-widest px-1 pt-5 pb-2"
    style={{ color: 'var(--color-text-sub)', letterSpacing: '0.12em' }}
  >
    {title}
  </p>
);

// ─── Main ──────────────────────────────────────────────────────────────────────

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, users, onSwitchUser }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Per-section accent colours
  const GENERAL_ACCENT  = isDark ? '#7B61FF' : '#7B1FA2';  // violet / deep plum
  const PAYMENT_ACCENT  = isDark ? '#00D4FF' : '#0288D1';  // cyan / sky blue
  const APPEAR_ACCENT   = isDark ? '#E040FB' : '#9C27B0';  // magenta / purple
  const SUPPORT_ACCENT  = isDark ? '#4ade80' : '#15803D';  // green

  return (
    <div
      className="min-h-screen pb-32 animate-fade-in"
      style={{ background: 'var(--color-background)' }}
    >
      {/* ── Sticky header ──────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-5 pt-5 pb-4"
        style={{
          background: isDark ? 'rgba(8,8,10,0.94)' : 'rgba(250,248,245,0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid var(--color-border)`,
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => onNavigate('back' as Page)}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="flex items-end justify-between mt-2">
          <h1
            className="text-2xl font-black"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-text)' }}
          >
            Settings
          </h1>
          {/* Theme badge */}
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: isDark ? 'rgba(224,64,251,0.12)' : 'rgba(123,31,162,0.1)',
              color: isDark ? '#E040FB' : '#7B1FA2',
              border: isDark ? '1px solid rgba(224,64,251,0.25)' : '1px solid rgba(123,31,162,0.2)',
            }}
          >
            {isDark ? '⚡ Electric Night' : '☀️ Golden Hour'}
          </span>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="px-5 pt-2">

        {/* ── GENERAL ─────────────────────────────────────────── */}
        <SectionLabel title="General" isDark={isDark} />
        <div className="space-y-2">
          <SettingsRow
            isDark={isDark}
            accent={GENERAL_ACCENT}
            icon={<ShieldIcon className="w-4.5 h-4.5" />}
            label="Security"
            sublabel="Password & authentication"
            onClick={() => onNavigate('security')}
          />
          <SettingsRow
            isDark={isDark}
            accent={GENERAL_ACCENT}
            icon={<EyeIcon className="w-4.5 h-4.5" />}
            label="Privacy"
            sublabel="Data, visibility & permissions"
            onClick={() => onNavigate('privacy')}
          />
          <SettingsRow
            isDark={isDark}
            accent={GENERAL_ACCENT}
            icon={<BellIcon className="w-4.5 h-4.5" />}
            label="Notifications"
            sublabel="Push, email & SMS preferences"
            onClick={() => onNavigate('notificationsSettings')}
          />
        </div>

        {/* ── PAYMENTS ─────────────────────────────────────────── */}
        <SectionLabel title="Payments" isDark={isDark} />
        <div className="space-y-2">
          <SettingsRow
            isDark={isDark}
            accent={PAYMENT_ACCENT}
            icon={<CreditCardIcon className="w-4.5 h-4.5" />}
            label="Payment Methods"
            sublabel="Manage cards & billing"
            onClick={() => onNavigate('paymentMethods')}
          />
        </div>

        {/* ── APPEARANCE ───────────────────────────────────────── */}
        <SectionLabel title="Appearance" isDark={isDark} />
        <div className="space-y-2">
          {/* Dark mode toggle — full custom row */}
          <div
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl"
            style={{
              background: 'var(--settings-row-bg)',
              border: `1px solid var(--settings-row-border)`,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${APPEAR_ACCENT}18`,
                border: `1px solid ${APPEAR_ACCENT}30`,
                color: APPEAR_ACCENT,
              }}
            >
              <MoonIcon className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
                Dark Mode
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {isDark
                  ? 'Electric Night — neon on deep black'
                  : 'Golden Hour — warm ivory & plum'}
              </p>
            </div>
            {/* The toggle pill acts as the entire right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-[10px] font-bold hidden sm:block"
                style={{ color: 'var(--color-text-sub)' }}
              >
                {isDark ? 'Dark' : 'Light'}
              </span>
              <ToggleSwitch checked={isDark} onChange={toggleTheme} label="Dark Mode" />
            </div>
          </div>

          {/* Theme preview pill strip */}
          <div
            className="flex gap-2 px-4 py-3 rounded-2xl"
            style={{
              background: 'var(--settings-row-bg)',
              border: '1px solid var(--settings-row-border)',
            }}
          >
            {/* Dark preview */}
            <div
              className="flex-1 flex flex-col items-center gap-1.5 py-2 px-3 rounded-xl cursor-pointer transition-all"
              onClick={() => { if (!isDark) toggleTheme(); }}
              style={{
                background: isDark
                  ? 'rgba(224,64,251,0.1)'
                  : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(224,64,251,0.3)' : '1px solid rgba(0,0,0,0.07)',
              }}
            >
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: '#E040FB' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#7B61FF' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#00D4FF' }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: isDark ? '#E040FB' : 'var(--color-text-sub)' }}>
                ⚡ Electric Night
              </span>
              <div className="w-full h-4 rounded" style={{ background: '#08080A', border: '1px solid rgba(255,255,255,0.07)' }} />
            </div>

            {/* Light preview */}
            <div
              className="flex-1 flex flex-col items-center gap-1.5 py-2 px-3 rounded-xl cursor-pointer transition-all"
              onClick={() => { if (isDark) toggleTheme(); }}
              style={{
                background: !isDark
                  ? 'rgba(123,31,162,0.08)'
                  : 'rgba(255,255,255,0.03)',
                border: !isDark ? '1px solid rgba(123,31,162,0.25)' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: '#7B1FA2' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#9C27B0' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#0288D1' }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: !isDark ? '#7B1FA2' : 'var(--color-text-sub)' }}>
                ☀️ Golden Hour
              </span>
              <div className="w-full h-4 rounded" style={{ background: '#FAF8F5', border: '1px solid rgba(0,0,0,0.07)' }} />
            </div>
          </div>
        </div>

        {/* ── SUPPORT ──────────────────────────────────────────── */}
        <SectionLabel title="Support" isDark={isDark} />
        <div className="space-y-2">
          <SettingsRow
            isDark={isDark}
            accent={SUPPORT_ACCENT}
            icon={<QuestionMarkCircleIcon className="w-4.5 h-4.5" />}
            label="Help & Support"
            sublabel="FAQs, contact & guides"
            onClick={() => onNavigate('help')}
          />
          <SettingsRow
            isDark={isDark}
            accent="#ef4444"
            icon={<FlagIcon className="w-4.5 h-4.5" />}
            label="Report an Issue"
            sublabel="Flag a bug or concern"
            onClick={() => onNavigate('reportIssue')}
          />
        </div>

        {/* ── DEVELOPER / DEBUG (admin only) ─────────────────── */}
        {users && onSwitchUser && (
          <>
            <SectionLabel title="Developer / Debug" isDark={isDark} />
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'var(--settings-row-bg)',
                border: '1px solid var(--settings-row-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <UserSwitchIcon className="w-4 h-4" style={{ color: 'var(--settings-icon-color)' } as any} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  Switch Account
                </h3>
              </div>
              <div className="space-y-1">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--settings-row-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <img
                      src={u.profilePhoto}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      style={{ border: '1.5px solid var(--color-border-strong)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>
                        {u.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {u.accessLevel} · {u.role}
                      </p>
                    </div>
                    <ChevronRightIcon className="w-3.5 h-3.5 opacity-30 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
