
import React, { useState, useMemo, useEffect } from 'react';
import { Wingman, User, Page, AccessGroup, EventInvitationRequest, UserAccessLevel, Event, UserRole, Venue, CartItem, WingmanApplication, GuestlistJoinRequest, StoreItem, EventInvitation, AppNotification, PushCampaign, MembershipRequest, InstanceBooking } from '../types';

// ── Sub-components (all preserved, just moved to legacy drawer) ──────────────
import { ManagementTab } from './admin/ManagementTab';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { AdminWingmanListItem } from './AdminWingmanListItem';
import { AdminUserListItem } from './AdminUserListItem';
import { AdminEventListItem } from './AdminEventListItem';
import { AdminVenueListItem } from './AdminVenueListItem';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { StoreTab } from './admin/StoreTab';
import { WingmanStatsTab } from './admin/WingmanStatsTab';
import { PushNotificationsTab } from './admin/PushNotificationsTab';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';
import { UserAnalyticsModal } from './modals/UserAnalyticsModal';
import { WingmanStatsModal } from './modals/WingmanStatsModal';
import { AccessControlTab } from './admin/AccessControlTab';
import { AdminLiveData } from './admin/AdminLiveData';

// ── Types ─────────────────────────────────────────────────────────────────────
type PrimaryTab = 'overview' | 'live' | 'bookings' | 'events' | 'users' | 'accessControl' | 'approvals';
type LegacyTab = 'analytics' | 'wingmanStats' | 'wingmen' | 'venues' | 'store' | 'pushNotifications';

interface AdminDashboardProps {
    users: User[];
    wingmen: Wingman[];
    venues: Venue[];
    events: Event[];
    storeItems: StoreItem[];
    pendingGroups: AccessGroup[];
    invitationRequests: EventInvitationRequest[];
    pendingTableReservations: CartItem[];
    onEditUser: (user: User) => void;
    onAddUser: () => void;
    onBlockUser: (user: User) => void;
    onViewUser: (user: User) => void;
    onEditWingman: (wingman: Wingman, user: User) => void;
    onDeleteWingman: (wingman: Wingman) => void;
    onSuspendWingman: (user: User) => void;
    onPreviewWingman: (wingman: Wingman) => void;
    onApproveGroup: (groupId: number) => void;
    onApproveRequest: (requestId: number) => void;
    onRejectRequest: (requestId: number) => void;
    onSendDirectInvites: (eventId: number, userIds: number[]) => void;
    onNavigate: (page: Page) => void;
    onAddEvent: () => void;
    onEditEvent: (event: Event) => void;
    onDeleteEvent: (event: Event) => void;
    onPreviewEvent: (event: Event) => void;
    onAddVenue: () => void;
    onEditVenue: (venue: Venue) => void;
    onDeleteVenue: (venue: Venue) => void;
    onPreviewVenue: (venue: Venue) => void;
    onAddStoreItem: () => void;
    onEditStoreItem: (item: StoreItem) => void;
    onDeleteStoreItem: (item: StoreItem) => void;
    onPreviewStoreItem: (item: StoreItem) => void;
    wingmanApplications: WingmanApplication[];
    onApproveWingmanApplication: (appId: number) => void;
    onRejectWingmanApplication: (appId: number, feedback?: string) => void;
    bookedItems: CartItem[];
    guestlistRequests: GuestlistJoinRequest[];
    allRsvps: { userId: number; eventId: number }[];
    onPreviewUser: (user: User) => void;
    eventInvitations: EventInvitation[];
    onSendPushNotification: (notification: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
    pushCampaigns: PushCampaign[];
    onCreatePushCampaign: (campaign: PushCampaign) => void;
    onToggleCampaignStatus: (campaignId: string) => void;
    onDeleteCampaign: (campaignId: string) => void;
    onBulkDeleteEvents?: (eventIds: (number | string)[]) => void;
    onBulkUpdateEvents?: (eventIds: (number | string)[], updates: Partial<Event>) => void;
    onApproveUser?: (userId: number) => void;
    onRejectUser?: (userId: number) => void;
    onDeleteUser?: (userId: number) => void;
    membershipRequests: MembershipRequest[];
    onApproveMembershipRequest: (requestId: number) => void;
    onRejectMembershipRequest: (requestId: number) => void;
    instanceBookings?: InstanceBooking[];
}

// ── Shared FilterDropdown (unchanged) ─────────────────────────────────────────
const FilterDropdown: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: (string | { value: string; label: string })[] }> = ({ label, value, onChange, options }) => (
    <div className="relative flex-grow">
        <label htmlFor={`filter-${label}`} className="sr-only">{label}</label>
        <select
            id={`filter-${label}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#0F1014] border border-[#1C1D22] text-sm text-white rounded-md p-3 appearance-none focus:ring-white focus:border-white pr-8 transition-colors"
        >
            <option value="all">All {label}s</option>
            {options.map(opt => (
                typeof opt === 'string'
                    ? <option key={opt} value={opt}>{opt}</option>
                    : <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <ChevronDownIcon className="w-5 h-5 text-[#5D616B] absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
    </div>
);

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{ label: string; value: string | number; sub?: string; accent?: string; onClick?: () => void }> = ({ label, value, sub, accent = '#ffffff', onClick }) => (
    <div
        onClick={onClick}
        className={`rounded-2xl p-5 flex flex-col gap-2 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
    >
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
        {sub && <p className="text-[11px]" style={{ color: accent }}>{sub}</p>}
    </div>
);

// ── Tab Button ────────────────────────────────────────────────────────────────
const TabBtn: React.FC<{ label: string; active: boolean; badge?: number; onClick: () => void }> = ({ label, active, badge, onClick }) => (
    <button
        onClick={onClick}
        className={`relative flex-shrink-0 px-5 py-3 text-[11px] font-bold tracking-widest uppercase transition-all border-b-2 ${active ? 'text-white border-white' : 'text-[#5D616B] border-transparent hover:text-gray-300 hover:border-[#3a3d47]'}`}
    >
        {label}
        {badge != null && badge > 0 && (
            <span className="absolute top-1.5 right-0.5 min-w-[18px] h-[18px] bg-[#1A0505] border border-[#3A1010] text-[#D45050] text-[9px] font-black rounded-full flex items-center justify-center px-1">
                {badge}
            </span>
        )}
    </button>
);

// ── Overview Tab ──────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{
    bookedItems: CartItem[];
    guestlistRequests: GuestlistJoinRequest[];
    users: User[];
    events: Event[];
    membershipRequests: MembershipRequest[];
    wingmanApplications: WingmanApplication[];
    invitationRequests: EventInvitationRequest[];
    onGoTo: (tab: PrimaryTab) => void;
}> = ({ bookedItems, guestlistRequests, users, events, membershipRequests, wingmanApplications, invitationRequests, onGoTo }) => {
    const today = new Date().toISOString().split('T')[0];

    const todayBookings = useMemo(() =>
        bookedItems.filter(b => (b.sortableDate || '').startsWith(today)), [bookedItems, today]);

    const totalRevenue = useMemo(() =>
        bookedItems.reduce((acc, item) => {
            const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
            return acc + (price || 0);
        }, 0), [bookedItems]);

    const pendingApprovals = useMemo(() =>
        users.filter(u => (u.approvalStatus === 'pending' || u.approvalStatus === undefined) && u.role !== UserRole.ADMIN && u.role !== UserRole.WINGMAN).length +
        membershipRequests.filter(r => r.status === 'pending').length +
        wingmanApplications.filter(a => a.status === 'pending').length +
        invitationRequests.filter(r => r.status === 'pending').length,
        [users, membershipRequests, wingmanApplications, invitationRequests]);

    const recentBookings = useMemo(() => [...bookedItems].reverse().slice(0, 8), [bookedItems]);

    const upcomingEvents = useMemo(() =>
        events.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5),
        [events, today]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Today's Bookings" value={todayBookings.length} sub={todayBookings.length === 0 ? 'None yet today' : `↑ ${todayBookings.length} confirmed`} accent="#4DB87C" onClick={() => onGoTo('bookings')} />
                <KpiCard label="Pending Approvals" value={pendingApprovals} sub={pendingApprovals > 0 ? 'Action required' : 'All clear'} accent={pendingApprovals > 0 ? '#D45050' : '#4DB87C'} onClick={() => onGoTo('approvals')} />
                <KpiCard label="Total Revenue" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`} sub="All-time bookings" />
                <KpiCard label="Guestlist Signups" value={guestlistRequests.length} sub={`${guestlistRequests.filter(r => r.status === 'pending').length} pending review`} onClick={() => onGoTo('bookings')} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: '📋 Manage Bookings', tab: 'bookings' as PrimaryTab },
                    { label: '👤 Review Users', tab: 'users' as PrimaryTab },
                    { label: '🎪 Manage Events', tab: 'events' as PrimaryTab },
                ].map(({ label, tab }) => (
                    <button key={tab} onClick={() => onGoTo(tab)}
                        className="py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-80 active:scale-[0.98]"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Upcoming Events */}
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#5D616B] mb-3">Upcoming Events</p>
                {upcomingEvents.length === 0
                    ? <p className="text-sm text-gray-600 py-4">No upcoming events scheduled.</p>
                    : <div className="space-y-2">
                        {upcomingEvents.map(ev => (
                            <div key={ev.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div>
                                    <p className="text-sm font-semibold text-white">{ev.title}</p>
                                    <p className="text-[11px] text-gray-500">{ev.date}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${ev.type === 'EXCLUSIVE' ? 'bg-[#171113] text-[#967385] border border-[#291C22]' : 'bg-[#111317] text-[#738596] border border-[#1C2229]'}`}>
                                    {ev.type}
                                </span>
                            </div>
                        ))}
                    </div>
                }
            </div>

            {/* Recent Bookings */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#5D616B]">Recent Bookings</p>
                    <button onClick={() => onGoTo('bookings')} className="text-xs text-gray-500 hover:text-white transition-colors">View all →</button>
                </div>
                {recentBookings.length === 0
                    ? <p className="text-sm text-gray-600 py-4">No bookings yet.</p>
                    : <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase tracking-wider text-[#5D616B]" style={{ background: '#0c0c0e' }}>
                                    <th className="px-4 py-3 text-left">Item</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((item, i) => (
                                    <tr key={item.id} className={i % 2 === 0 ? 'bg-[#141414]' : 'bg-[#111113]'}>
                                        <td className="px-4 py-3 text-white font-medium truncate max-w-[180px]">{item.name}</td>
                                        <td className="px-4 py-3 text-gray-400">{item.sortableDate || item.date || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#0F1014] text-[#5D616B] border border-[#1C1D22]">{item.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-white">
                                            ${((item.paymentOption === 'full' ? item.fullPrice : item.depositPrice) || 0).toFixed(0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </div>
    );
};

// ── Bookings Tab ──────────────────────────────────────────────────────────────
const BookingsTab: React.FC<{
    bookedItems: CartItem[];
    guestlistRequests: GuestlistJoinRequest[];
    users: User[];
    venues: Venue[];
    wingmen: Wingman[];
    instanceBookings?: InstanceBooking[];
}> = ({ bookedItems, guestlistRequests, users, venues, wingmen, instanceBookings = [] }) => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'table' | 'event' | 'experience' | 'guestlist' | 'storeItem'>('all');
    const [guestlistFilter, setGuestlistFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const filteredBookings = useMemo(() => {
        return bookedItems
            .filter(item => typeFilter === 'all' || item.type === typeFilter)
            .filter(item => {
                if (!search) return true;
                const q = search.toLowerCase();
                const guest = item.tableDetails?.guestDetails?.name || item.eventDetails?.guestDetails?.name || '';
                return item.name.toLowerCase().includes(q) || guest.toLowerCase().includes(q);
            });
    }, [bookedItems, typeFilter, search]);

    const filteredGuestlist = useMemo(() => {
        return guestlistRequests
            .filter(r => guestlistFilter === 'all' || r.status === guestlistFilter)
            .filter(r => {
                if (!search) return true;
                const q = search.toLowerCase();
                const user = users.find(u => u.id === r.userId);
                const venue = venues.find(v => v.id === r.venueId);
                return (user?.name.toLowerCase().includes(q) || venue?.name.toLowerCase().includes(q));
            });
    }, [guestlistRequests, guestlistFilter, search, users, venues]);

    const totalRevenue = useMemo(() =>
        filteredBookings.reduce((acc, item) => acc + ((item.paymentOption === 'full' ? item.fullPrice : item.depositPrice) || 0), 0),
        [filteredBookings]);

    const instanceRevenue = useMemo(() =>
        instanceBookings.reduce((acc, b) => acc + (b.totalPaid || 0), 0),
        [instanceBookings]);

    const filteredInstances = useMemo(() => {
        if (!search) return instanceBookings;
        const q = search.toLowerCase();
        return instanceBookings.filter(b =>
            (b.guestName || '').toLowerCase().includes(q) ||
            b.instanceId.toLowerCase().includes(q)
        );
    }, [instanceBookings, search]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-4">
                <KpiCard label="Cart Bookings" value={bookedItems.length} />
                <KpiCard label="Event Bookings" value={instanceBookings.length} sub={`${instanceBookings.length} confirmed spots`} accent="#4DB87C" />
                <KpiCard label="Total Revenue" value={`$${(totalRevenue + instanceRevenue).toLocaleString()}`} />
            </div>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search bookings or guests…"
                        className="w-full bg-[#0F1014] border border-[#1C1D22] text-sm text-white rounded-xl p-3 pl-10 focus:ring-white focus:border-white transition-colors"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D616B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                </div>
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value as any)}
                    className="bg-[#0F1014] border border-[#1C1D22] text-sm text-white rounded-xl p-3 appearance-none focus:ring-white focus:border-white transition-colors"
                >
                    <option value="all">All Types</option>
                    <option value="table">Table</option>
                    <option value="event">Event</option>
                    <option value="experience">Experience</option>
                    <option value="guestlist">Guestlist</option>
                    <option value="storeItem">Store</option>
                </select>
            </div>

            {/* Bookings table */}
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#5D616B] mb-3">Confirmed Bookings ({filteredBookings.length})</p>
                {filteredBookings.length === 0
                    ? <div className="py-12 text-center text-gray-600 text-sm rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>No bookings found.</div>
                    : <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase tracking-wider text-[#5D616B]" style={{ background: '#0c0c0e' }}>
                                    <th className="px-4 py-3 text-left">Item</th>
                                    <th className="px-4 py-3 text-left">Guest</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Payment</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((item, i) => {
                                    const guest = item.tableDetails?.guestDetails?.name || item.eventDetails?.guestDetails?.name || '—';
                                    const price = (item.paymentOption === 'full' ? item.fullPrice : item.depositPrice) || 0;
                                    return (
                                        <tr key={item.id} className={i % 2 === 0 ? 'bg-[#141414]' : 'bg-[#111113]'}>
                                            <td className="px-4 py-3 text-white font-medium max-w-[160px] truncate">{item.name}</td>
                                            <td className="px-4 py-3 text-gray-400">{guest}</td>
                                            <td className="px-4 py-3 text-gray-400">{item.sortableDate || item.date || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#0F1014] text-[#5D616B] border border-[#1C1D22]">{item.type}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.paymentMethod === 'tokens' ? 'bg-[#1A1810] text-[#B89B4D] border border-[#333020]' : 'bg-[#051A10] text-[#4DB87C] border border-[#0A3A20]'}`}>
                                                    {item.paymentMethod || 'USD'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-white">${price.toFixed(0)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                }
            </div>

            {/* Event-Feed Bookings (InstanceBooking) */}
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#5D616B] mb-3">Event Feed Bookings ({filteredInstances.length})</p>
                {filteredInstances.length === 0
                    ? <div className="py-8 text-center text-gray-600 text-sm rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>No event-feed bookings yet.</div>
                    : <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase tracking-wider text-[#5D616B]" style={{ background: '#0c0c0e' }}>
                                    <th className="px-4 py-3 text-left">Event</th>
                                    <th className="px-4 py-3 text-left">Guest</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Spots</th>
                                    <th className="px-4 py-3 text-right">Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInstances.map((b, i) => {
                                    const eventDate = b.instanceId.match(/(\d{4}-\d{2}-\d{2})$/)?.[1] || '—';
                                    const eventName = b.instanceId
                                        .replace(/-\d{4}-\d{2}-\d{2}$/, '')
                                        .replace(/-/g, ' ')
                                        .replace(/\b\w/g, c => c.toUpperCase());
                                    return (
                                        <tr key={b.id} className={i % 2 === 0 ? 'bg-[#141414]' : 'bg-[#111113]'}>
                                            <td className="px-4 py-3 text-white font-medium max-w-[160px] truncate">{eventName}</td>
                                            <td className="px-4 py-3 text-gray-400">{b.guestName || '—'}</td>
                                            <td className="px-4 py-3 text-gray-400">{eventDate}</td>
                                            <td className="px-4 py-3 text-gray-400">{b.partySize}</td>
                                            <td className="px-4 py-3 text-right font-bold">
                                                {b.totalPaid > 0 ? `$${b.totalPaid.toLocaleString()}` : <span className="text-green-400">FREE</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                }
            </div>

            {/* Guestlist section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#5D616B]">Guestlist Requests ({filteredGuestlist.length})</p>
                    <select
                        value={guestlistFilter}
                        onChange={e => setGuestlistFilter(e.target.value as any)}
                        className="bg-[#0F1014] border border-[#1C1D22] text-xs text-white rounded-lg p-2 appearance-none"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                {filteredGuestlist.length === 0
                    ? <div className="py-8 text-center text-gray-600 text-sm rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>No guestlist requests.</div>
                    : <div className="space-y-2">
                        {filteredGuestlist.map(req => {
                            const user = users.find(u => u.id === req.userId);
                            const venue = venues.find(v => v.id === req.venueId);
                            const wingman = wingmen.find(p => p.id === req.wingmanId);
                            return (
                                <div key={req.id} className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    {user && <img src={user.profilePhoto} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{user?.name || 'Unknown'}</p>
                                        <p className="text-[11px] text-gray-500">{venue?.name || '—'} · via {wingman?.name || '—'} · {req.date}</p>
                                    </div>
                                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${req.status === 'approved' ? 'bg-[#051A10] text-[#4DB87C] border border-[#0A3A20]' : req.status === 'pending' ? 'bg-[#1A1810] text-[#B89B4D] border border-[#333020]' : 'bg-[#1A0505] text-[#D45050] border border-[#3A1010]'}`}>
                                        {req.status}
                                    </span>
                                    {req.isVip && (
                                        <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#171113] text-[#967385] border border-[#291C22]">VIP</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                }
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<PrimaryTab>('overview');
    const [activeLegacyTab, setActiveLegacyTab] = useState<LegacyTab | null>(null);
    const [showLegacy, setShowLegacy] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const { wingmen, venues, users, events } = props;

    // Filter states (legacy tabs)
    const [wingmanCityFilter, setWingmanCityFilter] = useState('all');
    const [wingmanVenueFilter, setWingmanVenueFilter] = useState('all');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userAccessLevelFilter, setUserAccessLevelFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [userApprovalFilter, setUserApprovalFilter] = useState('all');
    const [eventTypeFilter, setEventTypeFilter] = useState('all');
    const [eventVenueFilter, setEventVenueFilter] = useState('all');
    const [venueLocationFilter, setVenueLocationFilter] = useState('all');
    const [venueMusicTypeFilter, setVenueMusicTypeFilter] = useState('all');
    const [venueVibeFilter, setVenueVibeFilter] = useState('all');
    const [selectedEventIds, setSelectedEventIds] = useState<(number | string)[]>([]);

    // Modal state
    const [userForAnalytics, setUserForAnalytics] = useState<User | null>(null);
    const [wingmanForStats, setWingmanForStats] = useState<Wingman | null>(null);

    // Computed badges
    const pendingApprovalsCount = useMemo(() =>
        users.filter(u => (u.approvalStatus === 'pending' || u.approvalStatus === undefined) && u.role !== UserRole.ADMIN && u.role !== UserRole.WINGMAN).length,
        [users]);

    const pendingRequestsCount = useMemo(() =>
        props.wingmanApplications.filter(a => a.status === 'pending').length +
        props.pendingGroups.length +
        props.invitationRequests.filter(req => req.status === 'pending').length +
        props.membershipRequests.filter(r => r.status === 'pending').length,
        [props.wingmanApplications, props.pendingGroups, props.invitationRequests, props.membershipRequests]);

    // Reset search/filters on tab change
    useEffect(() => {
        setSearchTerm('');
        setWingmanCityFilter('all');
        setWingmanVenueFilter('all');
        setUserRoleFilter('all');
        setUserAccessLevelFilter('all');
        setUserStatusFilter('all');
        setUserApprovalFilter('all');
        setEventTypeFilter('all');
        setEventVenueFilter('all');
        setVenueLocationFilter('all');
        setVenueMusicTypeFilter('all');
        setVenueVibeFilter('all');
        setSelectedEventIds([]);
    }, [activeTab, activeLegacyTab]);

    // Filtered lists (for primary Events / Users and legacy tabs)
    const filteredUsers = useMemo(() => users.filter(u => {
        const searchMatch = searchTerm === '' || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = userRoleFilter === 'all' || u.role === userRoleFilter;
        const accessLevelMatch = userAccessLevelFilter === 'all' || u.accessLevel === userAccessLevelFilter;
        const statusMatch = userStatusFilter === 'all' || u.status === userStatusFilter;
        const approvalMatch = userApprovalFilter === 'all' || (u.approvalStatus ?? 'pending') === userApprovalFilter;
        return searchMatch && roleMatch && accessLevelMatch && statusMatch && approvalMatch;
    }), [users, searchTerm, userRoleFilter, userAccessLevelFilter, userStatusFilter, userApprovalFilter]);

    const filteredEvents = useMemo(() => events.filter(e => {
        const searchMatch = searchTerm === '' || e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.description.toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = eventTypeFilter === 'all' || e.type === eventTypeFilter;
        const venueMatch = eventVenueFilter === 'all' || e.venueId === parseInt(eventVenueFilter);
        return searchMatch && typeMatch && venueMatch;
    }), [events, searchTerm, eventTypeFilter, eventVenueFilter]);

    const filteredWingmen = useMemo(() => wingmen.filter(p => {
        const searchMatch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.handle.toLowerCase().includes(searchTerm.toLowerCase()) || p.city.toLowerCase().includes(searchTerm.toLowerCase());
        const cityMatch = wingmanCityFilter === 'all' || p.city === wingmanCityFilter;
        const venueMatch = wingmanVenueFilter === 'all' || p.assignedVenueIds.includes(parseInt(wingmanVenueFilter));
        return searchMatch && cityMatch && venueMatch;
    }), [wingmen, searchTerm, wingmanCityFilter, wingmanVenueFilter]);

    const filteredVenues = useMemo(() => venues.filter(v => {
        const searchMatch = searchTerm === '' || v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.location.toLowerCase().includes(searchTerm.toLowerCase());
        const locationMatch = venueLocationFilter === 'all' || v.location === venueLocationFilter;
        const musicTypeMatch = venueMusicTypeFilter === 'all' || v.musicType === venueMusicTypeFilter;
        const vibeMatch = venueVibeFilter === 'all' || v.vibe === venueVibeFilter;
        return searchMatch && locationMatch && musicTypeMatch && vibeMatch;
    }), [venues, searchTerm, venueLocationFilter, venueMusicTypeFilter, venueVibeFilter]);

    const wingmanCities = useMemo(() => [...new Set(wingmen.map(p => p.city))], [wingmen]);
    const venueLocations = useMemo(() => [...new Set(venues.map(v => v.location))], [venues]);
    const venueMusicTypes = useMemo(() => [...new Set(venues.map(v => v.musicType))], [venues]);
    const venueVibes = useMemo(() => [...new Set(venues.map(v => v.vibe))], [venues]);
    const getVenueName = (id: number) => venues.find(v => v.id === id)?.name || 'N/A';

    // Bulk event handlers
    const handleToggleEventSelection = (eventId: number | string) => {
        setSelectedEventIds(prev => prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]);
    };
    const handleSelectAllEvents = () => {
        if (selectedEventIds.length === filteredEvents.length) setSelectedEventIds([]);
        else setSelectedEventIds(filteredEvents.map(e => e.id));
    };
    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedEventIds.length} events?`)) {
            props.onBulkDeleteEvents?.(selectedEventIds);
            setSelectedEventIds([]);
        }
    };
    const handleBulkUpdateType = (type: 'EXCLUSIVE' | 'INVITE ONLY') => {
        props.onBulkUpdateEvents?.(selectedEventIds, { type });
        setSelectedEventIds([]);
    };

    const handleGoTo = (tab: PrimaryTab) => {
        setActiveTab(tab);
        setActiveLegacyTab(null);
        setShowLegacy(false);
    };

    const handleLegacyTab = (tab: LegacyTab) => {
        setActiveLegacyTab(tab);
        setActiveTab('overview'); // deselect primary; legacy is visual-only override
    };

    const isLegacyActive = activeLegacyTab !== null;

    // Search bar visibility: show for events, users, and all legacy tabs with lists
    const showSearch = (!isLegacyActive && (activeTab === 'events' || activeTab === 'users'))
        || (isLegacyActive && activeLegacyTab !== 'analytics' && activeLegacyTab !== 'wingmanStats' && activeLegacyTab !== 'pushNotifications');

    const renderFilters = () => {
        const tab = isLegacyActive ? activeLegacyTab : activeTab;
        if (tab === 'wingmen') return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilterDropdown label="City" value={wingmanCityFilter} onChange={setWingmanCityFilter} options={wingmanCities} />
                <FilterDropdown label="Venue" value={wingmanVenueFilter} onChange={setWingmanVenueFilter} options={venues.map(v => ({ value: v.id.toString(), label: v.name }))} />
            </div>
        );
        if (tab === 'users') return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FilterDropdown label="Role" value={userRoleFilter} onChange={setUserRoleFilter} options={Object.values(UserRole)} />
                <FilterDropdown label="Access" value={userAccessLevelFilter} onChange={setUserAccessLevelFilter} options={Object.values(UserAccessLevel)} />
                <FilterDropdown label="Status" value={userStatusFilter} onChange={setUserStatusFilter} options={['active', 'blocked']} />
                <FilterDropdown label="Approval" value={userApprovalFilter} onChange={setUserApprovalFilter} options={['pending', 'approved', 'rejected']} />
            </div>
        );
        if (tab === 'events') return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilterDropdown label="Type" value={eventTypeFilter} onChange={setEventTypeFilter} options={['EXCLUSIVE', 'INVITE ONLY']} />
                <FilterDropdown label="Venue" value={eventVenueFilter} onChange={setEventVenueFilter} options={venues.map(v => ({ value: v.id.toString(), label: v.name }))} />
            </div>
        );
        if (tab === 'venues') return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FilterDropdown label="Location" value={venueLocationFilter} onChange={setVenueLocationFilter} options={venueLocations} />
                <FilterDropdown label="Music" value={venueMusicTypeFilter} onChange={setVenueMusicTypeFilter} options={venueMusicTypes} />
                <FilterDropdown label="Vibe" value={venueVibeFilter} onChange={setVenueVibeFilter} options={venueVibes} />
            </div>
        );
        return null;
    };

    const renderContent = () => {
        // Legacy drawer tabs take priority when selected
        if (isLegacyActive) {
            switch (activeLegacyTab) {
                case 'analytics':
                    return <AnalyticsTab bookedItems={props.bookedItems} guestlistRequests={props.guestlistRequests} allRsvps={props.allRsvps} users={props.users} events={props.events} venues={props.venues} wingmen={props.wingmen} />;
                case 'wingmanStats':
                    return <WingmanStatsTab wingmen={props.wingmen} bookedItems={props.bookedItems} guestlistRequests={props.guestlistRequests} onPreviewWingman={props.onPreviewWingman} onViewStats={p => setWingmanForStats(p)} />;
                case 'wingmen':
                    return (
                        <div className="space-y-3">
                            <div className="flex justify-end mb-4">
                                <button onClick={() => props.onNavigate('wingmanApplication')} className="bg-white text-black hover:bg-gray-200 text-sm font-semibold py-2 px-4 rounded-md transition-colors">Add Wingman</button>
                            </div>
                            {filteredWingmen.length > 0 ? filteredWingmen.map(wingman => {
                                const user = props.users.find(u => u.id === wingman.id);
                                if (!user) return null;
                                return <AdminWingmanListItem key={wingman.id} wingman={wingman} user={user} onEdit={props.onEditWingman} onDelete={props.onDeleteWingman} onPreview={props.onPreviewWingman} onSuspend={props.onSuspendWingman} onViewStats={p => setWingmanForStats(p)} />;
                            }) : <p className="text-center text-gray-500 py-8">No wingmen found.</p>}
                        </div>
                    );
                case 'venues':
                    return (
                        <div className="space-y-3">
                            <div className="flex justify-end mb-4">
                                <button onClick={props.onAddVenue} className="bg-white text-black hover:bg-gray-200 text-sm font-semibold py-2 px-4 rounded-md transition-colors">Add Venue</button>
                            </div>
                            {filteredVenues.length > 0 ? filteredVenues.map(venue => <AdminVenueListItem key={venue.id} venue={venue} onEdit={props.onEditVenue} onDelete={props.onDeleteVenue} onPreview={props.onPreviewVenue} />) : <p className="text-center text-gray-500 py-8">No venues found.</p>}
                        </div>
                    );
                case 'store':
                    return <StoreTab storeItems={props.storeItems} onAddItem={props.onAddStoreItem} onEditItem={props.onEditStoreItem} onDeleteItem={props.onDeleteStoreItem} onPreviewItem={props.onPreviewStoreItem} />;
                case 'pushNotifications':
                    return <PushNotificationsTab events={props.events} venues={props.venues} users={props.users} campaigns={props.pushCampaigns} onCreateCampaign={props.onCreatePushCampaign} onToggleStatus={props.onToggleCampaignStatus} onDelete={props.onDeleteCampaign} />;
                default: return null;
            }
        }

        // Primary tabs
        switch (activeTab) {
            case 'overview':
                return <OverviewTab bookedItems={props.bookedItems} guestlistRequests={props.guestlistRequests} users={props.users} events={props.events} membershipRequests={props.membershipRequests} wingmanApplications={props.wingmanApplications} invitationRequests={props.invitationRequests} onGoTo={handleGoTo} />;
            case 'live':
                return <AdminLiveData />;
            case 'bookings':
                return <BookingsTab bookedItems={props.bookedItems} guestlistRequests={props.guestlistRequests} users={props.users} venues={props.venues} wingmen={props.wingmen} instanceBookings={props.instanceBookings || []} />;
            case 'events':
                return (
                    <div className="space-y-3">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                            {selectedEventIds.length > 0 ? (
                                <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg animate-fade-in">
                                    <span className="text-sm font-semibold text-white px-2">{selectedEventIds.length} Selected</span>
                                    <button onClick={() => handleBulkUpdateType('EXCLUSIVE')} className="text-xs bg-green-900/50 text-green-300 px-3 py-1.5 rounded hover:bg-green-800 transition-colors">Set Exclusive</button>
                                    <button onClick={() => handleBulkUpdateType('INVITE ONLY')} className="text-xs bg-purple-900/50 text-purple-300 px-3 py-1.5 rounded hover:bg-purple-800 transition-colors">Set Invite Only</button>
                                    <button onClick={handleBulkDelete} className="p-1.5 bg-red-900/50 text-red-400 rounded hover:bg-red-800 transition-colors" title="Delete Selected">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setSelectedEventIds([])} className="p-1.5 text-gray-400 hover:text-white">
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={handleSelectAllEvents} className="text-sm text-gray-400 hover:text-white font-semibold">Select All Visible</button>
                            )}
                            <button onClick={props.onAddEvent} className="bg-white text-black hover:bg-gray-200 text-sm font-semibold py-2 px-4 rounded-md transition-colors">Add Event</button>
                        </div>
                        {filteredEvents.length > 0 ? filteredEvents.map(event => <AdminEventListItem key={event.id} event={event} venueName={getVenueName(event.venueId)} onEdit={props.onEditEvent} onDelete={props.onDeleteEvent} onPreview={props.onPreviewEvent} isSelected={selectedEventIds.includes(event.id)} onToggleSelect={handleToggleEventSelection} />) : <p className="text-center text-gray-500 py-8">No events found.</p>}
                    </div>
                );
            case 'users':
                return (
                    <div className="space-y-3">
                        {pendingApprovalsCount > 0 && (
                            <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-2 animate-fade-in" style={{ background: 'rgba(180,80,50,0.08)', border: '1px solid rgba(212,80,80,0.2)' }}>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#D45050] animate-pulse" />
                                    <p className="text-sm font-semibold text-[#D45050]">
                                        {pendingApprovalsCount} user{pendingApprovalsCount !== 1 ? 's' : ''} awaiting approval
                                    </p>
                                </div>
                                <button onClick={() => setUserApprovalFilter('pending')} className="text-xs font-bold text-[#D45050] border border-[#D45050]/30 rounded-full px-3 py-1 hover:bg-[#D45050]/10 transition-colors">
                                    Review
                                </button>
                            </div>
                        )}
                        <div className="flex justify-end mb-4">
                            <button onClick={props.onAddUser} className="bg-white text-black hover:bg-gray-200 text-sm font-semibold py-2 px-4 rounded-md transition-colors">Create User</button>
                        </div>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => <AdminUserListItem key={user.id} user={user} onEdit={props.onEditUser} onViewProfile={props.onViewUser} onBlock={props.onBlockUser} onViewAnalytics={u => setUserForAnalytics(u)} onApprove={props.onApproveUser} onReject={props.onRejectUser} onDelete={props.onDeleteUser} />) : <p className="text-center text-gray-500 py-8">No users found.</p>}
                    </div>
                );
            case 'accessControl':
                return <AccessControlTab />;
            case 'approvals':
                return (
                    <ManagementTab
                        wingmanApplications={props.wingmanApplications}
                        onApproveWingmanApplication={props.onApproveWingmanApplication}
                        onRejectWingmanApplication={props.onRejectWingmanApplication}
                        pendingGroups={props.pendingGroups}
                        onApproveGroup={props.onApproveGroup}
                        invitationRequests={props.invitationRequests}
                        onApproveRequest={props.onApproveRequest}
                        onRejectRequest={props.onRejectRequest}
                        users={props.users}
                        events={props.events}
                        onNavigate={props.onNavigate}
                        bookedItems={props.bookedItems}
                        eventInvitations={props.eventInvitations}
                        onPreviewUser={props.onPreviewUser}
                        onSendDirectInvites={props.onSendDirectInvites}
                        membershipRequests={props.membershipRequests}
                        onApproveMembershipRequest={props.onApproveMembershipRequest}
                        onRejectMembershipRequest={props.onRejectMembershipRequest}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">

            {/* ── Primary Navigation ──────────────────────────────────────── */}
            <div className="flex border-b border-[#1C1D22] mb-2 overflow-x-auto no-scrollbar gap-1">
                <TabBtn label="Overview"       active={!isLegacyActive && activeTab === 'overview'}       onClick={() => handleGoTo('overview')} />
                <TabBtn label="Live"           active={!isLegacyActive && activeTab === 'live'}           onClick={() => handleGoTo('live')} />
                <TabBtn label="Bookings"       active={!isLegacyActive && activeTab === 'bookings'}       onClick={() => handleGoTo('bookings')} />
                <TabBtn label="Events"         active={!isLegacyActive && activeTab === 'events'}         onClick={() => handleGoTo('events')} />
                <TabBtn label="Users"          active={!isLegacyActive && activeTab === 'users'}          badge={pendingApprovalsCount}  onClick={() => handleGoTo('users')} />
                <TabBtn label="Access Control" active={!isLegacyActive && activeTab === 'accessControl'}  onClick={() => handleGoTo('accessControl')} />
                <TabBtn label="Approvals"      active={!isLegacyActive && activeTab === 'approvals'}      badge={pendingRequestsCount}   onClick={() => handleGoTo('approvals')} />
            </div>

            {/* ── More Tools Drawer Toggle ────────────────────────────────── */}
            <div className="mb-6">
                <button
                    onClick={() => { setShowLegacy(v => !v); if (showLegacy) setActiveLegacyTab(null); }}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#3a3d47] hover:text-[#5D616B] transition-colors py-2"
                >
                    <svg className={`w-3 h-3 transition-transform ${showLegacy ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" /></svg>
                    More Tools
                    {isLegacyActive && <span className="ml-1 text-[#5D616B]">· {activeLegacyTab}</span>}
                </button>

                {showLegacy && (
                    <div className="flex flex-wrap gap-2 pb-3 pt-1 border-b border-[#1C1D22] animate-fade-in">
                        {([
                            { key: 'analytics', label: 'Analytics' },
                            { key: 'wingmanStats', label: 'Wingman Stats' },
                            { key: 'wingmen', label: 'Wingmen' },
                            { key: 'venues', label: 'Venues' },
                            { key: 'store', label: 'Store' },
                            { key: 'pushNotifications', label: 'Push Notifications' },
                        ] as { key: LegacyTab; label: string }[]).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleLegacyTab(key)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeLegacyTab === key ? 'text-white' : 'text-[#5D616B] hover:text-gray-300'}`}
                                style={activeLegacyTab === key
                                    ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }
                                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Search + Filters (context-sensitive) ───────────────────── */}
            {(showSearch || (isLegacyActive && showLegacy)) && (
                <div className="mb-6 space-y-4">
                    {showSearch && (
                        <div className="relative">
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder={`Search ${isLegacyActive ? activeLegacyTab : activeTab}…`}
                                className="w-full bg-[#0F1014] border border-[#1C1D22] text-sm text-white rounded-xl p-3 pl-10 focus:ring-white focus:border-white transition-colors"
                            />
                            <svg className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-[#5D616B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                        </div>
                    )}
                    {renderFilters()}
                </div>
            )}

            {/* ── Content ─────────────────────────────────────────────────── */}
            <div>{renderContent()}</div>

            {/* ── Modals (unchanged) ──────────────────────────────────────── */}
            <UserAnalyticsModal
                isOpen={!!userForAnalytics}
                onClose={() => setUserForAnalytics(null)}
                user={userForAnalytics}
                bookedItems={props.bookedItems}
                venues={props.venues}
            />
            <WingmanStatsModal
                isOpen={!!wingmanForStats}
                onClose={() => setWingmanForStats(null)}
                wingman={wingmanForStats}
                allBookings={props.bookedItems}
                allGuestlistRequests={props.guestlistRequests}
            />
        </div>
    );
};
