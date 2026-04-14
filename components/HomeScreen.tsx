
import React from 'react';
import { Page, User, UserRole } from '../types';
import { WingmanLogo } from './icons/WingmanLogo';
import { MenuIcon } from './icons/MenuIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { BookIcon } from './icons/BookIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface HomeScreenProps {
  onNavigate: (page: Page) => void;
  currentUser: User;
  onOpenMenu?: () => void;
  onRequestAccess?: () => void;
}

const ExclusivityPill: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
    <span style={{ color: '#EC4899' }}>{icon}</span>
    <span className="text-xs font-semibold text-gray-300 whitespace-nowrap">{label}</span>
  </div>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, currentUser, onOpenMenu, onRequestAccess }) => {
    const isAdmin   = currentUser.role === UserRole.ADMIN;
    const isWingman = currentUser.role === UserRole.WINGMAN || currentUser.role === UserRole.PROMOTER;
    const isApproved = currentUser.approvalStatus === 'approved';
    const hasActiveSub = currentUser.subscriptionStatus === 'active';

    const handleDashboardShortcut = () => {
        if (isAdmin)   return onNavigate('adminDashboard');
        if (isWingman) return onNavigate('promoterDashboard');
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent animate-fade-in">

            {/* ── Header ─────────────────────────────────────────── */}
            <header className="flex justify-between items-center px-6 pt-8 pb-4">
                <div className="flex items-center gap-3">
                    <WingmanLogo className="w-9 h-9" />
                    <h1
                        className="font-poppins font-black text-3xl tracking-tighter text-[var(--color-foreground)]"
                        style={{ letterSpacing: '-0.05em' }}
                    >
                        WINGMAN
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {(isAdmin || isWingman) && (
                        <button
                            onClick={handleDashboardShortcut}
                            className="text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
                            style={{
                                color: '#EC4899',
                                border: '1px solid rgba(236,72,153,0.3)',
                                background: 'rgba(236,72,153,0.08)'
                            }}
                            aria-label="Open dashboard"
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
                            <MenuIcon className="w-7 h-7" />
                        </button>
                    )}
                </div>
            </header>

            {/* ── Hero ────────────────────────────────────────────── */}
            <main className="flex-grow px-6 pt-6 pb-8 flex flex-col">

                <div className="mb-8">
                    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#EC4899' }}>
                        Members Only Platform
                    </p>
                    <h2
                        className="font-poppins font-black text-4xl md:text-5xl leading-tight text-white mb-4"
                        style={{ letterSpacing: '-0.03em' }}
                    >
                        Exclusive<br />
                        Experiences.<br />
                        <span style={{ color: '#EC4899' }}>Limited Access.</span>
                    </h2>
                    <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                        Browse upcoming Wingman experiences, reserve your spot, and access curated VIP events — available to approved members only.
                    </p>
                </div>

                {/* ── Primary CTAs ──────────────────────────────────── */}
                <div className="flex flex-col gap-3 mb-8">
                    <button
                        onClick={() => onNavigate('exclusiveExperiences')}
                        className="w-full flex items-center justify-between font-bold text-base rounded-2xl px-5 py-4 active:scale-[0.98] transition-all text-white"
                        style={{
                            background: '#EC4899',
                            boxShadow: '0 8px 24px rgba(236,72,153,0.30)'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#db2777')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#EC4899')}
                        aria-label="Browse upcoming VIP experiences"
                        id="home-browse-experiences"
                    >
                        <span className="flex items-center gap-2">
                            <SparkleIcon className="w-5 h-5" />
                            Browse Experiences
                        </span>
                        <span className="text-white/60 text-xl">→</span>
                    </button>

                    <button
                        onClick={() => onNavigate('bookings')}
                        className="w-full flex items-center justify-between bg-white/5 border border-white/10 text-white font-semibold text-base rounded-2xl px-5 py-4 hover:bg-white/10 active:scale-[0.98] transition-all"
                        aria-label="View my bookings"
                        id="home-my-bookings"
                    >
                        <span className="flex items-center gap-2">
                            <BookIcon className="w-5 h-5 text-gray-400" />
                            My Bookings
                        </span>
                        <span className="text-white/30 text-xl">→</span>
                    </button>
                </div>

                {/* ── Exclusivity Cues ──────────────────────────────── */}
                <div className="flex flex-wrap gap-2 mb-10">
                    <ExclusivityPill
                        icon={<ShieldCheckIcon className="w-3.5 h-3.5" />}
                        label="Approved Members Only"
                    />
                    <ExclusivityPill
                        icon={<CalendarIcon className="w-3.5 h-3.5" />}
                        label="Pre-Scheduled Dates"
                    />
                    <ExclusivityPill
                        icon={
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        label="Limited Spots Per Event"
                    />
                </div>

                {/* ── Membership Status ─────────────────────────────── */}
                {!isAdmin && !isWingman && (
                    <div
                        className="rounded-2xl px-4 py-3 border flex items-center justify-between"
                        style={
                            isApproved && hasActiveSub
                                ? { background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)' }
                                : { background: 'rgba(236,72,153,0.07)', borderColor: 'rgba(236,72,153,0.25)' }
                        }
                    >
                        <div>
                            <p
                                className="text-xs font-bold uppercase tracking-wide mb-0.5"
                                style={{ color: isApproved && hasActiveSub ? '#22c55e' : '#EC4899' }}
                            >
                                {isApproved && hasActiveSub ? 'Access Active' : 'Access Pending'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {isApproved && hasActiveSub
                                    ? 'Your membership is approved and active. You may book.'
                                    : 'Booking requires an approved account and active membership.'
                                }
                            </p>
                        </div>
                        {!(isApproved && hasActiveSub) && (
                            <button
                                onClick={() => onRequestAccess?.()}
                                className="text-xs font-bold rounded-full px-3 py-1.5 transition-colors ml-3 whitespace-nowrap"
                                style={{
                                    color: '#EC4899',
                                    border: '1px solid rgba(236,72,153,0.4)'
                                }}
                            >
                                Apply
                            </button>
                        )}
                    </div>
                )}

                {/* ── Tertiary link ─────────────────────────────────── */}
                <button
                    onClick={() => onNavigate('eventTimeline')}
                    className="mt-4 w-full flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
                    aria-label="View event timeline"
                    id="home-event-timeline"
                >
                    <CalendarIcon className="w-4 h-4" />
                    <span>View Event Timeline</span>
                    <span className="text-gray-700">→</span>
                </button>
            </main>
        </div>
    );
};
