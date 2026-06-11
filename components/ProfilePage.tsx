
import React from 'react';
import { Page, User, Booking, Venue, UserRole } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { FaInstagram } from './icons/FaInstagram';
import { FaTiktok } from './icons/FaTiktok';
import { AskGabyIcon } from './icons/AskGabyIcon';
import { GroupIcon } from './icons/GroupIcon';
import { RouteIcon } from './icons/RouteIcon';
import { ChatIcon } from './icons/ChatIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { KeyIcon } from './icons/KeyIcon';

interface ProfilePageProps {
  onNavigate: (page: Page) => void;
  currentUser: User;
  tokenBalance: number;
  bookingHistory: Booking[];
  favoriteVenueIds: number[];
  venues: Venue[];
  onViewVenueDetails: (venue: Venue) => void;
  onLogout?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────
const calculateProfileCompleteness = (user: User): number => {
  let score = 0;
  const total = 12;
  if (user.name) score++;
  if (user.profilePhoto && !user.profilePhoto.includes('seed')) score++;
  if (user.bio && user.bio.length > 10) score++;
  if (user.city) score++;
  if (user.instagramHandle || user.tiktokHandle) score++;
  if (user.phoneNumber) score++;
  if (user.dob) score++;
  if (user.ethnicity) score++;
  if (user.appearance && (user.appearance.height || user.appearance.build)) score++;
  if (user.preferences && user.preferences.music.length > 0) score++;
  if (user.preferences && user.preferences.activities.length > 0) score++;
  if (user.galleryImages && user.galleryImages.length >= 3) score++;
  return Math.min(100, Math.round((score / total) * 100));
};

function getAge(dob?: string): number | null {
  if (!dob) return null;
  const b = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() - b.getMonth() < 0 || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
}

// ── Sub-components ─────────────────────────────────────────────
const StatBadge: React.FC<{ value: string | number; label: string; accent?: string }> = ({ value, label, accent = '#a78bfa' }) => (
  <div className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
    <span className="text-2xl font-black" style={{ color: accent }}>{value}</span>
    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{label}</span>
  </div>
);

const InfoPill: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-400"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
    {icon}
    {label}
  </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="flex items-center justify-between mb-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{children}</p>
    {action}
  </div>
);

const NavRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  accent: string;
  onClick: () => void;
  id?: string;
}> = ({ icon, label, accent, onClick, id }) => (
  <button
    id={id}
    onClick={onClick}
    className="w-full flex items-center gap-4 px-4 py-3.5 transition-all active:scale-[0.98] group"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
      style={{ background: `${accent}14`, border: `1px solid ${accent}30` }}
    >
      <span style={{ color: accent }}>{icon}</span>
    </div>
    <span className="text-sm font-semibold text-white flex-grow text-left">{label}</span>
    <ChevronRightIcon className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
  </button>
);

const VibePill: React.FC<{ children: string }> = ({ children }) => (
  <span
    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
    style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
  >
    {children}
  </span>
);

// ── Main Page ──────────────────────────────────────────────────
export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate, currentUser, tokenBalance, bookingHistory, favoriteVenueIds, venues, onViewVenueDetails, onLogout,
}) => {
  const user = currentUser;
  if (!user) return null;

  const completeness  = calculateProfileCompleteness(user);
  const age           = getAge(user.dob);
  const userBookings  = bookingHistory.filter(b => b.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const favoriteVenues = venues.filter(v => favoriteVenueIds.includes(v.id)).slice(0, 3);
  const eventsAttended = userBookings.filter(b => b.status === 'Completed').length;

  // Role accent
  const accent = user.role === UserRole.ADMIN ? '#a78bfa'
    : user.role === UserRole.WINGMAN ? '#fb923c'
    : '#6366f1';

  const topMusic    = user.preferences?.music?.[0];
  const topActivity = user.preferences?.activities?.[0];

  return (
    <div className="min-h-screen animate-fade-in pb-36" style={{ background: '#080808' }}>

      {/* ── Hero Card ──────────────────────────────────────────── */}
      <div className="relative px-5 pt-8 pb-0">
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#09090b 0%,#111827 100%)',
            border: `1px solid ${accent}25`,
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute top-0 right-0 w-48 h-48 opacity-[0.08] pointer-events-none"
            style={{ background: `radial-gradient(circle,${accent},transparent 70%)`, transform: 'translate(20%,-20%)' }}
          />

          {/* Avatar row */}
          <div className="relative z-10 flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden"
                style={{ border: `2px solid ${accent}50` }}
              >
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => onNavigate('editProfile')}
                id="profile-edit-photo-btn"
                aria-label="Edit profile"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: accent, border: '2px solid #080808' }}
              >
                <PencilIcon className="w-3 h-3 text-white" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: accent }}
              >
                {user.role === UserRole.ADMIN ? '⚡ Admin' : user.role === UserRole.WINGMAN ? '🔥 Wingman' : '✦ Member'}
              </p>
              <h1
                className="text-2xl font-black text-white leading-tight truncate"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {user.name}
              </h1>
              {user.accessLevel && (
                <p className="text-xs text-gray-500 mt-0.5">{user.accessLevel}</p>
              )}
            </div>

            <button
              onClick={() => onNavigate('editProfile')}
              id="profile-edit-btn"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ background: `${accent}14`, border: `1px solid ${accent}30`, color: accent }}
            >
              <PencilIcon className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          {/* Info pills */}
          <div className="relative z-10 flex flex-wrap gap-2 mb-4">
            {user.city && (
              <InfoPill icon={<LocationMarkerIcon className="w-3.5 h-3.5" />} label={user.city} />
            )}
            {age && (
              <InfoPill icon={<CalendarDaysIcon className="w-3.5 h-3.5" />} label={`${age} yrs`} />
            )}
            {user.instagramHandle && (
              <a
                href={`https://instagram.com/${user.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-pink-400 transition-opacity hover:opacity-80"
                style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}
              >
                <FaInstagram className="w-3.5 h-3.5" />
                @{user.instagramHandle}
              </a>
            )}
            {user.tiktokHandle && (
              <a
                href={`https://tiktok.com/@${user.tiktokHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <FaTiktok className="w-3.5 h-3.5" />
                @{user.tiktokHandle}
              </a>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="relative z-10 text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4">
              {user.bio}
            </p>
          )}

          {/* Profile strength */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Profile Strength</p>
              <button
                onClick={() => onNavigate('editProfile')}
                className="text-[10px] font-bold transition-colors"
                style={{ color: completeness === 100 ? '#4ade80' : accent }}
              >
                {completeness === 100 ? (
                  <span className="flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Complete</span>
                ) : `${completeness}% — Finish →`}
              </button>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${completeness}%`,
                  background: completeness === 100
                    ? 'linear-gradient(90deg,#4ade80,#22c55e)'
                    : `linear-gradient(90deg,${accent},${accent}80)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <div className="px-5 mt-4 grid grid-cols-3 gap-3">
        <StatBadge value={userBookings.length} label="Bookings" accent={accent} />
        <StatBadge value={eventsAttended} label="Attended" accent="#34d399" />
        <StatBadge value={favoriteVenueIds.length} label="Saved" accent="#fb923c" />
      </div>

      {/* ── Vibe & Preferences ─────────────────────────────────── */}
      {(topMusic || topActivity) && (
        <div className="px-5 mt-6">
          <SectionLabel>Your Vibe</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {topMusic && <VibePill>{topMusic}</VibePill>}
            {topActivity && <VibePill>{topActivity}</VibePill>}
            {user.preferences?.personality && <VibePill>{user.preferences.personality}</VibePill>}
            {user.preferences?.timeOfDay && <VibePill>{user.preferences.timeOfDay}</VibePill>}
          </div>
        </div>
      )}

      {/* ── Gallery preview ────────────────────────────────────── */}
      {user.galleryImages && user.galleryImages.length > 0 && (
        <div className="px-5 mt-6">
          <SectionLabel
            action={
              <button onClick={() => onNavigate('editProfile')} className="text-[10px] font-bold" style={{ color: accent }}>
                Manage →
              </button>
            }
          >
            Gallery
          </SectionLabel>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {user.galleryImages.slice(0, 6).map((img, i) => (
              <div key={i} className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Bookings ────────────────────────────────────── */}
      <div className="px-5 mt-6">
        <SectionLabel
          action={
            <button onClick={() => onNavigate('bookings')} className="text-[10px] font-bold" style={{ color: accent }}>
              View All →
            </button>
          }
        >
          Recent Activity
        </SectionLabel>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {userBookings.length > 0 ? userBookings.map((b, i) => (
            <div
              key={b.id}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < userBookings.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              <div>
                <p className="text-sm font-bold text-white">{b.venueName}</p>
                <p className="text-xs text-gray-600 mt-0.5">{b.date}</p>
              </div>
              <span
                className="text-[10px] font-black px-2 py-1 rounded-lg uppercase"
                style={b.status === 'Confirmed'
                  ? { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {b.status}
              </span>
            </div>
          )) : (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-sm text-gray-600">No bookings yet.</p>
              <button
                onClick={() => onNavigate('eventTimeline')}
                className="mt-3 text-xs font-bold"
                style={{ color: accent }}
              >
                Browse Events →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Saved Venues ───────────────────────────────────────── */}
      {favoriteVenues.length > 0 && (
        <div className="px-5 mt-6">
          <SectionLabel
            action={
              <button onClick={() => onNavigate('favorites')} className="text-[10px] font-bold" style={{ color: accent }}>
                View All →
              </button>
            }
          >
            Saved Venues
          </SectionLabel>
          <div
            className="rounded-2xl overflow-hidden divide-y"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', divideBorderColor: 'rgba(255,255,255,0.05)' } as React.CSSProperties}
          >
            {favoriteVenues.map((venue, i) => (
              <button
                key={venue.id}
                onClick={() => onViewVenueDetails(venue)}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/[0.02] active:scale-[0.99]"
                style={{ borderBottom: i < favoriteVenues.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <img src={venue.coverImage} alt={venue.name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                <div className="text-left flex-grow min-w-0">
                  <p className="font-bold text-white text-sm truncate">{venue.name}</p>
                  <p className="text-xs text-gray-600 truncate">{venue.location}</p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-700 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Navigation Menu ────────────────────────────────────── */}
      <div className="px-5 mt-6">
        <SectionLabel>Quick Access</SectionLabel>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {user.role === UserRole.WINGMAN && (
            <NavRow id="profile-wingman-dash" icon={<ChartPieIcon className="w-4.5 h-4.5" />} label="Wingman Dashboard" accent="#fb923c" onClick={() => onNavigate('wingmanDashboard')} />
          )}
          <NavRow id="profile-access-groups" icon={<GroupIcon className="w-4.5 h-4.5" />} label="Access Groups" accent="#60a5fa" onClick={() => onNavigate('accessGroups')} />
          <NavRow id="profile-invitations" icon={<UserPlusIcon className="w-4.5 h-4.5" />} label="Invitations" accent="#4ade80" onClick={() => onNavigate('invitations')} />
          <NavRow id="profile-itineraries" icon={<RouteIcon className="w-4.5 h-4.5" />} label="Itineraries" accent="#a78bfa" onClick={() => onNavigate('myItineraries')} />
          {user.role === UserRole.WINGMAN && (
            <NavRow id="profile-wingman-stats" icon={<ChartBarIcon className="w-4.5 h-4.5" />} label="Wingman Stats" accent="#fb923c" onClick={() => onNavigate('wingmanStats')} />
          )}
          <NavRow id="profile-chats" icon={<ChatIcon className="w-4.5 h-4.5" />} label="Chats" accent="#818cf8" onClick={() => onNavigate('eventChatsList')} />
          <NavRow id="profile-payment" icon={<CreditCardIcon className="w-4.5 h-4.5" />} label="Payment Methods" accent="#34d399" onClick={() => onNavigate('paymentMethods')} />
          <NavRow id="profile-settings" icon={<SettingsIcon className="w-4.5 h-4.5" />} label="Settings" accent="#9ca3af" onClick={() => onNavigate('settings')} />
          <div style={{ borderBottom: 'none' }}>
            <NavRow id="profile-ask-gaby" icon={<AskGabyIcon className="w-4.5 h-4.5" />} label="Ask Gaby" accent="#fbbf24" onClick={() => onNavigate('chatbot')} />
          </div>
        </div>
      </div>

      {/* ── Log Out ────────────────────────────────────────────── */}
      {onLogout && (
        <div className="px-5 mt-4 mb-2">
          <button
            id="profile-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] group"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <svg className="w-4.5 h-4.5" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
            <span className="text-sm font-bold" style={{ color: '#ef4444' }}>Log Out</span>
            <svg className="w-4 h-4 ml-auto" style={{ color: 'rgba(239,68,68,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Appearance ─────────────────────────────────────────── */}
      {user.appearance && (
        <div className="px-5 mt-6">
          <SectionLabel
            action={
              <button onClick={() => onNavigate('editProfile')} className="text-[10px] font-bold" style={{ color: accent }}>
                Edit →
              </button>
            }
          >
            Appearance
          </SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Height', val: user.appearance.height },
              { label: 'Build',  val: user.appearance.build  },
              { label: 'Hair',   val: user.appearance.hairColor },
              { label: 'Eyes',   val: user.appearance.eyeColor },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="rounded-2xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-1">{label}</p>
                <p className="text-sm font-bold text-white">{val || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Hire a Wingman CTA ───────────────────────────────────── */}
      {user.role === UserRole.USER && (
        <div className="px-5 mt-8">
          <button
            onClick={() => onNavigate('hireWingman')}
            className="w-full flex items-center justify-between rounded-2xl px-5 py-5 transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(224,64,251,0.14), rgba(123,97,255,0.14))',
              border: '1px solid rgba(224,64,251,0.3)',
            }}
          >
            <div className="text-left">
              <p className="text-sm font-black text-white">Hire a Wingman</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(224,64,251,0.8)' }}>
                Visiting Miami? Book your personal guide
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'rgba(224,64,251,0.18)' }}
            >
              🦅
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
