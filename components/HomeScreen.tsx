
import React, { useState, useEffect } from 'react';
import { Page, User, UserRole, UserAccessLevel } from '../types';
import { WingmanLogo } from './icons/WingmanLogo';
import { MenuIcon } from './icons/MenuIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { BookIcon } from './icons/BookIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { StarIcon } from './icons/StarIcon';
import { TokenIcon } from './icons/TokenIcon';
import { UsersIcon } from './icons/UsersIcon';
import { KeyIcon } from './icons/KeyIcon';
import { ClockIcon } from './icons/ClockIcon';

interface HomeScreenProps {
  onNavigate: (page: Page) => void;
  currentUser: User;
  onOpenMenu?: () => void;
  onRequestAccess?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function firstName(name: string) {
  return name?.split(' ')[0] ?? 'Member';
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Pill: React.FC<{ icon: React.ReactNode; label: string; accent?: string }> = ({ icon, label, accent }) => (
  <div
    className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
    style={{
      background: accent ? `${accent}18` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${accent ? `${accent}40` : 'rgba(255,255,255,0.08)'}`,
    }}
  >
    <span style={{ color: accent ?? '#9ca3af' }}>{icon}</span>
    <span className="text-xs font-semibold whitespace-nowrap" style={{ color: accent ?? '#9ca3af' }}>{label}</span>
  </div>
);

const QuickCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  sub?: string;
  accent?: string;
  onClick: () => void;
  id: string;
}> = ({ icon, label, sub, accent = '#fff', onClick, id }) => (
  <button
    id={id}
    onClick={onClick}
    className="flex flex-col items-start gap-2 rounded-2xl p-4 active:scale-[0.97] transition-all text-left w-full"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <span style={{ color: accent }}>{icon}</span>
    <div>
      <p className="text-sm font-bold text-white leading-tight">{label}</p>
      {sub && <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </button>
);

const StatBadge: React.FC<{ value: string | number; label: string; accent?: string }> = ({ value, label, accent = '#a78bfa' }) => (
  <div className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
    <span className="text-xl font-black" style={{ color: accent }}>{value}</span>
    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{label}</span>
  </div>
);

// ─── Role Views ───────────────────────────────────────────────────────────────

/** ADMIN VIEW */
const AdminHome: React.FC<{ user: User; onNavigate: (p: Page) => void }> = ({ user, onNavigate }) => {
  const [pulse, setPulse] = useState(false);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1400); return () => clearInterval(t); }, []);

  return (
    <div className="flex flex-col gap-6 px-5 pt-4 pb-10 animate-fade-in">
      {/* Hero greeting */}
      <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#18181b 0%,#1c1917 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 20%,#a78bfa,transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: pulse ? '#a78bfa' : '#7c3aed', boxShadow: pulse ? '0 0 8px #a78bfa' : 'none', transition: 'all 0.7s ease' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Admin HQ — Live</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {getGreeting()}, {firstName(user.name)}.
          </h2>
          <p className="text-gray-400 text-sm">You have full platform control. The system is running.</p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3">
        <StatBadge value="∞" label="Access" accent="#a78bfa" />
        <StatBadge value={daysSince(user.joinDate)} label="Days In" accent="#34d399" />
        <StatBadge value="GOD" label="Mode" accent="#fb923c" />
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard id="admin-dashboard-btn" icon={<ChartBarIcon className="w-5 h-5" />} label="Admin Dashboard" sub="Manage platform" accent="#a78bfa" onClick={() => onNavigate('adminDashboard')} />
          <QuickCard id="admin-timeline-btn" icon={<CalendarIcon className="w-5 h-5" />} label="Event Timeline" sub="All experiences" accent="#60a5fa" onClick={() => onNavigate('eventTimeline')} />
          <QuickCard id="admin-venues-btn" icon={<SparkleIcon className="w-5 h-5" />} label="Venues" sub="Curated spots" accent="#34d399" onClick={() => onNavigate('featuredVenues')} />
          <QuickCard id="admin-groups-btn" icon={<UsersIcon className="w-5 h-5" />} label="Access Groups" sub="Member circles" accent="#f472b6" onClick={() => onNavigate('accessGroups')} />
        </div>
      </div>

      {/* Status */}
      <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#a78bfa' }} />
        <div>
          <p className="text-xs font-bold text-white">Full System Access</p>
          <p className="text-[11px] text-gray-500">All gates open. All features unlocked.</p>
        </div>
      </div>
    </div>
  );
};

/** WINGMAN / WINGMAN VIEW */
const WingmanHome: React.FC<{ user: User; onNavigate: (p: Page) => void }> = ({ user, onNavigate }) => {
  const isWingman = user.role === UserRole.WINGMAN;
  const accent = isWingman ? '#fb923c' : '#38bdf8';

  return (
    <div className="flex flex-col gap-6 px-5 pt-4 pb-10 animate-fade-in">
      {/* Hero */}
      <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0c1a2e 0%,#0f172a 100%)', border: `1px solid ${accent}30` }}>
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 80% 20%,${accent},transparent 60%)` }} />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>
            {isWingman ? '🔥 Wingman Portal' : '⚡ Wingman Portal'}
          </p>
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {getGreeting()}, {firstName(user.name)}.
          </h2>
          <p className="text-sm" style={{ color: `${accent}cc` }}>
            {isWingman ? 'Your events are live. Keep the momentum.' : 'Your crew is waiting. Make it happen.'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBadge value={user.referralsCount ?? 0} label="Referrals" accent={accent} />
        <StatBadge value={`$${user.referralEarnings ?? 0}`} label="Earned" accent="#34d399" />
        <StatBadge value={daysSince(user.joinDate)} label="Days In" accent="#9ca3af" />
      </div>

      {/* Actions */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Your Hub</p>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard id="wingman-hq-btn" icon={<ChartBarIcon className="w-5 h-5" />} label={isWingman ? 'Wingman HQ' : 'Wingman HQ'} sub="Your dashboard" accent={accent} onClick={() => onNavigate('wingmanDashboard')} />
          <QuickCard id="wingman-feed-btn" icon={<SparkleIcon className="w-5 h-5" />} label="Event Feed" sub="Browse & invite" accent="#60a5fa" onClick={() => onNavigate('eventTimeline')} />
          <QuickCard id="wingman-refer-btn" icon={<UsersIcon className="w-5 h-5" />} label="Refer a Friend" sub="Earn rewards" accent="#34d399" onClick={() => onNavigate('referFriend')} />
          <QuickCard id="wingman-chats-btn" icon={<BookIcon className="w-5 h-5" />} label="My Bookings" sub="Confirmed plans" accent="#f472b6" onClick={() => onNavigate('checkout')} />
        </div>
      </div>

      {/* Role badge */}
      <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: `${accent}10`, border: `1px solid ${accent}30` }}>
        <KeyIcon className="w-5 h-5 flex-shrink-0" style={{ color: accent }} />
        <div>
          <p className="text-xs font-bold text-white">{user.role} — Elevated Access</p>
          <p className="text-[11px] text-gray-500">Host-level permissions active across all features.</p>
        </div>
      </div>
    </div>
  );
};

/** APPROVED MEMBER VIEW */
const ApprovedMemberHome: React.FC<{ user: User; onNavigate: (p: Page) => void }> = ({ user, onNavigate }) => {
  const isVIP = user.accessLevel === UserAccessLevel.APPROVED_GIRL;
  const accent = isVIP ? '#ec4899' : '#6366f1';
  const memberDays = daysSince(user.joinDate);

  // Derive music taste for personalization
  const topMusic = user.preferences?.music?.[0];
  const topActivity = user.preferences?.activities?.[0];

  return (
    <div className="flex flex-col gap-6 px-5 pt-4 pb-10 animate-fade-in">
      {/* Hero */}
      <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#09090b 0%,#111827 100%)', border: `1px solid ${accent}25` }}>
        <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.07]" style={{ background: `radial-gradient(circle,${accent},transparent 70%)`, transform: 'translate(20%,-20%)' }} />

        {/* Avatar + name */}
        <div className="relative z-10 flex items-center gap-3 mb-4">
          {user.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.name} className="w-12 h-12 rounded-full object-cover" style={{ border: `2px solid ${accent}` }} />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black" style={{ background: `${accent}20`, color: accent }}>
              {firstName(user.name)[0]}
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: accent }}>
              {isVIP ? '✦ VIP Member' : '✦ Member'}
            </p>
            <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {getGreeting()}, {firstName(user.name)}.
            </h2>
          </div>
        </div>

        {/* Personalized line */}
        <p className="relative z-10 text-sm text-gray-400">
          {topActivity
            ? `Ready for another ${topActivity.toLowerCase()} experience?`
            : 'Your next exclusive experience is waiting.'}
        </p>
      </div>

      {/* Preference pills */}
      {(topMusic || topActivity) && (
        <div className="flex flex-wrap gap-2">
          {topMusic && <Pill icon={<span className="text-xs">♪</span>} label={topMusic} accent={accent} />}
          {topActivity && <Pill icon={<SparkleIcon className="w-3.5 h-3.5" />} label={topActivity} accent={accent} />}
          {user.city && <Pill icon={<span className="text-xs">📍</span>} label={user.city} />}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBadge value={memberDays} label="Days In" accent={accent} />
        <StatBadge value={user.subscriptionStatus === 'active' ? 'ON' : 'OFF'} label="Sub" accent={user.subscriptionStatus === 'active' ? '#34d399' : '#ef4444'} />
        <StatBadge value={user.referralsCount ?? 0} label="Referred" accent="#fb923c" />
      </div>

      {/* Primary CTA */}
      <button
        id="member-browse-btn"
        onClick={() => onNavigate('eventTimeline')}
        className="w-full flex items-center justify-between font-bold text-base rounded-2xl px-5 py-5 active:scale-[0.98] transition-all"
        style={{ background: `linear-gradient(135deg,${accent},${accent}99)`, boxShadow: `0 8px 32px ${accent}40`, color: '#fff' }}
      >
        <span className="flex items-center gap-2">
          <SparkleIcon className="w-5 h-5" />
          Browse Experiences
        </span>
        <span className="text-2xl">→</span>
      </button>

      {/* Quick grid */}
      <div className="grid grid-cols-2 gap-3">
        <QuickCard id="member-plans-btn" icon={<BookIcon className="w-5 h-5" />} label="My Plans" sub="Upcoming events" accent="#60a5fa" onClick={() => onNavigate('checkout')} />
        <QuickCard id="member-venues-btn" icon={<StarIcon className="w-5 h-5" />} label="Venues" sub="Curated spots" accent="#34d399" onClick={() => onNavigate('featuredVenues')} />
        <QuickCard id="member-wallet-btn" icon={<TokenIcon className="w-5 h-5" />} label="Token Wallet" sub="Rewards & credits" accent="#fb923c" onClick={() => onNavigate('tokenWallet')} />
        <QuickCard id="member-itineraries-btn" icon={<CalendarIcon className="w-5 h-5" />} label="Itineraries" sub="Plan your nights" accent="#f472b6" onClick={() => onNavigate('myItineraries')} />
      </div>

      {/* Access status */}
      <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#4ade80' }} />
        <div>
          <p className="text-xs font-bold text-white">Access Active</p>
          <p className="text-[11px] text-gray-500">Membership approved. All experiences unlocked.</p>
        </div>
      </div>
    </div>
  );
};

/** PENDING / UNAPPROVED USER VIEW */
const PendingHome: React.FC<{ user: User; onNavigate: (p: Page) => void; onRequestAccess?: () => void }> = ({ user, onNavigate, onRequestAccess }) => {
  const isPending = user.approvalStatus === 'pending';
  const isRejected = user.approvalStatus === 'rejected';

  return (
    <div className="flex flex-col gap-6 px-5 pt-4 pb-10 animate-fade-in">
      {/* Locked hero */}
      <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#09090b,#111827)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '8px 8px' }} />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
            {isPending ? '⏳ Under Review' : isRejected ? '✕ Access Declined' : '⚐ Members Only'}
          </p>
          <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {getGreeting()}, {firstName(user.name)}.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isPending
              ? 'Your application is being reviewed. We vet every member personally.'
              : isRejected
              ? 'This round didn\'t work out. You may reapply with additional context.'
              : 'Request access to unlock exclusive experiences.'}
          </p>
        </div>
      </div>

      {/* Teaser — blurred locked cards */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">What's Inside</p>
        <div className="grid grid-cols-2 gap-3 relative">
          {['Nightclub Events', 'Yacht Experiences', 'Private Dining', 'Curated Venues'].map((label, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 h-20 flex items-end"
              style={{ background: `hsl(${240 + i * 25},30%,12%)`, border: '1px solid rgba(255,255,255,0.06)', filter: 'blur(0px)' }}
            >
              <div className="w-full">
                <div className="w-8 h-1 rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <p className="text-xs text-gray-600 font-semibold">{label}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center" style={{ backdropFilter: i >= 2 ? 'blur(4px)' : 'none' }}>
                {i >= 2 && <KeyIcon className="w-5 h-5 text-gray-700" />}
              </div>
            </div>
          ))}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(0,0,0,0) 40%,rgba(0,0,0,0.8) 100%)' }}>
            <div className="text-center">
              <KeyIcon className="w-8 h-8 text-gray-700 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-bold">Locked</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      {!isPending && (
        <button
          id="pending-request-access-btn"
          onClick={() => onRequestAccess?.()}
          className="w-full font-bold text-sm rounded-2xl px-5 py-4 active:scale-[0.98] transition-all text-black"
          style={{ background: '#ffffff', boxShadow: '0 8px 28px rgba(255,255,255,0.12)' }}
        >
          {isRejected ? 'Reapply for Access →' : 'Request Access →'}
        </button>
      )}

      {isPending && (
        <div className="rounded-2xl px-4 py-4 flex items-center gap-3" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <ClockIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#fbbf24' }} />
          <div>
            <p className="text-xs font-bold" style={{ color: '#fbbf24' }}>Application Pending</p>
            <p className="text-[11px] text-gray-500">We review every application personally. Sit tight.</p>
          </div>
        </div>
      )}

      {/* Browse public events teaser */}
      <button
        id="pending-browse-btn"
        onClick={() => onNavigate('eventTimeline')}
        className="w-full flex items-center justify-between font-semibold text-sm rounded-2xl px-5 py-4 active:scale-[0.98] transition-all text-white"
        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span className="flex items-center gap-2 text-gray-400">
          <CalendarIcon className="w-4 h-4" />
          Preview Upcoming Events
        </span>
        <span className="text-gray-700">→</span>
      </button>
    </div>
  );
};

// ─── Root Component ───────────────────────────────────────────────────────────

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, currentUser, onOpenMenu, onRequestAccess }) => {
  const isAdmin   = currentUser.role === UserRole.ADMIN;
  const isWingman = currentUser.role === UserRole.WINGMAN;
  const isApproved = currentUser.approvalStatus === 'approved' && currentUser.subscriptionStatus === 'active';

  const handleDashboardShortcut = () => {
    if (isAdmin)   return onNavigate('adminDashboard');
    if (isWingman) return onNavigate('wingmanDashboard');
  };

  // Accent color per role for the header highlight
  const headerAccent = isAdmin ? '#a78bfa' : isWingman ? '#38bdf8' : '#6366f1';

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="flex justify-between items-center px-5 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <WingmanLogo className="w-9 h-9" />
          <h1
            className="font-black text-3xl tracking-tighter text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.04em' }}
          >
            WINGMAN
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {(isAdmin || isWingman) && (
            <button
              onClick={handleDashboardShortcut}
              className="text-xs font-bold rounded-full px-3 py-1.5 transition-all active:scale-95"
              style={{ color: headerAccent, border: `1px solid ${headerAccent}40`, background: `${headerAccent}10` }}
              aria-label="Open dashboard"
              id="home-dashboard-shortcut"
            >
              {isAdmin ? 'Admin HQ' : 'Wingman HQ'}
            </button>
          )}
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      {/* ── Role-specific content ─────────────────────────────────── */}
      <main className="flex-grow">
        {isAdmin && <AdminHome user={currentUser} onNavigate={onNavigate} />}
        {!isAdmin && isWingman && <WingmanHome user={currentUser} onNavigate={onNavigate} />}
        {!isAdmin && !isWingman && isApproved && <ApprovedMemberHome user={currentUser} onNavigate={onNavigate} />}
        {!isAdmin && !isWingman && !isApproved && (
          <PendingHome user={currentUser} onNavigate={onNavigate} onRequestAccess={onRequestAccess} />
        )}
      </main>
    </div>
  );
};
