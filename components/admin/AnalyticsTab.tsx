import React, { useMemo, useState } from 'react';
import { CartItem, GuestlistJoinRequest, User, Event, Venue, Promoter } from '../../types';
import { StatCard } from '../StatCard';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { BookingsIcon } from '../icons/BookingsIcon';
import { GuestlistIcon } from '../icons/GuestlistIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { StoreIcon } from '../icons/StoreIcon';

interface AnalyticsTabProps {
    bookedItems: CartItem[];
    guestlistRequests: GuestlistJoinRequest[];
    allRsvps: { userId: number; eventId: number; }[];
    users: User[];
    events: Event[];
    venues: Venue[];
    promoters: Promoter[];
}

const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                <tr>
                    {headers.map(header => (
                        <th key={header} scope="col" className="px-4 py-3">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {children}
            </tbody>
        </table>
    </div>
);

const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <tr className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800">{children}</tr>
);

const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <td className="px-4 py-3">{children}</td>
);

const RevenueChart: React.FC<{ data: { month: string; revenue: number }[] }> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1); // Avoid division by zero
  if (data.length === 0) {
    return <div className="p-4 text-center text-gray-500 h-full flex items-center justify-center">No revenue data for chart.</div>;
  }
  return (
    <div>
      <h4 className="text-lg font-semibold text-white p-4">Revenue Over Time</h4>
      <div className="p-4 h-64 flex items-end gap-4 border-t border-gray-800">
        {data.map(({ month, revenue }) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full">
            <div className="relative flex-1 w-full flex items-end justify-center">
              <div
                className="w-3/4 bg-gradient-to-t from-[#EC4899] to-[#f472b6] rounded-t-md group transition-all duration-300 hover:opacity-80"
                style={{ height: `${(revenue / maxRevenue) * 100}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  ${Math.round(revenue).toLocaleString()}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-400">{month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BookingsByVenueChart: React.FC<{ data: { name: string; count: number }[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  if (data.length === 0) {
     return <div className="p-4 text-center text-gray-500 h-full flex items-center justify-center">No booking data for chart.</div>;
  }
  return (
    <div>
      <h4 className="text-lg font-semibold text-white p-4">Bookings by Venue</h4>
      <div className="p-4 space-y-3 border-t border-gray-800">
        {data.slice(0, 5).map(({ name, count }) => (
          <div key={name} className="flex items-center gap-4 group">
            <span className="text-sm font-semibold text-gray-400 w-28 truncate" title={name}>{name}</span>
            <div className="flex-1 bg-gray-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-[#50B6FF] to-[#60a5fa] h-4 rounded-full transition-all duration-500"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-white w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ bookedItems, guestlistRequests, allRsvps, users, events, venues, promoters }) => {
    const [bookingSearch, setBookingSearch] = useState('');
    const [guestlistSearch, setGuestlistSearch] = useState('');
    const [rsvpSearch, setRsvpSearch] = useState('');
    const [storeSearch, setStoreSearch] = useState('');

    const stats = useMemo(() => {
        const bookingRevenue = bookedItems.filter(i => i.type !== 'storeItem').reduce((acc, item) => {
            const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
            return acc + (price || 0);
        }, 0);
        const storeSales = bookedItems.filter(item => item.type === 'storeItem');
        const storeRevenue = storeSales.reduce((acc, item) => acc + (item.fullPrice || 0), 0);
        const totalItemsSold = storeSales.reduce((acc, item) => acc + item.quantity, 0);
        
        return {
            revenue: bookingRevenue + storeRevenue,
            bookings: bookedItems.filter(i => i.type !== 'storeItem').length,
            guestlistSignups: guestlistRequests.length,
            eventRsvps: allRsvps.length,
            storeRevenue,
            itemsSold: totalItemsSold,
        };
    }, [bookedItems, guestlistRequests, allRsvps]);

    const revenueData = useMemo(() => {
        const monthlyRevenue: { [key: string]: number } = {};
        bookedItems.forEach(item => {
            const date = new Date(item.sortableDate || item.bookedTimestamp || 0);
            const month = date.toLocaleString('default', { month: 'short' });
            const price = item.type === 'storeItem' ? item.fullPrice : (item.paymentOption === 'full' ? item.fullPrice : item.depositPrice);
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (price || 0);
        });
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthOrder.filter(m => monthlyRevenue[m]).map(month => ({ month, revenue: monthlyRevenue[month] }));
    }, [bookedItems]);
    
    const bookingsByVenueData = useMemo(() => {
        const venueCounts: { [key: string]: number } = {};
        bookedItems.filter(i => i.type !== 'storeItem').forEach(item => {
            venueCounts[item.name] = (venueCounts[item.name] || 0) + 1;
        });
        return Object.entries(venueCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [bookedItems]);

    const filteredBookings = useMemo(() => {
        const bookings = bookedItems.filter(item => item.type !== 'storeItem');
        if (!bookingSearch) return bookings;
        const lowercasedQuery = bookingSearch.toLowerCase();
        return bookings.filter(item => {
            const userName = item.tableDetails?.guestDetails?.name || item.eventDetails?.guestDetails?.name || '';
            const promoterName = item.tableDetails?.promoter?.name || '';
            return (
                item.name.toLowerCase().includes(lowercasedQuery) ||
                userName.toLowerCase().includes(lowercasedQuery) ||
                promoterName.toLowerCase().includes(lowercasedQuery)
            );
        });
    }, [bookingSearch, bookedItems]);

    const filteredGuestlist = useMemo(() => {
        if (!guestlistSearch) return guestlistRequests;
        const lowercasedQuery = guestlistSearch.toLowerCase();
        return guestlistRequests.filter(req => {
            const user = users.find(u => u.id === req.userId);
            const venue = venues.find(v => v.id === req.venueId);
            const promoter = promoters.find(p => p.id === req.promoterId);
            return (
                (user && user.name.toLowerCase().includes(lowercasedQuery)) ||
                (venue && venue.name.toLowerCase().includes(lowercasedQuery)) ||
                (promoter && promoter.name.toLowerCase().includes(lowercasedQuery))
            );
        });
    }, [guestlistSearch, guestlistRequests, users, venues, promoters]);
    
    const filteredRsvps = useMemo(() => {
        if (!rsvpSearch) return allRsvps;
        const lowercasedQuery = rsvpSearch.toLowerCase();
        return allRsvps.filter(rsvp => {
            const user = users.find(u => u.id === rsvp.userId);
            const event = events.find(e => e.id === rsvp.eventId);
            return (
                (user && user.name.toLowerCase().includes(lowercasedQuery)) ||
                (event && event.title.toLowerCase().includes(lowercasedQuery))
            );
        });
    }, [rsvpSearch, allRsvps, users, events]);

    const filteredStorePurchases = useMemo(() => {
        const purchases = bookedItems.filter(item => item.type === 'storeItem');
        if (!storeSearch) return purchases;
        const lowercasedQuery = storeSearch.toLowerCase();
        return purchases.filter(item => item.name.toLowerCase().includes(lowercasedQuery));
    }, [storeSearch, bookedItems]);

    return (
        <div className="space-y-12">
            <div>
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    <StatCard icon={<CurrencyDollarIcon className="w-7 h-7" />} label="Total Revenue" value={`$${stats.revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                    <StatCard icon={<BookingsIcon className="w-7 h-7" />} label="Total Bookings" value={stats.bookings.toString()} />
                    <StatCard icon={<GuestlistIcon className="w-7 h-7" />} label="Guestlist Signups" value={stats.guestlistSignups.toString()} />
                    <StatCard icon={<CalendarIcon className="w-7 h-7" />} label="Event RSVPs" value={stats.eventRsvps.toString()} />
                    <StatCard icon={<CurrencyDollarIcon className="w-7 h-7" />} label="Store Revenue" value={`$${stats.storeRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                    <StatCard icon={<StoreIcon className="w-7 h-7" />} label="Items Sold" value={stats.itemsSold.toString()} />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">Visualizations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"><RevenueChart data={revenueData} /></div>
                    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"><BookingsByVenueChart data={bookingsByVenueData} /></div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">Data Tables</h3>
                <div className="space-y-8">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <h3 className="text-xl font-bold mb-4">Recent Store Purchases</h3>
                        <input type="text" placeholder="Search store purchases..." value={storeSearch} onChange={e => setStoreSearch(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 mb-4" />
                        <Table headers={['Item', 'Category', 'Quantity', 'Price (USD)']}>
                           {filteredStorePurchases.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.storeItemDetails?.item.category}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>${(item.fullPrice || 0).toFixed(2)}</TableCell>
                                </TableRow>
                           ))}
                        </Table>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
                        <input type="text" placeholder="Search bookings by user, item, or promoter..." value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 mb-4" />
                        <Table headers={['User', 'Item', 'Date', 'Promoter', 'Price']}>
                            {filteredBookings.map(item => {
                                const userName = item.tableDetails?.guestDetails?.name || item.eventDetails?.guestDetails?.name || 'N/A';
                                const promoterName = item.tableDetails?.promoter?.name || 'N/A';
                                const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>{userName}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{promoterName}</TableCell>
                                        <TableCell>${price?.toFixed(2)}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </Table>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <h3 className="text-xl font-bold mb-4">Guestlist Attendance</h3>
                        <input type="text" placeholder="Search by user, venue, or promoter..." value={guestlistSearch} onChange={e => setGuestlistSearch(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 mb-4" />
                        <Table headers={['User', 'Venue', 'Promoter', 'Date', 'Status']}>
                            {filteredGuestlist.map(req => {
                                const user = users.find(u => u.id === req.userId);
                                const venue = venues.find(v => v.id === req.venueId);
                                const promoter = promoters.find(p => p.id === req.promoterId);
                                return (
                                    <TableRow key={req.id}>
                                        <TableCell>{user?.name || 'N/A'}</TableCell>
                                        <TableCell>{venue?.name || 'N/A'}</TableCell>
                                        <TableCell>{promoter?.name || 'N/A'}</TableCell>
                                        <TableCell>{req.date}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                                req.status === 'approved' ? 'bg-green-900/50 text-green-300' :
                                                req.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' :
                                                'bg-red-900/50 text-red-300'
                                            }`}>{req.status}</span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </Table>
                    </div>
                    
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <h3 className="text-xl font-bold mb-4">Event RSVPs</h3>
                        <input type="text" placeholder="Search by user or event..." value={rsvpSearch} onChange={e => setRsvpSearch(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 mb-4" />
                        <Table headers={['User', 'Event', 'Event Date']}>
                            {filteredRsvps.map(rsvp => {
                                const user = users.find(u => u.id === rsvp.userId);
                                const event = events.find(e => e.id === rsvp.eventId);
                                return (
                                    <TableRow key={`${rsvp.userId}-${rsvp.eventId}`}>
                                        <TableCell>{user?.name || 'N/A'}</TableCell>
                                        <TableCell>{event?.title || 'N/A'}</TableCell>
                                        <TableCell>{event?.date || 'N/A'}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};