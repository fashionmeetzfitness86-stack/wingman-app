import React, { useState, useMemo } from 'react';
import { Wingman, CartItem, GuestlistJoinRequest } from '../../types';
import { Modal } from '../ui/Modal';
import { StatCard } from '../StatCard';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { BookingsIcon } from '../icons/BookingsIcon';
import { GuestlistIcon } from '../icons/GuestlistIcon';

interface WingmanStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wingman: Wingman | null;
  allBookings: CartItem[];
  allGuestlistRequests: GuestlistJoinRequest[];
}

type TimeFilter = 'day' | 'week' | 'month' | 'year';

const isDateInPeriod = (date: Date, period: TimeFilter): boolean => {
    const now = new Date();
    const startOfPeriod = new Date(now);

    switch (period) {
        case 'day':
            startOfPeriod.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startOfPeriod.setDate(now.getDate() - now.getDay());
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


export const WingmanStatsModal: React.FC<WingmanStatsModalProps> = ({ isOpen, onClose, wingman, allBookings, allGuestlistRequests }) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

    const wingmanStats = useMemo(() => {
        if (!wingman) return null;

        const wingmanBookings = allBookings.filter(item => 
            item.tableDetails?.wingman?.id === wingman.id &&
            isDateInPeriod(new Date(item.bookedTimestamp || 0), timeFilter)
        );

        const totalRevenue = wingmanBookings.reduce((acc, item) => {
             const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
             return acc + (price || 0);
        }, 0);

        const wingmanGuestlistRequests = allGuestlistRequests.filter(req => 
            req.wingmanId === wingman.id &&
            isDateInPeriod(new Date(req.date + 'T00:00:00'), timeFilter)
        );
        const guestlistShows = wingmanGuestlistRequests.filter(req => req.attendanceStatus === 'show').length;
        const guestlistNoShows = wingmanGuestlistRequests.filter(req => req.attendanceStatus === 'no-show').length;

        return {
            totalBookings: wingmanBookings.length,
            totalRevenue,
            guestlistShows,
            guestlistNoShows,
        };
    }, [wingman, allBookings, allGuestlistRequests, timeFilter]);

    if (!isOpen || !wingman || !wingmanStats) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Stats for ${wingman.name}`}>
            <div className="space-y-6">
                <div className="flex items-center justify-center bg-gray-800 rounded-lg p-1">
                    {(['day', 'week', 'month', 'year'] as TimeFilter[]).map(period => (
                        <button 
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${timeFilter === period ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard icon={<CurrencyDollarIcon className="w-6 h-6" />} label="Revenue" value={`$${wingmanStats.totalRevenue.toFixed(2)}`} />
                    <StatCard icon={<BookingsIcon className="w-6 h-6" />} label="Bookings" value={wingmanStats.totalBookings.toString()} />
                    <StatCard icon={<GuestlistIcon className="w-6 h-6" />} label="Guestlist Shows" value={wingmanStats.guestlistShows.toString()} />
                    <StatCard icon={<GuestlistIcon className="w-6 h-6" />} label="Guestlist No-Shows" value={wingmanStats.guestlistNoShows.toString()} />
                </div>
            </div>
        </Modal>
    );
};
