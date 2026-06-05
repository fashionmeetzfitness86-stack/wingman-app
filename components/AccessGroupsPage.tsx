
/**
 * AccessGroupsPage.tsx — Premium Access Groups hub
 * Matches platform design: dark glassmorphism, white gradient CTAs,
 * refined typography, subtle borders, premium cards
 */

import React, { useState, useMemo } from 'react';
import { AccessGroup, User, UserRole, Page, UserAccessLevel, GroupJoinRequest } from '../types';
import { FeaturedGroupCard } from './FeaturedGroupCard';
import { BellIcon } from './icons/BellIcon';
import { LeaveIcon } from './icons/LeaveIcon';
import { PlusIcon } from './icons/PlusIcon';

interface AccessGroupsPageProps {
    currentUser: User;
    allGroups: AccessGroup[];
    onViewGroup: (groupId: number) => void;
    onRequestJoinGroup: (groupId: number) => void;
    onLeaveGroup: (group: AccessGroup) => void;
    groupNotificationSettings: Record<number, boolean>;
    onToggleGroupNotification: (groupId: number) => void;
    onNavigate: (page: Page) => void;
    groupJoinRequests: GroupJoinRequest[];
}

type FilterOption = 'all' | 'popular' | 'newest';

// ─── My-Group / Discover Card ─────────────────────────────────
const GroupCard: React.FC<{
    group: AccessGroup;
    onSelect: () => void;
    isMyGroup: boolean;
    isNotifOn?: boolean;
    onToggleNotif?: () => void;
    onLeave?: () => void;
    onRequestJoin?: () => void;
    canJoin?: boolean;
    requestStatus?: 'none' | 'pending';
}> = ({ group, onSelect, isMyGroup, isNotifOn, onToggleNotif, onLeave, onRequestJoin, canJoin, requestStatus }) => (
    <div
        className="rounded-2xl overflow-hidden flex flex-col transition-all hover:scale-[1.01] cursor-pointer group"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        {/* Image */}
        <div className="relative h-36 overflow-hidden">
            <img
                src={group.coverImage}
                alt={group.name}
                onClick={onSelect}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
            {group.status === 'pending' && (
                <span
                    className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-yellow-400"
                    style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}
                >
                    Pending Approval
                </span>
            )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4" onClick={onSelect}>
            <h3 className="font-black text-white text-base leading-tight">{group.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed flex-1">{group.description}</p>
            <p className="text-xs text-gray-600 mt-2">{group.memberIds.length} members</p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
            {/* My-group actions */}
            {isMyGroup && (
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={e => { e.stopPropagation(); onLeave?.(); }}
                        className="p-2 rounded-xl transition-all hover:bg-red-900/20"
                        title="Leave group"
                    >
                        <LeaveIcon className="w-4 h-4 text-gray-500 hover:text-red-400" />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onToggleNotif?.(); }}
                        className="p-2 rounded-xl transition-all hover:bg-white/5"
                        title={isNotifOn ? 'Disable notifications' : 'Enable notifications'}
                    >
                        <BellIcon className={`w-4 h-4 ${isNotifOn ? 'text-yellow-400' : 'text-gray-600'}`} isFilled={isNotifOn} />
                    </button>
                </div>
            )}

            {/* Discover CTA */}
            {!isMyGroup && canJoin && (
                requestStatus === 'pending' ? (
                    <button
                        disabled
                        className="w-full py-2 rounded-xl text-xs font-black cursor-not-allowed"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                        Request Sent
                    </button>
                ) : (
                    <button
                        onClick={e => { e.stopPropagation(); onRequestJoin?.(); }}
                        className="w-full py-2 rounded-xl text-xs font-black text-white transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)', color: '#000' }}
                    >
                        Request to Join
                    </button>
                )
            )}
        </div>
    </div>
);

// ─── PAGE ─────────────────────────────────────────────────────
export const AccessGroupsPage: React.FC<AccessGroupsPageProps> = ({
    currentUser, allGroups, onViewGroup, onRequestJoinGroup, onLeaveGroup,
    groupNotificationSettings, onToggleGroupNotification, onNavigate, groupJoinRequests,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterOption>('all');

    const myGroupIds = currentUser.accessGroupIds || [];
    const myGroups = allGroups.filter(g =>
        myGroupIds.includes(g.id) || (g.creatorId === currentUser.id && g.status === 'pending')
    );

    const approvedGroups = allGroups.filter(g => g.status === 'approved');
    const featuredGroups = approvedGroups.filter(g => g.isFeatured && !myGroupIds.includes(g.id));

    const discoverGroups = useMemo(() => {
        let groups = approvedGroups.filter(g => !myGroupIds.includes(g.id) && !g.isFeatured);
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            groups = groups.filter(g =>
                g.name.toLowerCase().includes(q) ||
                g.description.toLowerCase().includes(q)
            );
        }
        if (filter === 'popular') groups = [...groups].sort((a, b) => b.memberIds.length - a.memberIds.length);
        else if (filter === 'newest') groups = [...groups].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        return groups;
    }, [approvedGroups, myGroupIds, searchTerm, filter]);

    const canCreateGroup = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.WINGMAN;
    const isApprovedUser = currentUser.accessLevel === UserAccessLevel.ACCESS_MALE || currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL;
    const canJoinGroups = isApprovedUser || currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.WINGMAN;

    const getJoinStatus = (groupId: number) => {
        if (myGroupIds.includes(groupId)) return 'joined';
        if (groupJoinRequests.some(r => r.groupId === groupId && r.userId === currentUser.id)) return 'pending';
        return 'none' as const;
    };

    const FILTERS: { key: FilterOption; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'popular', label: 'Popular' },
        { key: 'newest', label: 'Newest' },
    ];

    return (
        <div className="min-h-screen animate-fade-in text-white">

            {/* ── Sticky Header ── */}
            <div
                className="sticky top-0 z-30 px-4 pt-5 pb-4"
                style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex items-center justify-between max-w-7xl mx-auto gap-3">
                    {/* ← Back */}
                    <button
                        onClick={() => onNavigate('home')}
                        id="access-groups-back-btn"
                        aria-label="Go back"
                        className="flex items-center gap-1.5 flex-shrink-0 text-sm font-semibold text-white py-2 px-3 rounded-full transition-all active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Access Groups
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">Exclusive communities for the Wingman network</p>
                    </div>

                    {canCreateGroup && (
                        <button
                            onClick={() => onNavigate('createGroup')}
                            id="create-group-btn"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)', color: '#000' }}
                        >
                            <PlusIcon className="w-4 h-4" />
                            Create Group
                        </button>
                    )}
                </div>
            </div>


            <div className="px-4 pb-28 max-w-7xl mx-auto space-y-10 pt-6">

                {/* ── Featured Groups ── */}
                {featuredGroups.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">✦</span>
                            <h2 className="text-lg font-black text-white">Featured Groups</h2>
                        </div>
                        <div className="overflow-x-auto pb-3 -mx-4 px-4 no-scrollbar">
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

                {/* ── My Groups ── */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-white">My Groups</h2>
                        {myGroups.length > 0 && (
                            <span
                                className="text-xs font-black px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.08)', color: '#9CA3AF' }}
                            >
                                {myGroups.length}
                            </span>
                        )}
                    </div>

                    {myGroups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myGroups.map(group => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    onSelect={() => onViewGroup(group.id)}
                                    isMyGroup={true}
                                    isNotifOn={!!groupNotificationSettings[group.id]}
                                    onToggleNotif={() => onToggleGroupNotification(group.id)}
                                    onLeave={() => onLeaveGroup(group)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className="rounded-2xl px-6 py-10 flex flex-col items-center text-center"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <span className="text-3xl mb-3">👥</span>
                            <p className="text-sm font-bold text-white mb-1">No Groups Yet</p>
                            <p className="text-xs text-gray-500 max-w-xs">Request to join a group below or explore featured communities.</p>
                        </div>
                    )}
                </section>

                {/* ── Discover ── */}
                <section>
                    <h2 className="text-lg font-black text-white mb-4">Discover Groups</h2>

                    {/* Search + Filter row */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        <div
                            className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="text-gray-500 hover:text-white text-xs">✕</button>
                            )}
                        </div>

                        {/* Filter pills */}
                        <div
                            className="flex gap-1 rounded-xl p-1 flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                                    style={filter === f.key
                                        ? { background: 'rgba(255,255,255,0.12)', color: '#fff' }
                                        : { color: '#6B7280' }
                                    }
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {discoverGroups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <div className="text-center py-16 text-gray-600">
                            <p className="text-3xl mb-3">🔍</p>
                            <p className="font-semibold text-white/50">No groups found</p>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="mt-3 text-xs text-white/40 underline">
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
