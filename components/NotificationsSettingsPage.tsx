
import React, { useState } from 'react';
import { Page } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ToggleSwitch } from './ui/ToggleSwitch';

interface NotificationSettings {
  eventAnnouncements: boolean;
  bookingUpdates: boolean;
  recommendations: boolean;
  promotionalOffers: boolean;
  communityActivity: boolean;
  friendActivity: boolean;
}

interface NotificationsSettingsPageProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  onNavigate: (page: Page) => void;
  pushEnabled?: boolean;
  onEnablePush?: () => void;
}

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const CalIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const GiftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);
const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

interface SettingItem {
  key: keyof NotificationSettings;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
}

const SETTINGS_GROUPS: { label: string; items: SettingItem[] }[] = [
  {
    label: 'Events & Bookings',
    items: [
      {
        key: 'eventAnnouncements',
        icon: <CalIcon className="w-5 h-5" />,
        iconColor: '#FFFFFF',
        title: 'Event Announcements',
        description: 'New events, exclusive drops & last-minute spots.',
      },
      {
        key: 'bookingUpdates',
        icon: <CheckIcon className="w-5 h-5" />,
        iconColor: '#22C55E',
        title: 'Booking Updates',
        description: 'Confirmations, reminders, and status changes.',
      },
    ],
  },
  {
    label: 'Personalized',
    items: [
      {
        key: 'recommendations',
        icon: <SparkleIcon className="w-5 h-5" />,
        iconColor: '#9CA3AF',
        title: 'AI Recommendations',
        description: 'Curated picks from your AI concierge, Gaby.',
      },
      {
        key: 'promotionalOffers',
        icon: <GiftIcon className="w-5 h-5" />,
        iconColor: '#F59E0B',
        title: 'Exclusive Offers',
        description: 'Members-only deals and promotional access.',
      },
      {
        key: 'friendActivity',
        icon: <HeartIcon className="w-5 h-5" />,
        iconColor: '#FFFFFF',
        title: 'Friend Activity',
        description: 'When friends book an event or join the platform.',
      },
      {
        key: 'communityActivity',
        icon: <UsersIcon className="w-5 h-5" />,
        iconColor: '#374151',
        title: 'Community Activity',
        description: 'Comments, reactions, and community highlights.',
      },
    ],
  },
];

export const NotificationsSettingsPage: React.FC<NotificationsSettingsPageProps> = ({
  settings,
  onSettingsChange,
  onNavigate,
  pushEnabled = false,
  onEnablePush,
}) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>({
    promotionalOffers: false,
    communityActivity: false,
    friendActivity: false,
    ...settings,
  });

  const handleToggle = (key: keyof NotificationSettings) => {
    const next = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(next);
    onSettingsChange(next);
  };

  const activeCount = Object.values(localSettings).filter(Boolean).length;
  const total = Object.keys(localSettings).length;

  return (
    <div className="min-h-screen text-white pb-28 animate-fade-in" style={{ background: 'transparent' }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 px-4 pt-5 pb-4"
        style={{
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={() => onNavigate('settings')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm font-semibold"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Settings
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Notifications</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeCount} of {total} types enabled
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FFFFFF22, #9CA3AF22)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
          <div style={{ color: '#FFFFFF' }}>
            <BellIcon className="w-5 h-5" />
          </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">

        {/* Push permission banner */}
        {!pushEnabled && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <span className="text-xl mt-0.5">🔔</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-0.5">Push Notifications Off</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your device hasn't granted push permission. Enable it to receive alerts even when the app is closed.
              </p>
            </div>
            {onEnablePush && (
              <button
                onClick={onEnablePush}
                className="text-xs font-bold rounded-xl px-3 py-2 flex-shrink-0 transition-all"
                style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)', color: '#fff', whiteSpace: 'nowrap' }}
              >
                Enable
              </button>
            )}
          </div>
        )}

        {pushEnabled && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <div style={{ color: '#22C55E' }} className="flex-shrink-0">
              <CheckIcon className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white">Push Notifications Active</p>
          </div>
        )}

        {/* Settings groups */}
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">{group.label}</p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#141414' }}
            >
              {group.items.map((item, i) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-white/[0.02]"
                  style={{
                    borderBottom: i < group.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.iconColor}18`, color: item.iconColor }}
                  >
                    {item.icon}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                  {/* Toggle */}
                  <div className="flex-shrink-0">
                    <ToggleSwitch
                      checked={localSettings[item.key]}
                      onChange={() => handleToggle(item.key)}
                      label={item.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              const all = Object.keys(localSettings).reduce((acc, k) => ({ ...acc, [k]: true }), {} as NotificationSettings);
              setLocalSettings(all);
              onSettingsChange(all);
            }}
            className="py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Enable All
          </button>
          <button
            onClick={() => {
              const none = Object.keys(localSettings).reduce((acc, k) => ({ ...acc, [k]: false }), {} as NotificationSettings);
              setLocalSettings(none);
              onSettingsChange(none);
            }}
            className="py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Disable All
          </button>
        </div>

        <p className="text-center text-xs text-gray-700 pb-2">
          Changes are saved automatically. You can update these anytime.
        </p>
      </div>
    </div>
  );
};
