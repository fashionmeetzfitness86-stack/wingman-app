import React, { useState, useMemo } from 'react';
import { Promoter, CartItem, GuestlistJoinRequest } from '../../types';
import { StatCard } from '../StatCard';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { BookingsIcon } from '../icons/BookingsIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/FeatureIcons';
import { StarIcon } from '../icons/StarIcon';

interface PromoterStatsTabProps {
  promoters: Promoter[];
  bookedItems: CartItem[];
  guestlistRequests: GuestlistJoinRequest[];
  onPreviewPromoter: (promoter: Promoter) => void;
  onViewStats?: (promoter: Promoter) => void;
}

interface PromoterWithStats extends Promoter {
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
    sortKey: keyof PromoterWithStats;
    sortConfig: { key: keyof PromoterWithStats | null; direction: 'asc' | 'desc' };
    requestSort: (key: keyof PromoterWithStats) => void;
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


export const PromoterStatsTab: React.FC<PromoterStatsTabProps> = ({ promoters, bookedItems, guestlistRequests, onPreviewPromoter, onViewStats }) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof PromoterWithStats | null; direction: 'asc' | 'desc' }>({ key: 'totalRevenue', direction: 'desc' });

    const promoterStats = useMemo<PromoterWithStats[]>(() => {
        return promoters.map(promoter => {
            const promoterBookings = bookedItems.filter(item => 
                item.tableDetails?.promoter?.id === promoter.id &&
                item.bookedTimestamp && isDateInPeriod(new Date(item.bookedTimestamp), timeFilter)
            );

            const totalRevenue = promoterBookings.reduce((acc, item) => {
                 const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                 return acc + (price || 0);
            }, 0);

            const promoterGuestlistRequests = guestlistRequests.filter(req => 
                req.promoterId === promoter.id &&
                isDateInPeriod(new Date(req.date + 'T00:00:00'), timeFilter)
            );
            const guestlistShows = promoterGuestlistRequests.filter(req => req.attendanceStatus === 'show').length;
            const guestlistNoShows = promoterGuestlistRequests.filter(req => req.attendanceStatus === 'no-show').length;
            const totalAttendance = guestlistShows + guestlistNoShows;
            const showRate = totalAttendance > 0 ? (guestlistShows / totalAttendance) * 100 : 0;

            return {
                ...promoter,
                totalRevenue,
                totalBookings: promoterBookings.length,
                guestlistShows,
                guestlistNoShows,
                showRate,
            };
        });
    }, [promoters, bookedItems, guestlistRequests, timeFilter]);
    
    const sortedPromoters = useMemo(() => {
        let sortableItems = [...promoterStats];
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
    }, [promoterStats, sortConfig]);

    const requestSort = (key: keyof PromoterWithStats) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };
    
    const overallStats = useMemo(() => {
        return promoterStats.reduce((acc, p) => {
            acc.totalRevenue += p.totalRevenue;
            acc.totalBookings += p.totalBookings;
            acc.totalShows += p.guestlistShows;
            acc.totalNoShows += p.guestlistNoShows;
            return acc;
        }, { totalRevenue: 0, totalBookings: 0, totalShows: 0, totalNoShows: 0 });
    }, [promoterStats]);
    
    const overallShowRate = (overallStats.totalShows + overallStats.totalNoShows) > 0 
        ? (overallStats.totalShows / (overallStats.totalShows + overallStats.totalNoShows)) * 100
        : 0;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Promoter Performance</h2>
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
                            <SortableHeader label="Promoter" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Revenue" sortKey="totalRevenue" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="Bookings" sortKey="totalBookings" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="GL Shows" sortKey="guestlistShows" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="GL No-Shows" sortKey="guestlistNoShows" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="Show Rate" sortKey="showRate" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="Favorites" sortKey="favoritedByCount" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPromoters.map(p => (
                            <tr 
                                key={p.id} 
                                onClick={() => onViewStats ? onViewStats(p) : onPreviewPromoter(p)} 
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
                 {sortedPromoters.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p>No promoter data available for the selected period.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};