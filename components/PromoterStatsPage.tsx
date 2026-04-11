
import React, { useState, useMemo } from 'react';
import { Page, User, CartItem, GuestlistJoinRequest, Venue } from '../types';
import { StatCard } from './StatCard';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { BookingsIcon } from './icons/BookingsIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ArrowUpIcon, ArrowDownIcon } from './icons/FeatureIcons';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { venues as allVenues } from '../data/mockData';
import { StarIcon } from './icons/StarIcon';

interface PromoterStatsPageProps {
  currentUser: User;
  bookedItems: CartItem[];
  guestlistRequests: GuestlistJoinRequest[];
  users: User[];
  onNavigate: (page: Page) => void;
}

type TimeFilter = 'week' | 'month' | 'all';
type ClientSortKey = 'totalSpend' | 'bookingCount' | 'lastBooking' | 'name';

const isDateInPeriod = (date: Date, period: TimeFilter): boolean => {
    if (period === 'all') return true;
    
    const now = new Date();
    const startOfPeriod = new Date(now);

    switch (period) {
        case 'week':
            const firstDayOfWeek = now.getDate() - now.getDay();
            startOfPeriod.setDate(firstDayOfWeek);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
        case 'month':
            startOfPeriod.setDate(1);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
    }
    return date >= startOfPeriod;
};

const SortableHeader: React.FC<{
    label: string;
    sortKey: string;
    sortConfig: { key: string | null; direction: 'asc' | 'desc' };
    requestSort: (key: string) => void;
    className?: string;
}> = ({ label, sortKey, sortConfig, requestSort, className }) => {
    const isSorted = sortConfig.key === sortKey;
    const Icon = sortConfig.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;

    return (
        <th scope="col" className={`px-4 py-4 ${className || ''}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1.5 group text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition-colors">
                {label}
                {isSorted ? <Icon className="w-3.5 h-3.5 text-[#EC4899]" /> : <Icon className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />}
            </button>
        </th>
    );
};

export const PromoterStatsPage: React.FC<PromoterStatsPageProps> = ({ currentUser, bookedItems, guestlistRequests, users, onNavigate }) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [clientSortConfig, setClientSortConfig] = useState<{ key: ClientSortKey | null; direction: 'asc' | 'desc' }>({ key: 'totalSpend', direction: 'desc' });

    const myBookings = useMemo(() => {
        return bookedItems.filter(item => 
            item.tableDetails?.promoter?.id === currentUser.id &&
            item.bookedTimestamp && isDateInPeriod(new Date(item.bookedTimestamp), timeFilter)
        );
    }, [bookedItems, currentUser.id, timeFilter]);

    const myGuestlistRequests = useMemo(() => {
        return guestlistRequests.filter(req => 
            req.promoterId === currentUser.id &&
            isDateInPeriod(new Date(req.date + 'T00:00:00'), timeFilter)
        );
    }, [guestlistRequests, currentUser.id, timeFilter]);

    const overallStats = useMemo(() => {
        const totalRevenue = myBookings.reduce((acc, item) => {
             const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
             return acc + (price || 0);
        }, 0);
        const totalGuests = myBookings.reduce((acc, item) => acc + (item.tableDetails?.numberOfGuests || 0), 0);
        const shows = myGuestlistRequests.filter(r => r.attendanceStatus === 'show').length;
        const noShows = myGuestlistRequests.filter(r => r.attendanceStatus === 'no-show').length;
        const showRate = (shows + noShows) > 0 ? (shows / (shows + noShows)) * 100 : 0;
        
        return { totalRevenue, totalBookings: myBookings.length, totalGuests, showRate };
    }, [myBookings, myGuestlistRequests]);

    const topClients = useMemo(() => {
        const clientData: { [userId: number]: { user: User; totalSpend: number; lastBooking: string; bookingCount: number } } = {};

        myBookings.forEach(booking => {
            const guestDetails = booking.tableDetails?.guestDetails || booking.eventDetails?.guestDetails;
            if (!guestDetails) return;

            const user = users.find(u => u.email === guestDetails.email || u.name === guestDetails.name);
            if (!user) return;
            
            const price = booking.paymentOption === 'full' ? booking.fullPrice : booking.depositPrice;

            if (!clientData[user.id]) {
                clientData[user.id] = { user, totalSpend: 0, lastBooking: 'N/A', bookingCount: 0 };
            }
            clientData[user.id].totalSpend += price || 0;
            clientData[user.id].bookingCount += 1;
            if (!clientData[user.id].lastBooking || new Date(booking.sortableDate || 0) > new Date(clientData[user.id].lastBooking)) {
                clientData[user.id].lastBooking = booking.sortableDate || 'N/A';
            }
        });

        return Object.values(clientData);
    }, [myBookings, users]);
    
    const sortedClients = useMemo(() => {
        let sortableItems = [...topClients];
        if (clientSortConfig.key) {
            sortableItems.sort((a, b) => {
                let aVal: any = a[clientSortConfig.key as keyof typeof a];
                let bVal: any = b[clientSortConfig.key as keyof typeof b];
                
                if (clientSortConfig.key === 'name') {
                    aVal = a.user.name;
                    bVal = b.user.name;
                }

                if (aVal < bVal) {
                    return clientSortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return clientSortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [topClients, clientSortConfig]);
    
    const requestClientSort = (key: string) => {
        const sortKey = key as ClientSortKey;
        let direction: 'asc' | 'desc' = 'desc';
        if (clientSortConfig.key === sortKey && clientSortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setClientSortConfig({ key: sortKey, direction });
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white space-y-8 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <button onClick={() => onNavigate('userProfile')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2 text-sm font-bold">
                        <ChevronLeftIcon className="w-4 h-4"/>
                        Back to Profile
                    </button>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">Performance Overview</h1>
                </div>
                <div className="flex items-center bg-gray-900 rounded-xl p-1.5 border border-gray-800 shadow-lg">
                    {(['week', 'month', 'all'] as TimeFilter[]).map(period => (
                        <button 
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                                timeFilter === period 
                                ? 'bg-[#EC4899] text-white shadow-lg shadow-[#EC4899]/20' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            {period === 'all' ? 'All Time' : `This ${period}`}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors duration-500"></div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                         <div className="p-2 bg-gray-800 rounded-lg text-green-400">
                             <CurrencyDollarIcon className="w-6 h-6" />
                         </div>
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total Revenue</h3>
                    </div>
                    <p className="text-3xl font-black text-white relative z-10">${overallStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                 <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-500"></div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                         <div className="p-2 bg-gray-800 rounded-lg text-blue-400">
                             <BookingsIcon className="w-6 h-6" />
                         </div>
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total Bookings</h3>
                    </div>
                    <p className="text-3xl font-black text-white relative z-10">{overallStats.totalBookings.toLocaleString()}</p>
                </div>

                 <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors duration-500"></div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                         <div className="p-2 bg-gray-800 rounded-lg text-purple-400">
                             <UsersIcon className="w-6 h-6" />
                         </div>
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Guests Booked</h3>
                    </div>
                    <p className="text-3xl font-black text-white relative z-10">{overallStats.totalGuests.toLocaleString()}</p>
                </div>

                 <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors duration-500"></div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                         <div className="p-2 bg-gray-800 rounded-lg text-amber-400">
                             <StarIcon className="w-6 h-6" />
                         </div>
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Show Rate</h3>
                    </div>
                    <p className="text-3xl font-black text-white relative z-10">{overallStats.showRate.toFixed(1)}%</p>
                </div>
            </div>

            <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/20">
                    <h3 className="text-xl font-bold text-white">Top Clients</h3>
                    <div className="bg-gray-800 text-xs font-bold px-3 py-1 rounded-full text-gray-300 border border-gray-700">
                        {sortedClients.length} Clients Found
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-900/50 border-b border-gray-800">
                            <tr>
                                <SortableHeader label="Client" sortKey="name" sortConfig={clientSortConfig} requestSort={requestClientSort} />
                                <SortableHeader label="Total Spend" sortKey="totalSpend" sortConfig={clientSortConfig} requestSort={requestClientSort} className="text-right" />
                                <SortableHeader label="Bookings" sortKey="bookingCount" sortConfig={clientSortConfig} requestSort={requestClientSort} className="text-right" />
                                <SortableHeader label="Last Booking" sortKey="lastBooking" sortConfig={clientSortConfig} requestSort={requestClientSort} className="text-right" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {sortedClients.map(({ user, totalSpend, bookingCount, lastBooking }) => (
                                <tr key={user.id} className="hover:bg-gray-800/40 transition-colors group">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-700 group-hover:border-gray-500 transition-colors" />
                                                {user.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1C1C1E] rounded-full"></div>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{user.name}</p>
                                                {user.instagramHandle && <p className="text-xs text-gray-400">@{user.instagramHandle}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right font-bold text-green-400">
                                        ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium text-white">
                                        {bookingCount}
                                    </td>
                                    <td className="px-4 py-4 text-right text-gray-400 font-medium">
                                        {lastBooking}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {sortedClients.length === 0 && (
                         <div className="py-16 text-center">
                             <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                                 <UsersIcon className="w-8 h-8" />
                             </div>
                             <p className="text-gray-400 font-medium">No client data available for this period.</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};
