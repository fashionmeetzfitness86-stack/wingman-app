
import React, { useState, useMemo } from 'react';
import { GuestlistJoinRequest, User, Venue, Promoter } from '../../types';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { CloseIcon } from '../icons/CloseIcon';

interface GuestlistAttendanceTabProps {
  requests: GuestlistJoinRequest[];
  users: User[];
  venues: Venue[];
  promoters: Promoter[];
  onViewUser: (user: User) => void;
  onUpdateRequestStatus: (requestId: number, status: 'pending' | 'show' | 'no-show') => void;
  onReviewGuestlistRequest?: (requestId: number, status: 'approved' | 'rejected') => void;
}

const GuestlistAttendanceRow: React.FC<{
    request: GuestlistJoinRequest;
    user: User;
    promoter: Promoter;
    onViewUser: (user: User) => void;
    onUpdateRequestStatus: (requestId: number, status: 'pending' | 'show' | 'no-show') => void;
}> = ({ request, user, promoter, onViewUser, onUpdateRequestStatus }) => {
    
    const statusColor = {
        pending: 'bg-yellow-900/50 text-yellow-300',
        show: 'bg-green-900/50 text-green-300',
        'no-show': 'bg-red-900/50 text-red-300',
    };

    return (
        <tr className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800">
            <td className="px-4 py-3">
                <button onClick={() => onViewUser(user)} className="flex items-center gap-3 group">
                    <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                    <span className="font-semibold text-white group-hover:underline">{user.name}</span>
                </button>
            </td>
            <td className="px-4 py-3 text-gray-300">{promoter.name}</td>
            <td className="px-4 py-3">
                <select 
                    value={request.attendanceStatus}
                    onChange={(e) => onUpdateRequestStatus(request.id, e.target.value as any)}
                    className={`border text-xs font-semibold rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 block w-full ${statusColor[request.attendanceStatus] || 'bg-gray-700 border-gray-600'}`}
                >
                    <option value="pending">Pending</option>
                    <option value="show">Show</option>
                    <option value="no-show">No-Show</option>
                </select>
            </td>
        </tr>
    );
};

const PendingRequestRow: React.FC<{
    request: GuestlistJoinRequest;
    user: User;
    venue: Venue;
    date: string;
    onViewUser: (user: User) => void;
    onReview: (requestId: number, status: 'approved' | 'rejected') => void;
}> = ({ request, user, venue, date, onViewUser, onReview }) => {
    return (
        <tr className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800">
            <td className="px-4 py-3">
                <button onClick={() => onViewUser(user)} className="flex items-center gap-3 group">
                    <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                    <div className="text-left">
                        <span className="font-semibold text-white group-hover:underline block">{user.name}</span>
                        {user.instagramHandle && <span className="text-xs text-gray-400">@{user.instagramHandle}</span>}
                    </div>
                </button>
            </td>
            <td className="px-4 py-3 text-gray-300">
                <span className="block font-semibold">{venue.name}</span>
                <span className="text-xs text-gray-400">{date}</span>
            </td>
             <td className="px-4 py-3 text-gray-300">
                {user.accessLevel}
            </td>
            <td className="px-4 py-3">
                <div className="flex gap-2">
                    <button 
                        onClick={() => onReview(request.id, 'approved')}
                        className="p-2 bg-green-900/50 text-green-400 rounded-lg hover:bg-green-900/80 transition-colors"
                        title="Approve"
                    >
                        <CheckIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => onReview(request.id, 'rejected')}
                        className="p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/80 transition-colors"
                        title="Reject"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export const GuestlistAttendanceTab: React.FC<GuestlistAttendanceTabProps> = ({ requests, users, venues, promoters, onViewUser, onUpdateRequestStatus, onReviewGuestlistRequest }) => {
    const [selectedVenueId, setSelectedVenueId] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved'>('pending');

    const availableDates = useMemo(() => {
        if (selectedVenueId === 'all') return [];
        const venueId = parseInt(selectedVenueId);
        const dates = requests
            .filter(r => r.venueId === venueId && r.status === activeSubTab)
            .map(r => r.date);
        return [...new Set(dates)].sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
    }, [requests, selectedVenueId, activeSubTab]);

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            if (req.status !== activeSubTab) return false;
            const venueMatch = selectedVenueId === 'all' || req.venueId === parseInt(selectedVenueId);
            const dateMatch = !selectedDate || req.date === selectedDate;
            return venueMatch && dateMatch;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [requests, selectedVenueId, selectedDate, activeSubTab]);
    
    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-6">
             <div className="flex border-b border-gray-700 mb-4">
                <button 
                    onClick={() => setActiveSubTab('pending')}
                    className={`px-4 py-2 font-semibold transition-colors relative ${activeSubTab === 'pending' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    Pending Requests
                    {pendingCount > 0 && <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>}
                </button>
                <button 
                    onClick={() => setActiveSubTab('approved')}
                    className={`px-4 py-2 font-semibold transition-colors ${activeSubTab === 'approved' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    Approved Guestlist
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <label htmlFor="venue-filter" className="block text-sm font-medium text-gray-300 mb-2">Filter by Venue</label>
                    <select id="venue-filter" value={selectedVenueId} onChange={e => { setSelectedVenueId(e.target.value); setSelectedDate(''); }} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 appearance-none focus:ring-[#EC4899] focus:border-[#EC4899] pr-8">
                        <option value="all">All Venues</option>
                        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute bottom-3.5 right-3 pointer-events-none" />
                </div>
                 <div className="relative">
                    <label htmlFor="date-filter" className="block text-sm font-medium text-gray-300 mb-2">Filter by Date</label>
                    <select id="date-filter" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} disabled={selectedVenueId === 'all'} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 appearance-none focus:ring-[#EC4899] focus:border-[#EC4899] pr-8 disabled:opacity-50">
                        <option value="">All Dates for Venue</option>
                        {availableDates.map(date => <option key={date} value={date}>{date}</option>)}
                    </select>
                     <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute bottom-3.5 right-3 pointer-events-none" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                        <tr>
                            <th scope="col" className="px-4 py-3">Attendee</th>
                            {activeSubTab === 'approved' && <th scope="col" className="px-4 py-3">Promoter</th>}
                            {activeSubTab === 'pending' && (
                                <>
                                    <th scope="col" className="px-4 py-3">Request For</th>
                                    <th scope="col" className="px-4 py-3">Access</th>
                                </>
                            )}
                            <th scope="col" className="px-4 py-3">{activeSubTab === 'pending' ? 'Actions' : 'Attendance Status'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map(req => {
                            const user = users.find(u => u.id === req.userId);
                            const venue = venues.find(v => v.id === req.venueId);
                            const promoter = promoters.find(p => p.id === req.promoterId);
                            if (!user || !promoter || !venue) return null;
                            
                            if (activeSubTab === 'pending') {
                                return (
                                    <PendingRequestRow 
                                        key={req.id}
                                        request={req}
                                        user={user}
                                        venue={venue}
                                        date={req.date}
                                        onViewUser={onViewUser}
                                        onReview={onReviewGuestlistRequest || (() => {})}
                                    />
                                );
                            }

                            return (
                                <GuestlistAttendanceRow 
                                    key={req.id} 
                                    request={req} 
                                    user={user} 
                                    promoter={promoter}
                                    onViewUser={onViewUser}
                                    onUpdateRequestStatus={onUpdateRequestStatus}
                                />
                            );
                        })}
                    </tbody>
                </table>
                 {filteredRequests.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p>No {activeSubTab} records match your criteria.</p>
                        {selectedVenueId === 'all' && <p className="text-sm">Try selecting a venue to see more details.</p>}
                    </div>
                 )}
            </div>
        </div>
    );
};
