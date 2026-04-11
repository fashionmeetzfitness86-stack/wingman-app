
import React, { useMemo } from 'react';
import { User, CartItem, Venue } from '../../types';
import { Modal } from '../ui/Modal';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { BookingsIcon } from '../icons/BookingsIcon';
import { StarIcon } from '../icons/StarIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { StatCard } from '../StatCard';

interface UserAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  bookedItems: CartItem[];
  venues: Venue[];
}

export const UserAnalyticsModal: React.FC<UserAnalyticsModalProps> = ({ isOpen, onClose, user, bookedItems, venues }) => {
  const stats = useMemo(() => {
    if (!user) return null;

    const userBookings = bookedItems.filter(item => {
        const guestDetails = item.tableDetails?.guestDetails || item.eventDetails?.guestDetails;
        // Simple matching by email or name for mock data purposes
        return guestDetails?.email === user.email || guestDetails?.name === user.name;
    }).sort((a, b) => (b.bookedTimestamp || 0) - (a.bookedTimestamp || 0));

    const totalSpend = userBookings.reduce((acc, item) => {
        const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
        return acc + (price || 0);
    }, 0);

    const favoriteVenues = venues.filter(v => user.favoriteVenueIds?.includes(v.id));

    return {
        totalSpend,
        bookingCount: userBookings.length,
        bookings: userBookings,
        favoriteVenues
    };
  }, [user, bookedItems, venues]);

  if (!isOpen || !user || !stats) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Analytics: ${user.name}`} className="max-w-4xl">
      <div className="space-y-8 p-1">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard 
                icon={<CurrencyDollarIcon className="w-6 h-6" />} 
                label="Total Lifetime Spend" 
                value={`$${stats.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
            />
            <StatCard 
                icon={<BookingsIcon className="w-6 h-6" />} 
                label="Total Bookings" 
                value={stats.bookingCount.toString()} 
            />
            <StatCard 
                icon={<StarIcon className="w-6 h-6" />} 
                label="Favorite Venues" 
                value={stats.favoriteVenues.length.toString()} 
            />
        </div>

        {/* Recent Activity Table */}
        <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                Booking History
            </h3>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3">Item</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {stats.bookings.length > 0 ? (
                                stats.bookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-gray-800/50">
                                        <td className="px-4 py-3 font-medium text-white">{booking.name}</td>
                                        <td className="px-4 py-3">{booking.date || booking.sortableDate || 'N/A'}</td>
                                        <td className="px-4 py-3 capitalize">{booking.type}</td>
                                        <td className="px-4 py-3 text-right text-green-400">
                                            ${((booking.paymentOption === 'full' ? booking.fullPrice : booking.depositPrice) || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                        No booking history found for this user.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Preferences & Favorites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Favorite Venues</h3>
                {stats.favoriteVenues.length > 0 ? (
                    <div className="space-y-2">
                        {stats.favoriteVenues.map(venue => (
                            <div key={venue.id} className="flex items-center gap-3 bg-gray-900 p-2 rounded-lg border border-gray-800">
                                <img src={venue.coverImage} alt={venue.name} className="w-10 h-10 rounded-md object-cover" />
                                <div>
                                    <p className="font-semibold text-white text-sm">{venue.name}</p>
                                    <p className="text-xs text-gray-400">{venue.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">No favorite venues saved.</p>
                )}
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-4">User Preferences</h3>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 space-y-3">
                    <div>
                        <span className="text-xs text-gray-500 uppercase font-bold">Music</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {user.preferences?.music.length ? user.preferences.music.map(m => (
                                <span key={m} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{m}</span>
                            )) : <span className="text-xs text-gray-500">Not specified</span>}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase font-bold">Vibe</span>
                        <p className="text-sm text-gray-300 mt-1">{user.preferences?.personality || 'Not specified'}</p>
                    </div>
                     <div>
                        <span className="text-xs text-gray-500 uppercase font-bold">Access Level</span>
                        <p className="text-sm text-amber-400 mt-1 font-semibold">{user.accessLevel}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Modal>
  );
};
