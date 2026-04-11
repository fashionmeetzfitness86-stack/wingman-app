import React, { useMemo, useState } from 'react';
import { CartItem, GuestlistJoinRequest, User, Promoter, UserAccessLevel, UserRole } from '../../types';
import { ArrowUpIcon, ArrowDownIcon } from '../icons/FeatureIcons';

interface StatsTabProps {
    users: User[];
    promoters: Promoter[];
    bookedItems: CartItem[];
    guestlistRequests: GuestlistJoinRequest[];
    onViewPromoterStats: (promoter: Promoter) => void;
    onViewUserAnalytics: (accessLevel: UserAccessLevel) => void;
}

const StatCard: React.FC<{ label: string; value: string | number; onClick?: () => void }> = ({ label, value, onClick }) => {
    const Component = onClick ? 'button' : 'div';
    return (
        <Component 
            onClick={onClick}
            className={`bg-gray-800 p-4 rounded-lg text-left ${onClick ? 'hover:bg-gray-700 transition-colors' : ''}`}
        >
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </Component>
    );
};

type TimeFilter = 'day' | 'week' | 'month' | 'year';

const isDateInPeriod = (date: Date, period: TimeFilter): boolean => {
    const now = new Date();
    const startOfPeriod = new Date(now);

    switch (period) {
        case 'day':
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
        case 'week':
            const firstDayOfWeek = now.getDate() - now.getDay();
            startOfPeriod.setDate(firstDayOfWeek);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
        case 'month':
            startOfPeriod.setDate(1);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
        case 'year':
            startOfPeriod.setMonth(0, 1);
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
    }

    return date >= startOfPeriod;
};


export const StatsTab: React.FC<StatsTabProps> = ({ users, promoters, bookedItems, guestlistRequests, onViewPromoterStats, onViewUserAnalytics }) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

    const promoterStats = useMemo(() => {
        return promoters.map(promoter => {
            const promoterBookings = bookedItems.filter(item => 
                item.tableDetails?.promoter?.id === promoter.id &&
                isDateInPeriod(new Date(item.bookedTimestamp || 0), timeFilter)
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

            return {
                ...promoter,
                totalBookings: promoterBookings.length,
                totalRevenue,
                guestlistShows,
                guestlistNoShows,
            };
        }).sort((a,b) => b.totalRevenue - a.totalRevenue);
    }, [promoters, bookedItems, guestlistRequests, timeFilter]);

    const userAnalytics = useMemo(() => {
        const analytics: Record<string, { totalUsers: number, totalSpend: number, totalBookings: number }> = {
            [UserAccessLevel.APPROVED_GIRL]: { totalUsers: 0, totalSpend: 0, totalBookings: 0 },
            [UserAccessLevel.ACCESS_MALE]: { totalUsers: 0, totalSpend: 0, totalBookings: 0 },
            [UserAccessLevel.GENERAL]: { totalUsers: 0, totalSpend: 0, totalBookings: 0 },
        };

        users.forEach(user => {
            if (user.role === UserRole.USER) {
                const level = user.accessLevel || UserAccessLevel.GENERAL;
                if (analytics[level]) {
                    analytics[level].totalUsers++;
                }
            }
        });
        
        bookedItems.forEach(item => {
            const guestEmail = item.tableDetails?.guestDetails?.email || item.eventDetails?.guestDetails?.email;
            const user = users.find(u => u.email === guestEmail);
            if (user && user.role === UserRole.USER) {
                const level = user.accessLevel || UserAccessLevel.GENERAL;
                if (analytics[level]) {
                    const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                    analytics[level].totalSpend += price || 0;
                    analytics[level].totalBookings++;
                }
            }
        });

        return analytics;
    }, [users, bookedItems]);
    

    return (
        <div className="space-y-12">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Promoter Performance</h3>
                    <div className="flex items-center bg-gray-800 rounded-lg p-1">
                        {(['day', 'week', 'month', 'year'] as TimeFilter[]).map(period => (
                            <button 
                                key={period}
                                onClick={() => setTimeFilter(period)}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${timeFilter === period ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-700'}`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                            <tr>
                                <th className="px-4 py-3">Promoter</th>
                                <th className="px-4 py-3 text-right">Revenue</th>
                                <th className="px-4 py-3 text-right">Bookings</th>
                                <th className="px-4 py-3 text-right">GL Shows</th>
                                <th className="px-4 py-3 text-right">GL No-Shows</th>
                                <th className="px-4 py-3 text-right">Favorites</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promoterStats.map(p => (
                                <tr key={p.id} onClick={() => onViewPromoterStats(p)} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800 cursor-pointer">
                                    <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                                    <td className="px-4 py-3 text-right">${p.totalRevenue.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{p.totalBookings}</td>
                                    <td className="px-4 py-3 text-right text-green-400">{p.guestlistShows}</td>
                                    <td className="px-4 py-3 text-right text-red-400">{p.guestlistNoShows}</td>
                                    <td className="px-4 py-3 text-right">{p.favoritedByCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
             <div>
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">User Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.keys(userAnalytics).map((level) => {
                        const data = userAnalytics[level as keyof typeof userAnalytics];
                        const accessLevel = level as UserAccessLevel;
                        return (
                            <div key={level} className="bg-gray-800 p-4 rounded-lg">
                                <button onClick={() => onViewUserAnalytics(accessLevel)} className="w-full text-left">
                                  <h4 className="font-bold text-white mb-3 hover:underline">{level}</h4>
                                </button>
                                <div className="space-y-2">
                                    <p className="text-sm flex justify-between"><span>Total Users:</span> <span className="font-semibold">{data.totalUsers}</span></p>
                                    <p className="text-sm flex justify-between"><span>Total Spend:</span> <span className="font-semibold">${data.totalSpend.toFixed(2)}</span></p>
                                    <p className="text-sm flex justify-between"><span>Total Bookings:</span> <span className="font-semibold">{data.totalBookings}</span></p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};