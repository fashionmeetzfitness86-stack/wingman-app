
import React, { useState } from 'react';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ChangePasswordModal } from './modals/ChangePasswordModal';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { Page } from '../types';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { KeyIcon } from './icons/KeyIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { useTheme } from '../contexts/ThemeContext';

interface SecurityPageProps {
  onNavigate: (page: Page) => void;
}

const SECURITY_ACCENT = '#7B61FF'; // violet
const DEVICE_ACCENT   = '#00D4FF'; // cyan
const ACTIVITY_ACCENT = '#4ade80'; // green

const SettingRow: React.FC<{
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
  isButton?: boolean;
  onClick?: () => void;
}> = ({ label, sublabel, icon, iconColor = SECURITY_ACCENT, children, isButton, onClick }) => {
  const Tag = isButton ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className="group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left"
      style={{
        background: 'var(--settings-row-bg)',
        border: '1px solid var(--settings-row-border)',
      }}
      onMouseEnter={isButton ? (e: any) => { e.currentTarget.style.background = 'var(--settings-row-hover)'; } : undefined}
      onMouseLeave={isButton ? (e: any) => { e.currentTarget.style.background = 'var(--settings-row-bg)'; } : undefined}
      aria-label={isButton ? label : undefined}
    >
      {icon && (
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
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold block leading-tight" style={{ color: 'var(--color-text)' }}>
          {label}
        </span>
        {sublabel && (
          <span className="text-xs mt-0.5 block" style={{ color: 'var(--color-text-muted)' }}>
            {sublabel}
          </span>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </Tag>
  );
};

const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <p
    className="text-[10px] font-bold uppercase tracking-widest px-1 pt-5 pb-2"
    style={{ color: 'var(--color-text-sub)', letterSpacing: '0.12em' }}
  >
    {title}
  </p>
);

const ActivityRow: React.FC<{ primary: string; secondary: string; accentColor?: string }> = ({
  primary,
  secondary,
  accentColor = ACTIVITY_ACCENT,
}) => (
  <button
    className="group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left"
    style={{
      background: 'var(--settings-row-bg)',
      border: '1px solid var(--settings-row-border)',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--settings-row-hover)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--settings-row-bg)'; }}
    aria-label={`${primary} — ${secondary}`}
  >
    <div
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}88` }}
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{primary}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{secondary}</p>
    </div>
    <ChevronRightIcon
      className="w-4 h-4 flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity"
      style={{ color: 'var(--color-text-muted)' } as any}
    />
  </button>
);

export const SecurityPage: React.FC<SecurityPageProps> = ({ onNavigate }) => {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
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
                Security
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-sub)' }}>
                Password &amp; authentication
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `${SECURITY_ACCENT}18`,
                border: `1px solid ${SECURITY_ACCENT}30`,
                color: SECURITY_ACCENT,
              }}
            >
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="px-4 pt-2">
          {/* Password */}
          <SectionLabel title="Password" />
          <div className="space-y-2">
            <SettingRow
              label="Change Password"
              sublabel="Update your account password"
              icon={<KeyIcon className="w-4.5 h-4.5" />}
              iconColor={SECURITY_ACCENT}
              isButton
              onClick={() => setIsChangePasswordModalOpen(true)}
            >
              <ChevronRightIcon
                className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity"
                style={{ color: 'var(--color-text-muted)' } as any}
              />
            </SettingRow>
          </div>

          {/* 2FA */}
          <SectionLabel title="Two-Factor Authentication" />
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', background: 'var(--settings-row-bg)' }}
          >
            <div className="flex items-center gap-4 px-4 py-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${SECURITY_ACCENT}18`,
                  border: `1px solid ${SECURITY_ACCENT}30`,
                  color: SECURITY_ACCENT,
                }}
              >
                <ShieldCheckIcon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  Two-Factor Authentication
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {is2FAEnabled ? 'Your account is extra secure' : 'Add an extra layer of protection'}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {is2FAEnabled && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:block"
                    style={{
                      background: 'rgba(74,222,128,0.12)',
                      color: '#4ade80',
                      border: '1px solid rgba(74,222,128,0.25)',
                    }}
                  >
                    Active
                  </span>
                )}
                <ToggleSwitch
                  checked={is2FAEnabled}
                  onChange={() => setIs2FAEnabled(!is2FAEnabled)}
                  label="Enable Two-Factor Authentication"
                />
              </div>
            </div>
          </div>

          {/* Login Activity */}
          <SectionLabel title="Login Activity" />
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', background: 'var(--settings-row-bg)' }}
          >
            {[
              { primary: 'Today, 10:30 AM', secondary: 'Los Angeles, CA · Current session' },
              { primary: 'Yesterday, 8:15 PM', secondary: 'New York, NY', accentColor: DEVICE_ACCENT },
            ].map((item, i, arr) => (
              <div
                key={item.primary}
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[0.02] cursor-pointer group"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                role="button"
                aria-label={`${item.primary} — ${item.secondary}`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: item.accentColor ?? ACTIVITY_ACCENT,
                    boxShadow: `0 0 6px ${(item.accentColor ?? ACTIVITY_ACCENT)}88`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{item.primary}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.secondary}</p>
                </div>
                <ChevronRightIcon
                  className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity"
                  style={{ color: 'var(--color-text-muted)' } as any}
                />
              </div>
            ))}
          </div>

          {/* Connected Devices */}
          <SectionLabel title="Connected Devices" />
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', background: 'var(--settings-row-bg)' }}
          >
            {[
              { primary: 'iPhone 14 Pro', secondary: 'Last active: Today, 10:30 AM' },
              { primary: 'MacBook Pro', secondary: 'Last active: Yesterday, 8:15 PM', accentColor: DEVICE_ACCENT },
            ].map((item, i, arr) => (
              <div
                key={item.primary}
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[0.02] cursor-pointer group"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                role="button"
                aria-label={item.primary}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{
                    background: `${DEVICE_ACCENT}12`,
                    border: `1px solid ${DEVICE_ACCENT}25`,
                    color: DEVICE_ACCENT,
                  }}
                >
                  {item.primary.toLowerCase().includes('iphone') ? '📱' : '💻'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{item.primary}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.secondary}</p>
                </div>
                <ChevronRightIcon
                  className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity"
                  style={{ color: 'var(--color-text-muted)' } as any}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
};
