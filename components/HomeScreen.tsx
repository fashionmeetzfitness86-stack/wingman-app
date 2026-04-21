
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
  <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <span style={{ color: '#fff' }}>{icon}</span>
    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{label}</span>
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
                            className="text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
                            style={{
                                color: '#000',
                                border: '1px solid #fff',
                                background: '#fff'
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
                            <MenuIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </header>

            {/* ── Hero ────────────────────────────────────────────── */}
            <main className="flex-grow px-6 pt-4 pb-8 flex flex-col">

                <div className="mb-8">
                    <p className="text-[11px] font-bold tracking-widest uppercase mb-3 text-gray-400">
                        Members Only
                    </p>
                    <h2
                        className="font-black text-4xl md:text-5xl leading-tight text-white mb-4"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
                    >
                        Exclusive<br />
                        Experiences.<br />
                        <span className="text-white">Limited Access.</span>
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                        Scroll through upcoming Wingman experiences and reserve your spot. Weekly events. Curated venues. Limited seats.
                    </p>
                </div>

                {/* ── Primary CTA — Event Feed is #1 ─────────────── */}
                <div className="flex flex-col gap-3 mb-7">
                    <button
                        onClick={() => onNavigate('eventTimeline')}
                        className="w-full flex items-center justify-between font-bold text-base rounded-md px-5 py-4 active:scale-[0.98] transition-all text-black bg-white"
                        style={{
                            boxShadow: '0 8px 28px rgba(255,255,255,0.1)'
                        }}
                        aria-label="Browse upcoming experiences"
                        id="home-browse-experiences"
                    >
                        <span className="flex items-center gap-2">
                            <SparkleIcon className="w-5 h-5" />
                            View Experiences
                        </span>
                        <span className="text-white/60 text-xl">→</span>
                    </button>

                    <button
                        onClick={() => onNavigate('checkout')}
                        className="w-full flex items-center justify-between font-semibold text-sm rounded-md px-5 py-4 active:scale-[0.98] transition-all text-white"
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
                        aria-label="View my plans"
                        id="home-my-plans"
                    >
                        <span className="flex items-center gap-2">
                            <BookIcon className="w-4 h-4 text-gray-400" />
                            My Plans
                        </span>
                        <span className="text-white/20 text-xl">→</span>
                    </button>
                </div>

                {/* ── Exclusivity Cues ──────────────────────────────── */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <ExclusivityPill
                        icon={<ShieldCheckIcon className="w-3.5 h-3.5" />}
                        label="Approved Members Only"
                    />
                    <ExclusivityPill
                        icon={<CalendarIcon className="w-3.5 h-3.5" />}
                        label="Weekly Events"
                    />
                    <ExclusivityPill
                        icon={
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        label="Limited Capacity"
                    />
                </div>

                {/* ── Membership Status ─────────────────────────────── */}
                {!isAdmin && !isWingman && (
                    <div
                        className="rounded-2xl px-4 py-3 border flex items-center justify-between"
                        style={
                            isApproved && hasActiveSub
                                ? { background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }
                                : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }
                        }
                    >
                        <div>
                            <p
                                className="text-xs font-bold uppercase tracking-wide mb-0.5"
                                style={{ color: isApproved && hasActiveSub ? '#fff' : '#6b7280' }}
                            >
                                {isApproved && hasActiveSub ? 'Access Granted' : 'Under Review'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {isApproved && hasActiveSub
                                    ? 'Access Granted. Environment Unlocked.'
                                    : 'Access Restricted. Account approval required.'
                                }
                            </p>
                        </div>
                        {!(isApproved && hasActiveSub) && (
                            <button
                                onClick={() => onRequestAccess?.()}
                                className="text-xs font-bold rounded-full px-3 py-1.5 transition-colors ml-3 whitespace-nowrap"
                                style={{
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    background: 'transparent',
                                }}
                            >
                                Apply →
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
