
import React from 'react';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CookieIcon } from './icons/CookieIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { Page } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { useTheme } from '../contexts/ThemeContext';

const EYE_ACCENT    = '#7B61FF'; // violet
const DANGER_ACCENT = '#ef4444'; // red
const COOKIE_ACCENT = '#F59E0B'; // amber
const USAGE_ACCENT  = '#00D4FF'; // cyan

interface PrivacyPageProps {
  onNavigate: (page: Page) => void;
  onDeleteAccountRequest: () => void;
}

const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <p
    className="text-[10px] font-bold uppercase tracking-widest px-1 pt-5 pb-2"
    style={{ color: 'var(--color-text-sub)', letterSpacing: '0.12em' }}
  >
    {title}
  </p>
);

const SettingRow: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}> = ({ icon, iconColor, title, description, onClick, variant = 'default' }) => {
  const isDanger = variant === 'danger';
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      aria-label={title}
      className="group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left"
      style={{
        background: isDanger ? 'rgba(239,68,68,0.05)' : 'var(--settings-row-bg)',
        border: isDanger ? '1px solid rgba(239,68,68,0.18)' : '1px solid var(--settings-row-border)',
      }}
      onMouseEnter={onClick ? (e: any) => {
        e.currentTarget.style.background = isDanger ? 'rgba(239,68,68,0.10)' : 'var(--settings-row-hover)';
      } : undefined}
      onMouseLeave={onClick ? (e: any) => {
        e.currentTarget.style.background = isDanger ? 'rgba(239,68,68,0.05)' : 'var(--settings-row-bg)';
      } : undefined}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `${iconColor}18`,
          border: `1px solid ${iconColor}30`,
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className="text-sm font-bold block leading-tight"
          style={{ color: isDanger ? DANGER_ACCENT : 'var(--color-text)' }}
        >
          {title}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      </div>
      <ChevronRightIcon
        className="w-4 h-4 flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ color: isDanger ? DANGER_ACCENT : 'var(--color-text-muted)' } as any}
      />
    </button>
  );
};

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate, onDeleteAccountRequest }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen pb-32 animate-fade-in" style={{ background: 'transparent' }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 px-4 pt-5 pb-4"
        style={{
          background: isDark ? 'rgba(8,8,10,0.92)' : 'rgba(250,248,245,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => onNavigate('settings')}
          className="inline-flex items-center gap-2 transition-colors mb-4 text-sm font-semibold"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Back to Settings"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Settings
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-black"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-text)' }}
            >
              Privacy &amp; Data
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-sub)' }}>
              Data, visibility &amp; permissions
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `${EYE_ACCENT}18`,
              border: `1px solid ${EYE_ACCENT}30`,
              color: EYE_ACCENT,
            }}
          >
            {/* Eye icon */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2">
        {/* Your Data */}
        <SectionLabel title="Your Data" />
        <div className="space-y-2">
          <SettingRow
            icon={<DownloadIcon className="w-4.5 h-4.5" />}
            iconColor={EYE_ACCENT}
            title="Export Your Data"
            description="Request a copy of your personal data."
            onClick={() => onNavigate('dataExport')}
          />
          <SettingRow
            icon={<TrashIcon className="w-4.5 h-4.5" />}
            iconColor={DANGER_ACCENT}
            title="Delete Your Account"
            description="Permanently delete your account and all associated data."
            onClick={onDeleteAccountRequest}
            variant="danger"
          />
        </div>

        {/* Cookies & Usage */}
        <SectionLabel title="Cookies &amp; Usage" />
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--color-border)', background: 'var(--settings-row-bg)' }}
        >
          {[
            {
              icon: <CookieIcon className="w-4.5 h-4.5" />,
              iconColor: COOKIE_ACCENT,
              title: 'Manage Cookies',
              description: 'Control your cookie settings and data collection.',
              onClick: () => onNavigate('cookieSettings'),
            },
            {
              icon: <ChartBarIcon className="w-4.5 h-4.5" />,
              iconColor: USAGE_ACCENT,
              title: 'Data Usage Report',
              description: 'View a report of your data usage within the app.',
              onClick: undefined,
            },
          ].map((item, i, arr) => (
            <div
              key={item.title}
              style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}
            >
              <button
                onClick={item.onClick}
                disabled={!item.onClick}
                aria-label={item.title}
                className="group w-full flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[0.02] text-left"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.iconColor}18`, border: `1px solid ${item.iconColor}30`, color: item.iconColor }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.description}</p>
                </div>
                <ChevronRightIcon
                  className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity"
                  style={{ color: 'var(--color-text-muted)' } as any}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Info callout */}
        <div
          className="mt-6 rounded-2xl p-4 flex items-start gap-3"
          style={{ background: `${EYE_ACCENT}08`, border: `1px solid ${EYE_ACCENT}18` }}
        >
          <span className="text-lg mt-0.5">🔒</span>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Your data stays yours</p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Wingman never sells your personal data. You can export or delete it at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
