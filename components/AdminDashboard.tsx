
import React, { useState, useMemo, useEffect } from 'react';
import { Promoter, User, Page, AccessGroup, EventInvitationRequest, UserAccessLevel, Event, UserRole, Venue, CartItem, PromoterApplication, GuestlistJoinRequest, StoreItem, EventInvitation, AppNotification, PushCampaign } from '../types';
import { ManagementTab } from './admin/ManagementTab';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { AdminPromoterListItem } from './AdminPromoterListItem';
import { AdminUserListItem } from './AdminUserListItem';
import { AdminEventListItem } from './AdminEventListItem';
import { AdminVenueListItem } from './AdminVenueListItem';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { StoreTab } from './admin/StoreTab';
import { PromoterStatsTab } from './admin/PromoterStatsTab';
import { PushNotificationsTab } from './admin/PushNotificationsTab';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';
import { UserAnalyticsModal } from './modals/UserAnalyticsModal';
import { PromoterStatsModal } from './modals/PromoterStatsModal';

interface AdminDashboardProps {
    users: User[];
    promoters: Promoter[];
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
    onEditPromoter: (promoter: Promoter, user: User) => void;
    onDeletePromoter: (promoter: Promoter) => void;
    onSuspendPromoter: (user: User) => void;
    onPreviewPromoter: (promoter: Promoter) => void;
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
    promoterApplications: PromoterApplication[];
    onApprovePromoterApplication: (appId: number) => void;
    onRejectPromoterApplication: (appId: number, feedback?: string) => void;
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
}


const FilterDropdown: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: (string | { value: string; label: string })[] }> = ({ label, value, onChange, options }) => (
    <div className="relative flex-grow">
        <label htmlFor={`filter-${label}`} className="sr-only">{label}</label>
        <select
            id={`filter-${label}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 appearance-none focus:ring-[#EC4899] focus:border-[#EC4899] pr-8"
        >
            <option value="all">All {label}s</option>
            {options.map(opt => (
                typeof opt === 'string'
                    ? <option key={opt} value={opt}>{opt}</option>
                    : <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
    </div>
);


export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'analytics' | 'management' | 'promoters' | 'users' | 'events' | 'venues' | 'store' | 'promoterStats' | 'pushNotifications'>('management');
    const [searchTerm, setSearchTerm] = useState('');
    const { promoters, venues, users, events } = props;

    // Filter states
    const [promoterCityFilter, setPromoterCityFilter] = useState('all');
    const [promoterVenueFilter, setPromoterVenueFilter] = useState('all');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userAccessLevelFilter, setUserAccessLevelFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [eventTypeFilter, setEventTypeFilter] = useState('all');
    const [eventVenueFilter, setEventVenueFilter] = useState('all');
    const [venueLocationFilter, setVenueLocationFilter] = useState('all');
    const [venueMusicTypeFilter, setVenueMusicTypeFilter] = useState('all');
    const [venueVibeFilter, setVenueVibeFilter] = useState('all');

    // Bulk Actions State for Events
    const [selectedEventIds, setSelectedEventIds] = useState<(number | string)[]>([]);
    
    // User Analytics State
    const [userForAnalytics, setUserForAnalytics] = useState<User | null>(null);
    const [promoterForStats, setPromoterForStats] = useState<Promoter | null>(null);

    useEffect(() => {
        setSearchTerm('');
        setPromoterCityFilter('all');
        setPromoterVenueFilter('all');
        setUserRoleFilter('all');
        setUserAccessLevelFilter('all');
        setUserStatusFilter('all');
        setEventTypeFilter('all');
        setEventVenueFilter('all');
        setVenueLocationFilter('all');
        setVenueMusicTypeFilter('all');
        setVenueVibeFilter('all');
        setSelectedEventIds([]);
    }, [activeTab]);


    const pendingRequestsCount = useMemo(() => {
        return props.promoterApplications.filter(a => a.status === 'pending').length +
               props.pendingGroups.length +
               props.invitationRequests.filter(req => req.status === 'pending').length;
    }, [props.promoterApplications, props.pendingGroups, props.invitationRequests]);
    
    const filteredPromoters = useMemo(() => promoters.filter(p => {
        const searchMatch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.handle.toLowerCase().includes(searchTerm.toLowerCase()) || p.city.toLowerCase().includes(searchTerm.toLowerCase());
        const cityMatch = promoterCityFilter === 'all' || p.city === promoterCityFilter;
        const venueMatch = promoterVenueFilter === 'all' || p.assignedVenueIds.includes(parseInt(promoterVenueFilter));
        return searchMatch && cityMatch && venueMatch;
    }), [promoters, searchTerm, promoterCityFilter, promoterVenueFilter]);

    const filteredUsers = useMemo(() => users.filter(u => {
        const searchMatch = searchTerm === '' || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = userRoleFilter === 'all' || u.role === userRoleFilter;
        const accessLevelMatch = userAccessLevelFilter === 'all' || u.accessLevel === userAccessLevelFilter;
        const statusMatch = userStatusFilter === 'all' || u.status === userStatusFilter;
        return searchMatch && roleMatch && accessLevelMatch && statusMatch;
    }), [users, searchTerm, userRoleFilter, userAccessLevelFilter, userStatusFilter]);

    const filteredEvents = useMemo(() => events.filter(e => {
        const searchMatch = searchTerm === '' || e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.description.toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = eventTypeFilter === 'all' || e.type === eventTypeFilter;
        const venueMatch = eventVenueFilter === 'all' || e.venueId === parseInt(eventVenueFilter);
        return searchMatch && typeMatch && venueMatch;
    }), [events, searchTerm, eventTypeFilter, eventVenueFilter]);

    const filteredVenues = useMemo(() => venues.filter(v => {
        const searchMatch = searchTerm === '' || v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.location.toLowerCase().includes(searchTerm.toLowerCase());
        const locationMatch = venueLocationFilter === 'all' || v.location === venueLocationFilter;
        const musicTypeMatch = venueMusicTypeFilter === 'all' || v.musicType === venueMusicTypeFilter;
        const vibeMatch = venueVibeFilter === 'all' || v.vibe === venueVibeFilter;
        return searchMatch && locationMatch && musicTypeMatch && vibeMatch;
    }), [venues, searchTerm, venueLocationFilter, venueMusicTypeFilter, venueVibeFilter]);
    
    const promoterCities = useMemo(() => [...new Set(promoters.map(p => p.city))], [promoters]);
    const venueLocations = useMemo(() => [...new Set(venues.map(v => v.location))], [venues]);
    const venueMusicTypes = useMemo(() => [...new Set(venues.map(v => v.musicType))], [venues]);
    const venueVibes = useMemo(() => [...new Set(venues.map(v => v.vibe))], [venues]);

    const getVenueName = (id: number) => venues.find(v => v.id === id)?.name || 'N/A';
    
    // Bulk Action Handlers
    const handleToggleEventSelection = (eventId: number | string) => {
        setSelectedEventIds(prev => 
            prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
        );
    };

    const handleSelectAllEvents = () => {
        if (selectedEventIds.length === filteredEvents.length) {
            setSelectedEventIds([]);
        } else {
            setSelectedEventIds(filteredEvents.map(e => e.id));
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedEventIds.length} events?`)) {
            props.onBulkDeleteEvents?.(selectedEventIds);
            setSelectedEventIds([]);
        }
    };

    const handleBulkUpdateType = (type: 'EXCLUSIVE' | 'INVITE ONLY') => {
        props.onBulkUpdateEvents?.(selectedEventIds, { type });
        setSelectedEventIds([]);
    };

    const renderFilters = () => {
        const filters = (() => {
            switch (activeTab) {
                case 'promoters':
                    return (
                        <>
                            <FilterDropdown label="City" value={promoterCityFilter} onChange={setPromoterCityFilter} options={promoterCities} />
                            <FilterDropdown label="Venue" value={promoterVenueFilter} onChange={setPromoterVenueFilter} options={venues.map(v => ({ value: v.id.toString(), label: v.name }))} />
                        </>
                    );
                case 'users':
                    return (
                        <>
                            <FilterDropdown label="Role" value={userRoleFilter} onChange={setUserRoleFilter} options={Object.values(UserRole)} />
                            <FilterDropdown label="Access" value={userAccessLevelFilter} onChange={setUserAccessLevelFilter} options={Object.values(UserAccessLevel)} />
                            <FilterDropdown label="Status" value={userStatusFilter} onChange={setUserStatusFilter} options={['active', 'blocked']} />
                        </>
                    );
                case 'events':
                    return (
                        <>
                            <FilterDropdown label="Type" value={eventTypeFilter} onChange={setEventTypeFilter} options={['EXCLUSIVE', 'INVITE ONLY']} />
                            <FilterDropdown label="Venue" value={eventVenueFilter} onChange={setEventVenueFilter} options={venues.map(v => ({ value: v.id.toString(), label: v.name }))} />
                        </>
                    );
                case 'venues':
                    return (
                        <>
                            <FilterDropdown label="Location" value={venueLocationFilter} onChange={setVenueLocationFilter} options={venueLocations} />
                            <FilterDropdown label="Music" value={venueMusicTypeFilter} onChange={setVenueMusicTypeFilter} options={venueMusicTypes} />
                            <FilterDropdown label="Vibe" value={venueVibeFilter} onChange={setVenueVibeFilter} options={venueVibes} />
                        </>
                    );
                case 'store':
                     return null; // Store tab has its own filters
                default:
                    return null;
            }
        })();
        
        return filters ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{filters}</div> : null;
    };
    
    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">
            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('analytics')} className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'analytics' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}>
                    Analytics
                </button>
                 <button onClick={() => setActiveTab('promoterStats')} className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'promoterStats' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}>
                    Promoter Stats
                </button>
                <button onClick={() => setActiveTab('promoters')} className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'promoters' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}>
                    Promoters
                </button>
                <button onClick={() => setActiveTab('users')} className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'users' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}>
                    Users
                </button>
                <button onClick={() => setActiveTab('events')} className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'events' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}>
                    Events
                </button>
                <button onClick={() => setActiveTab('venues')} className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'venues' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}>
                    Venues
                </button>
                <button onClick={() => setActiveTab('store')} className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'store' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}>
                    Store
                </button>
                 <button onClick={() => setActiveTab('management')} className={`relative flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'management' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}>
                    Management
                    {pendingRequestsCount > 0 && (
                        <span className="absolute top-1 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">{pendingRequestsCount}</span>
                    )}
                </button>
                <button onClick={() => setActiveTab('pushNotifications')} className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'pushNotifications' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}>
                    Push Notifications
                </button>
            </div>
            
             <div className="mb-6 space-y-4">
                {activeTab !== 'management' && activeTab !== 'analytics' && activeTab !== 'store' && activeTab !== 'promoterStats' && activeTab !== 'pushNotifications' && (
                    <div className="relative">
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Search ${activeTab}...`}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                        </div>
                    </div>
                )}
              {renderFilters()}
            </div>

            <div>
                {activeTab === 'analytics' && (
                    <AnalyticsTab 
                        bookedItems={props.bookedItems}
                        guestlistRequests={props.guestlistRequests}
                        allRsvps={props.allRsvps}
                        users={props.users}
                        events={props.events}
                        venues={props.venues}
                        promoters={props.promoters}
                    />
                )}
                {activeTab === 'promoterStats' && (
                    <PromoterStatsTab 
                        promoters={props.promoters}
                        bookedItems={props.bookedItems}
                        guestlistRequests={props.guestlistRequests}
                        onPreviewPromoter={props.onPreviewPromoter}
                        onViewStats={(p) => setPromoterForStats(p)}
                    />
                )}
                {activeTab === 'promoters' && (
                    <div className="space-y-3">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => props.onNavigate('promoterApplication')} className="bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg text-sm">Add Promoter</button>
                        </div>
                        {filteredPromoters.length > 0 ? filteredPromoters.map(promoter => {
                            const user = props.users.find(u => u.id === promoter.id);
                            if (!user) return null;
                            return <AdminPromoterListItem key={promoter.id} promoter={promoter} user={user} onEdit={props.onEditPromoter} onDelete={props.onDeletePromoter} onPreview={props.onPreviewPromoter} onSuspend={props.onSuspendPromoter} onViewStats={(p) => setPromoterForStats(p)} />;
                        }) : <p className="text-center text-gray-500 py-8">No promoters found.</p>}
                    </div>
                )}
                {activeTab === 'users' && (
                    <div className="space-y-3">
                        <div className="flex justify-end mb-4">
                            <button onClick={props.onAddUser} className="bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg text-sm">Create User</button>
                        </div>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => <AdminUserListItem key={user.id} user={user} onEdit={props.onEditUser} onViewProfile={props.onViewUser} onBlock={props.onBlockUser} onViewAnalytics={(u) => setUserForAnalytics(u)} />) : <p className="text-center text-gray-500 py-8">No users found.</p>}
                    </div>
                )}
                {activeTab === 'events' && (
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
                                    <button onClick={() => setSelectedEventIds([])} className="p-1.5 text-gray-400 hover:text-white" title="Clear Selection">
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={handleSelectAllEvents} className="text-sm text-gray-400 hover:text-white font-semibold">Select All Visible</button>
                            )}
                            <button onClick={props.onAddEvent} className="bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg text-sm">Add Event</button>
                        </div>
                        {filteredEvents.length > 0 ? filteredEvents.map(event => <AdminEventListItem key={event.id} event={event} venueName={getVenueName(event.venueId)} onEdit={props.onEditEvent} onDelete={props.onDeleteEvent} onPreview={props.onPreviewEvent} isSelected={selectedEventIds.includes(event.id)} onToggleSelect={handleToggleEventSelection} />) : <p className="text-center text-gray-500 py-8">No events found.</p>}
                    </div>
                )}
                 {activeTab === 'venues' && (
                    <div className="space-y-3">
                         <div className="flex justify-end mb-4">
                            <button onClick={props.onAddVenue} className="bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg text-sm">Add Venue</button>
                        </div>
                        {filteredVenues.length > 0 ? filteredVenues.map(venue => <AdminVenueListItem key={venue.id} venue={venue} onEdit={props.onEditVenue} onDelete={props.onDeleteVenue} onPreview={props.onPreviewVenue} />) : <p className="text-center text-gray-500 py-8">No venues found.</p>}
                    </div>
                )}
                {activeTab === 'store' && (
                    <StoreTab 
                        storeItems={props.storeItems}
                        onAddItem={props.onAddStoreItem}
                        onEditItem={props.onEditStoreItem}
                        onDeleteItem={props.onDeleteStoreItem}
                        onPreviewItem={props.onPreviewStoreItem}
                    />
                )}
                {activeTab === 'management' && (
                     <ManagementTab 
                        promoterApplications={props.promoterApplications}
                        onApprovePromoterApplication={props.onApprovePromoterApplication}
                        onRejectPromoterApplication={props.onRejectPromoterApplication}
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
                     />
                )}
                 {activeTab === 'pushNotifications' && (
                    <PushNotificationsTab
                        events={props.events}
                        venues={props.venues}
                        users={props.users}
                        campaigns={props.pushCampaigns}
                        onCreateCampaign={props.onCreatePushCampaign}
                        onToggleStatus={props.onToggleCampaignStatus}
                        onDelete={props.onDeleteCampaign}
                    />
                )}
            </div>
            
            <UserAnalyticsModal 
                isOpen={!!userForAnalytics}
                onClose={() => setUserForAnalytics(null)}
                user={userForAnalytics}
                bookedItems={props.bookedItems}
                venues={props.venues}
            />

            <PromoterStatsModal
                isOpen={!!promoterForStats}
                onClose={() => setPromoterForStats(null)}
                promoter={promoterForStats}
                allBookings={props.bookedItems}
                allGuestlistRequests={props.guestlistRequests}
            />
        </div>
    );
};
