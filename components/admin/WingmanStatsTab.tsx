import React, { useState, useMemo } from 'react';
import { Wingman, CartItem, GuestlistJoinRequest } from '../../types';
import { StatCard } from '../StatCard';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { BookingsIcon } from '../icons/BookingsIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/FeatureIcons';
import { StarIcon } from '../icons/StarIcon';

interface WingmanStatsTabProps {
  wingmen: Wingman[];
  bookedItems: CartItem[];
  guestlistRequests: GuestlistJoinRequest[];
  onPreviewWingman: (wingman: Wingman) => void;
  onViewStats?: (wingman: Wingman) => void;
}

interface WingmanWithStats extends Wingman {
    totalRevenue: number;
    totalBookings: number;
    guestlistShows: number;
    guestlistNoShows: number;
    showRate: number;
}

type TimeFilter = 'week' | 'month' | 'all';

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
    sortKey: keyof WingmanWithStats;
    sortConfig: { key: keyof WingmanWithStats | null; direction: 'asc' | 'desc' };
    requestSort: (key: keyof WingmanWithStats) => void;
    className?: string;
}> = ({ label, sortKey, sortConfig, requestSort, className }) => {
    const isSorted = sortConfig.key === sortKey;
    const Icon = sortConfig.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;

    return (
        <th scope="col" className={`px-4 py-3 ${className || ''}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1 group">
                {label}
                {isSorted ? <Icon className="w-3 h-3" /> : <Icon className="w-3 h-3 text-gray-600 group-hover:text-gray-400" />}
            </button>
        </th>
    );
};


export const WingmanStatsTab: React.FC<WingmanStatsTabProps> = ({ wingmen, bookedItems, guestlistRequests, onPreviewWingman, onViewStats }) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof WingmanWithStats | null; direction: 'asc' | 'desc' }>({ key: 'totalRevenue', direction: 'desc' });

    const wingmanStats = useMemo<WingmanWithStats[]>(() => {
        return wingmen.map(wingman => {
            const wingmanBookings = bookedItems.filter(item => 
                item.tableDetails?.wingman?.id === wingman.id &&
                item.bookedTimestamp && isDateInPeriod(new Date(item.bookedTimestamp), timeFilter)
            );

            const totalRevenue = wingmanBookings.reduce((acc, item) => {
                 const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                 return acc + (price || 0);
            }, 0);

            const wingmanGuestlistRequests = guestlistRequests.filter(req => 
                req.wingmanId === wingman.id &&
                isDateInPeriod(new Date(req.date + 'T00:00:00'), timeFilter)
            );
            const guestlistShows = wingmanGuestlistRequests.filter(req => req.attendanceStatus === 'show').length;
            const guestlistNoShows = wingmanGuestlistRequests.filter(req => req.attendanceStatus === 'no-show').length;
            const totalAttendance = guestlistShows + guestlistNoShows;
            const showRate = totalAttendance > 0 ? (guestlistShows / totalAttendance) * 100 : 0;

            return {
                ...wingman,
                totalRevenue,
                totalBookings: wingmanBookings.length,
                guestlistShows,
                guestlistNoShows,
                showRate,
            };
        });
    }, [wingmen, bookedItems, guestlistRequests, timeFilter]);
    
    const sortedWingmen = useMemo(() => {
        let sortableItems = [...wingmanStats];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key!] < b[sortConfig.key!]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key!] > b[sortConfig.key!]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [wingmanStats, sortConfig]);

    const requestSort = (key: keyof WingmanWithStats) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };
    
    const overallStats = useMemo(() => {
        return wingmanStats.reduce((acc, p) => {
            acc.totalRevenue += p.totalRevenue;
            acc.totalBookings += p.totalBookings;
            acc.totalShows += p.guestlistShows;
            acc.totalNoShows += p.guestlistNoShows;
            return acc;
        }, { totalRevenue: 0, totalBookings: 0, totalShows: 0, totalNoShows: 0 });
    }, [wingmanStats]);
    
    const overallShowRate = (overallStats.totalShows + overallStats.totalNoShows) > 0 
        ? (overallStats.totalShows / (overallStats.totalShows + overallStats.totalNoShows)) * 100
        : 0;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Wingman Performance</h2>
                <div className="flex items-center bg-gray-800 rounded-lg p-1">
                    {(['week', 'month', 'all'] as TimeFilter[]).map(period => (
                        <button 
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${timeFilter === period ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            {period === 'all' ? 'All Time' : `This ${period}`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<CurrencyDollarIcon className="w-7 h-7" />} label="Total Revenue" value={`$${overallStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <StatCard icon={<BookingsIcon className="w-7 h-7" />} label="Total Bookings" value={overallStats.totalBookings.toLocaleString()} />
                <StatCard icon={<UsersIcon className="w-7 h-7" />} label="Guestlist Shows" value={overallStats.totalShows.toLocaleString()} />
                <StatCard icon={<UsersIcon className="w-7 h-7" />} label="Overall Show Rate" value={`${overallShowRate.toFixed(1)}%`} />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                        <tr>
                            <SortableHeader label="Wingman" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Revenue" sortKey="totalRevenue" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="Bookings" sortKey="totalBookings" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="GL Shows" sortKey="guestlistShows" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="GL No-Shows" sortKey="guestlistNoShows" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="Show Rate" sortKey="showRate" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="Favorites" sortKey="favoritedByCount" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                        </tr>
                    </thead>
                    <tbody>
                        {sortedWingmen.map(p => (
                            <tr 
                                key={p.id} 
                                onClick={() => onViewStats ? onViewStats(p) : onPreviewWingman(p)} 
                                className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                                title="Click to view detailed analytics"
                            >
                                <td className="px-4 py-3 font-semibold text-white">
                                    <div className="flex items-center gap-3">
                                        <img src={p.profilePhoto} alt={p.name} className="w-8 h-8 rounded-full object-cover"/>
                                        {p.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">${p.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-right">{p.totalBookings}</td>
                                <td className="px-4 py-3 text-right text-green-400 font-semibold">{p.guestlistShows}</td>
                                <td className="px-4 py-3 text-right text-red-400 font-semibold">{p.guestlistNoShows}</td>
                                <td className="px-4 py-3 text-right">{p.showRate.toFixed(1)}%</td>
                                <td className="px-4 py-3 text-right flex justify-end items-center gap-1">
                                    <StarIcon className="w-4 h-4 text-amber-400" />
                                    {p.favoritedByCount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedWingmen.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p>No wingman data available for the selected period.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};