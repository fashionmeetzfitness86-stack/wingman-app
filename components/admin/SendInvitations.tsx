import React, { useState, useMemo, useEffect } from 'react';
import { Event, User, Page, CartItem, EventInvitation, UserAccessLevel, UserRole, SpenderCategory, UserWithAnalytics } from '../../types';
import { EyeIcon } from '../icons/FeatureIcons';

interface SendInvitationsProps {
    users: User[];
    events: Event[];
    bookedItems: CartItem[];
    eventInvitations: EventInvitation[];
    onPreviewUser: (user: User) => void;
    onSendDirectInvites: (eventId: number, userIds: number[]) => void;
    invitationRequests: { userId: number; eventId: number; status: string }[];
}

const SPENDER_CATEGORIES: SpenderCategory[] = ['<$5k', '$5k+', '$10k+', '$20k+'];

export const SendInvitations: React.FC<SendInvitationsProps> = ({ users, events, bookedItems, eventInvitations, onPreviewUser, onSendDirectInvites, invitationRequests }) => {
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [accessLevelFilter, setAccessLevelFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [spenderFilter, setSpenderFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    const usersWithAnalytics: UserWithAnalytics[] = useMemo(() => {
        return users.map(user => {
            const userBookings = bookedItems.filter(item => {
                const guestDetails = item.tableDetails?.guestDetails || item.eventDetails?.guestDetails;
                return guestDetails?.email === user.email;
            });
            const totalSpend = userBookings.reduce((acc, item) => acc + (item.fullPrice || item.depositPrice || 0), 0);

            let spenderCategory: SpenderCategory;
            if (totalSpend >= 20000) spenderCategory = '$20k+';
            else if (totalSpend >= 10000) spenderCategory = '$10k+';
            else if (totalSpend >= 5000) spenderCategory = '$5k+';
            else spenderCategory = '<$5k';

            return { ...user, totalSpend, spenderCategory };
        });
    }, [users, bookedItems]);

    const filteredUsers = useMemo(() => {
        return usersWithAnalytics.filter(user => {
            if (!selectedEventId) return false;
            const searchMatch = searchTerm === '' || user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const accessLevelMatch = accessLevelFilter === 'all' || user.accessLevel === accessLevelFilter;
            const roleMatch = roleFilter === 'all' || user.role === roleFilter;
            const spenderMatch = spenderFilter === 'all' || user.spenderCategory === spenderFilter;
            return searchMatch && accessLevelMatch && roleMatch && spenderMatch;
        });
    }, [usersWithAnalytics, selectedEventId, searchTerm, accessLevelFilter, roleFilter, spenderFilter]);

    useEffect(() => {
        if (selectedEventId) {
            const eventIdNum = parseInt(selectedEventId, 10);
            const currentlyInvited = eventInvitations
                .filter(inv => inv.eventId === eventIdNum)
                .map(inv => inv.inviteeId);
            setSelectedUserIds(currentlyInvited);
        } else {
            setSelectedUserIds([]);
        }
    }, [selectedEventId, eventInvitations]);

    const handleUserToggle = (userId: number) => {
        setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    const handleSelectAll = () => {
        setSelectedUserIds(filteredUsers.map(u => u.id));
    };

    const handleDeselectAll = () => {
        setSelectedUserIds([]);
    };
    
    const handleSync = () => {
        if (!selectedEventId) return;
        onSendDirectInvites(parseInt(selectedEventId, 10), selectedUserIds);
    };

    const getInvitationStatus = (userId: number, eventId: number) => {
        const invite = eventInvitations.find(inv => inv.inviteeId === userId && inv.eventId === eventId);
        if (invite) return { status: `Invited (${invite.status})`, color: 'text-green-400' };
        
        const request = invitationRequests.find(req => req.userId === userId && req.eventId === eventId);
        if (request) return { status: `Requested (${request.status})`, color: 'text-yellow-400' };

        return null;
    };


    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3">
                    <option value="">-- Select an Event --</option>
                    {events.map(e => <option key={e.id} value={String(e.id)}>{e.title}</option>)}
                </select>
                <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search users..." className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3" disabled={!selectedEventId} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select value={accessLevelFilter} onChange={e => setAccessLevelFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3" disabled={!selectedEventId}>
                    <option value="all">All Access Levels</option>
                    {Object.values(UserAccessLevel).map(level => <option key={level} value={level}>{level}</option>)}
                </select>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3" disabled={!selectedEventId}>
                    <option value="all">All Roles</option>
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <select value={spenderFilter} onChange={e => setSpenderFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3" disabled={!selectedEventId}>
                    <option value="all">All Spenders</option>
                    {SPENDER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2 border-t border-b border-gray-700 py-4">
                {!selectedEventId && <p className="text-center text-gray-400 py-8">Please select an event to see available users.</p>}
                {selectedEventId && filteredUsers.map(user => {
                    const statusInfo = getInvitationStatus(user.id, parseInt(selectedEventId, 10));
                    return (
                        <div key={user.id} className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-lg">
                            <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => handleUserToggle(user.id)} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-[#EC4899] focus:ring-[#EC4899] flex-shrink-0" />
                            <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-grow">
                                <p className="font-semibold text-white">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            <div className="hidden md:flex flex-col text-right">
                               <span className="text-xs font-semibold px-2 py-1 bg-gray-700 text-gray-300 rounded-full">{user.accessLevel}</span>
                               <span className="text-xs font-semibold px-2 py-1 bg-amber-900/50 text-amber-300 rounded-full mt-1">{user.spenderCategory}</span>
                            </div>
                            {statusInfo && <span className={`text-xs font-bold w-28 text-center ${statusInfo.color}`}>{statusInfo.status}</span>}
                            <button onClick={() => onPreviewUser(user)} className="p-2 text-gray-400 hover:text-white"><EyeIcon className="w-5 h-5"/></button>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                    <button onClick={handleSelectAll} className="text-xs font-semibold text-gray-300 hover:text-white" disabled={!selectedEventId}>Select All Visible ({filteredUsers.length})</button>
                    <button onClick={handleDeselectAll} className="text-xs font-semibold text-gray-300 hover:text-white" disabled={!selectedEventId}>Deselect All</button>
                </div>
                <button onClick={handleSync} disabled={!selectedEventId} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg text-sm disabled:bg-gray-600">
                    Sync Invitations ({selectedUserIds.length})
                </button>
            </div>
        </div>
    );
};