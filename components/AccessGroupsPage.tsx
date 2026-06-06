
/**
 * AccessGroupsPage.tsx — Full glassmorphism redesign
 * Design system: #08080A bg · Space Grotesk · E040FB/7B61FF accents · glass cards
 */

import React, { useState, useMemo } from 'react';
import { AccessGroup, User, UserRole, Page, GroupJoinRequest } from '../types';
import { FeaturedGroupCard } from './FeaturedGroupCard';
import { BellIcon } from './icons/BellIcon';
import { LeaveIcon } from './icons/LeaveIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface AccessGroupsPageProps {
    currentUser:                 User;
    allGroups:                   AccessGroup[];
    onViewGroup:                 (groupId: number) => void;
    onRequestJoinGroup:          (groupId: number) => void;
    onLeaveGroup:                (group: AccessGroup) => void;
    groupNotificationSettings:   Record<number, boolean>;
    onToggleGroupNotification:   (groupId: number) => void;
    onNavigate:                  (page: Page) => void;
    groupJoinRequests:           GroupJoinRequest[];
}

type FilterOption = 'all' | 'popular' | 'newest';

// ── Design tokens
const ACCENT   = '#E040FB';
const ACCENT2  = '#7B61FF';
const INDIGO   = '#6366f1';

// ─── Group Card ─────────────────────────────────────────────────
const GroupCard: React.FC<{
    group:          AccessGroup;
    onSelect:       () => void;
    isMyGroup:      boolean;
    isNotifOn?:     boolean;
    onToggleNotif?: () => void;
    onLeave?:       () => void;
    onRequestJoin?: () => void;
    canJoin?:       boolean;
    requestStatus?: 'none' | 'pending';
}> = ({ group, onSelect, isMyGroup, isNotifOn, onToggleNotif, onLeave, onRequestJoin, canJoin, requestStatus }) => (
    <div
        className="rounded-2xl overflow-hidden flex flex-col transition-all active:scale-[0.99] cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        {/* Cover image */}
        <div className="relative h-36 overflow-hidden" onClick={onSelect}>
            <img
                src={group.coverImage}
                alt={group.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,10,0.85) 0%, transparent 55%)' }} />

            {/* Pending badge */}
            {group.status === 'pending' && (
                <span
                    className="absolute top-2.5 left-2.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(234,179,8,0.14)', border: '1px solid rgba(234,179,8,0.3)', color: '#fbbf24' }}
                >
                    Pending Approval
                </span>
            )}

            {/* My Group badge */}
            {isMyGroup && (
                <span
                    className="absolute top-2.5 right-2.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: `rgba(224,64,251,0.15)`, border: `1px solid rgba(224,64,251,0.3)`, color: ACCENT }}
                >
                    Joined
                </span>
            )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 px-4 pt-3 pb-2" onClick={onSelect}>
            <h3 className="font-black text-white text-sm leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {group.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed flex-1">{group.description}</p>
            <p className="text-[11px] mt-2 font-semibold" style={{ color: '#374151' }}>
                {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
            </p>
        </div>

        {/* Footer */}
        <div
            className="px-4 pb-4 pt-3 flex items-center justify-between gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
            {/* My-group actions */}
            {isMyGroup && (
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={e => { e.stopPropagation(); onLeave?.(); }}
                        className="p-2 rounded-xl transition-all"
                        style={{ background: 'rgba(239,68,68,0.06)' }}
                        title="Leave group"
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.14)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'}
                    >
                        <LeaveIcon className="w-4 h-4 text-red-500" />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onToggleNotif?.(); }}
                        className="p-2 rounded-xl transition-all"
                        style={{ background: isNotifOn ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)' }}
                        title={isNotifOn ? 'Disable notifications' : 'Enable notifications'}
                    >
                        <BellIcon className={`w-4 h-4 ${isNotifOn ? 'text-yellow-400' : 'text-gray-600'}`} isFilled={isNotifOn} />
                    </button>
                </div>
            )}

            {/* Discover join CTA */}
            {!isMyGroup && canJoin && (
                requestStatus === 'pending' ? (
                    <button
                        disabled
                        className="w-full py-2.5 rounded-xl text-xs font-black cursor-not-allowed"
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#4b5563', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        Request Sent ✓
                    </button>
                ) : (
                    <button
                        onClick={e => { e.stopPropagation(); onRequestJoin?.(); }}
                        className="w-full py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                            boxShadow: `0 4px 16px rgba(224,64,251,0.3)`,
                        }}
                    >
                        Request to Join
                    </button>
                )
            )}
        </div>
    </div>
);

// ─── Section header ──────────────────────────────────────────────
const SectionHead: React.FC<{ title: string; accent?: string; count?: number; right?: React.ReactNode }> = ({
    title, accent = ACCENT, count, right,
}) => (
    <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
            <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
            {count !== undefined && count > 0 && (
                <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
                >
                    {count}
                </span>
            )}
        </div>
        {right}
    </div>
);

// ─── PAGE ────────────────────────────────────────────────────────
export const AccessGroupsPage: React.FC<AccessGroupsPageProps> = ({
    currentUser, allGroups, onViewGroup, onRequestJoinGroup, onLeaveGroup,
    groupNotificationSettings, onToggleGroupNotification, onNavigate, groupJoinRequests,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter,     setFilter]     = useState<FilterOption>('all');

    const myGroupIds    = currentUser.accessGroupIds || [];
    const myGroups      = allGroups.filter(g => myGroupIds.includes(g.id) || (g.creatorId === currentUser.id && g.status === 'pending'));
    const approvedGroups= allGroups.filter(g => g.status === 'approved');
    const featuredGroups= approvedGroups.filter(g => g.isFeatured && !myGroupIds.includes(g.id));

    const discoverGroups = useMemo(() => {
        let groups = approvedGroups.filter(g => !myGroupIds.includes(g.id) && !g.isFeatured);
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            groups = groups.filter(g => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
        }
        if (filter === 'popular') groups = [...groups].sort((a, b) => b.memberIds.length - a.memberIds.length);
        else if (filter === 'newest') groups = [...groups].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        return groups;
    }, [approvedGroups, myGroupIds, searchTerm, filter]);

    const canCreateGroup = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.WINGMAN;
    // All authenticated users can REQUEST to join — admin still approves/rejects.
    // Restricting the button by access level only frustrates users with no feedback.
    const canJoinGroups  = true;

    const getJoinStatus = (groupId: number) => {
        if (myGroupIds.includes(groupId)) return 'joined';
        if (groupJoinRequests.some(r => r.groupId === groupId && r.userId === currentUser.id)) return 'pending';
        return 'none' as const;
    };

    const FILTERS: { key: FilterOption; label: string }[] = [
        { key: 'all',     label: 'All' },
        { key: 'popular', label: 'Popular' },
        { key: 'newest',  label: 'Newest' },
    ];

    return (
        <div className="min-h-screen animate-fade-in" style={{ background: '#08080A' }}>

            {/* ── Sticky Header ─────────────────────────────────────────── */}
            <div
                className="sticky top-0 z-30 px-5 pt-5 pb-4"
                style={{
                    background: 'rgba(8,8,10,0.94)',
                    backdropFilter: 'blur(18px)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                {/* Back row */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => onNavigate('userProfile')}
                        id="access-groups-back-btn"
                        aria-label="Go back"
                        className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ color: '#9ca3af' }}
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Back
                    </button>

                    {canCreateGroup && (
                        <button
                            onClick={() => onNavigate('createGroup')}
                            id="create-group-btn"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white transition-all active:scale-95"
                            style={{
                                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                                boxShadow: `0 4px 16px rgba(224,64,251,0.3)`,
                            }}
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            Create Group
                        </button>
                    )}
                </div>

                {/* Title */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: ACCENT }}>
                        Communities
                    </p>
                    <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Access Groups
                    </h1>
                    <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                        Exclusive communities for the Wingman network
                    </p>
                </div>
            </div>

            <div className="px-5 pb-28 space-y-10 pt-6">

                {/* ── Featured Groups ─────────────────────────────────── */}
                {featuredGroups.length > 0 && (
                    <section>
                        <SectionHead title="Featured Groups" accent={ACCENT} />
                        <div className="overflow-x-auto pb-3 -mx-5 px-5 no-scrollbar">
                            <div className="flex gap-4" style={{ width: 'max-content' }}>
                                {featuredGroups.map(group => (
                                    <FeaturedGroupCard
                                        key={group.id}
                                        group={group}
                                        onJoin={onRequestJoinGroup}
                                        canJoin={canJoinGroups}
                                        joinStatus={getJoinStatus(group.id)}
                                        onSelect={() => onViewGroup(group.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── My Groups ───────────────────────────────────────── */}
                <section>
                    <SectionHead title="My Groups" accent={ACCENT2} count={myGroups.length} />

                    {myGroups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {myGroups.map(group => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    onSelect={() => onViewGroup(group.id)}
                                    isMyGroup
                                    isNotifOn={!!groupNotificationSettings[group.id]}
                                    onToggleNotif={() => onToggleGroupNotification(group.id)}
                                    onLeave={() => onLeaveGroup(group)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className="rounded-2xl px-6 py-10 flex flex-col items-center text-center"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}
                        >
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                                style={{ background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.15)' }}
                            >
                                👥
                            </div>
                            <p className="text-sm font-black text-white mb-1">No Groups Yet</p>
                            <p className="text-xs leading-relaxed" style={{ color: '#4b5563' }}>
                                Request to join a featured or discover group below.
                            </p>
                        </div>
                    )}
                </section>

                {/* ── Discover Groups ─────────────────────────────────── */}
                <section>
                    <SectionHead title="Discover" accent={INDIGO} count={discoverGroups.length} />

                    {/* Search + Filter row */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        {/* Search */}
                        <div
                            className="flex items-center gap-2.5 flex-1 px-4 py-3 rounded-2xl"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#6b7280' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search groups…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-white placeholder-gray-700 outline-none"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="text-gray-600 hover:text-white text-xs transition-colors">✕</button>
                            )}
                        </div>

                        {/* Filter pills */}
                        <div
                            className="flex gap-1 rounded-2xl p-1 flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className="px-4 py-2 rounded-xl text-xs font-black transition-all duration-200"
                                    style={filter === f.key
                                        ? { background: `rgba(99,102,241,0.18)`, color: '#818cf8' }
                                        : { color: '#6b7280' }
                                    }
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {discoverGroups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {discoverGroups.map(group => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    onSelect={() => onViewGroup(group.id)}
                                    isMyGroup={false}
                                    canJoin={canJoinGroups}
                                    onRequestJoin={() => onRequestJoinGroup(group.id)}
                                    requestStatus={getJoinStatus(group.id) === 'pending' ? 'pending' : 'none'}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className="rounded-2xl py-16 flex flex-col items-center text-center"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}
                        >
                            <p className="text-3xl mb-3">🔍</p>
                            <p className="text-sm font-bold text-white/50">
                                {searchTerm ? 'No groups match your search' : 'No groups to discover'}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-3 text-xs font-semibold transition-colors"
                                    style={{ color: ACCENT }}
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};
