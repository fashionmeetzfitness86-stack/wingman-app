import React, { useState, useMemo } from 'react';
import { Promoter, CartItem, GuestlistJoinRequest } from '../../types';
import { Modal } from '../ui/Modal';
import { StatCard } from '../StatCard';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { BookingsIcon } from '../icons/BookingsIcon';
import { GuestlistIcon } from '../icons/GuestlistIcon';

interface PromoterStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoter: Promoter | null;
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


export const PromoterStatsModal: React.FC<PromoterStatsModalProps> = ({ isOpen, onClose, promoter, allBookings, allGuestlistRequests }) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

    const promoterStats = useMemo(() => {
        if (!promoter) return null;

        const promoterBookings = allBookings.filter(item => 
            item.tableDetails?.promoter?.id === promoter.id &&
            isDateInPeriod(new Date(item.bookedTimestamp || 0), timeFilter)
        );

        const totalRevenue = promoterBookings.reduce((acc, item) => {
             const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
             return acc + (price || 0);
        }, 0);

        const promoterGuestlistRequests = allGuestlistRequests.filter(req => 
            req.promoterId === promoter.id &&
            isDateInPeriod(new Date(req.date + 'T00:00:00'), timeFilter)
        );
        const guestlistShows = promoterGuestlistRequests.filter(req => req.attendanceStatus === 'show').length;
        const guestlistNoShows = promoterGuestlistRequests.filter(req => req.attendanceStatus === 'no-show').length;

        return {
            totalBookings: promoterBookings.length,
            totalRevenue,
            guestlistShows,
            guestlistNoShows,
        };
    }, [promoter, allBookings, allGuestlistRequests, timeFilter]);

    if (!isOpen || !promoter || !promoterStats) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Stats for ${promoter.name}`}>
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
                    <StatCard icon={<CurrencyDollarIcon className="w-6 h-6" />} label="Revenue" value={`$${promoterStats.totalRevenue.toFixed(2)}`} />
                    <StatCard icon={<BookingsIcon className="w-6 h-6" />} label="Bookings" value={promoterStats.totalBookings} />
                    <StatCard icon={<GuestlistIcon className="w-6 h-6" />} label="Guestlist Shows" value={promoterStats.guestlistShows} />
                    <StatCard icon={<GuestlistIcon className="w-6 h-6" />} label="Guestlist No-Shows" value={promoterStats.guestlistNoShows} />
                </div>
            </div>
        </Modal>
    );
};
