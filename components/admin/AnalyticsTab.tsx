import React, { useMemo, useState } from 'react';
import { CartItem, GuestlistJoinRequest, User, Event, Venue, Wingman } from '../../types';
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
    wingmen: Wingman[];
}

// ─── Shared table primitives ───────────────────────────────────────────────────
const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm text-left text-gray-300">
            <thead>
                <tr className="border-b border-white/[0.06]">
                    {headers.map(header => (
                        <th key={header} scope="col"
                            className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
    </div>
);

const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">{children}</tr>
);

const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <td className="px-4 py-3 text-gray-300">{children}</td>
);

// ─── Charts ────────────────────────────────────────────────────────────────────
const RevenueChart: React.FC<{ data: { month: string; revenue: number }[] }> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  if (data.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-2 text-center">
        <span className="text-3xl opacity-30">📊</span>
        <p className="text-sm text-gray-600">No revenue data for chart.</p>
      </div>
    );
  }
  return (
    <div>
      <h4 className="text-sm font-bold text-white px-5 pt-5 pb-1">Revenue Over Time</h4>
      <div className="px-5 pb-5 pt-3 h-52 flex items-end gap-3">
        {data.map(({ month, revenue }) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full group">
            <div className="relative flex-1 w-full flex items-end justify-center">
              <div
                className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                style={{
                  height: `${(revenue / maxRevenue) * 100}%`,
                  background: 'linear-gradient(to top, #f97316, #fb923c)',
                  minHeight: 4,
                }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${Math.round(revenue).toLocaleString()}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-500">{month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BookingsByVenueChart: React.FC<{ data: { name: string; count: number }[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  if (data.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-2 text-center">
        <span className="text-3xl opacity-30">🏛</span>
        <p className="text-sm text-gray-600">No booking data for chart.</p>
      </div>
    );
  }
  return (
    <div>
      <h4 className="text-sm font-bold text-white px-5 pt-5 pb-1">Bookings by Venue</h4>
      <div className="px-5 pb-5 pt-3 space-y-3">
        {data.slice(0, 5).map(({ name, count }) => (
          <div key={name} className="flex items-center gap-3 group">
            <span className="text-xs text-gray-500 w-24 truncate flex-shrink-0" title={name}>{name}</span>
            <div className="flex-1 bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  background: 'linear-gradient(to right, #f97316, #fb923c)',
                }}
              />
            </div>
            <span className="text-xs font-bold text-white w-5 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Shared section header ─────────────────────────────────────────────────────
const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-4">{children}</h3>
);

// ─── Search input ──────────────────────────────────────────────────────────────
const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] focus:border-orange-500/50 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all mb-4"
  />
);

// ─── Main component ────────────────────────────────────────────────────────────
export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
    bookedItems, guestlistRequests, allRsvps, users, events, venues, wingmen,
}) => {
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
        const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
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
        const q = bookingSearch.toLowerCase();
        return bookings.filter(item => {
            const userName = item.tableDetails?.guestDetails?.name || item.eventDetails?.guestDetails?.name || '';
            const wingmanName = item.tableDetails?.wingman?.name || '';
            return item.name.toLowerCase().includes(q) || userName.toLowerCase().includes(q) || wingmanName.toLowerCase().includes(q);
        });
    }, [bookingSearch, bookedItems]);

    const filteredGuestlist = useMemo(() => {
        if (!guestlistSearch) return guestlistRequests;
        const q = guestlistSearch.toLowerCase();
        return guestlistRequests.filter(req => {
            const user = users.find(u => u.id === req.userId);
            const venue = venues.find(v => v.id === req.venueId);
            const wingman = wingmen.find(p => p.id === req.wingmanId);
            return (user?.name.toLowerCase().includes(q)) || (venue?.name.toLowerCase().includes(q)) || (wingman?.name.toLowerCase().includes(q));
        });
    }, [guestlistSearch, guestlistRequests, users, venues, wingmen]);

    const filteredRsvps = useMemo(() => {
        if (!rsvpSearch) return allRsvps;
        const q = rsvpSearch.toLowerCase();
        return allRsvps.filter(rsvp => {
            const user = users.find(u => u.id === rsvp.userId);
            const event = events.find(e => e.id === rsvp.eventId);
            return (user?.name.toLowerCase().includes(q)) || (event?.title.toLowerCase().includes(q));
        });
    }, [rsvpSearch, allRsvps, users, events]);

    const filteredStorePurchases = useMemo(() => {
        const purchases = bookedItems.filter(item => item.type === 'storeItem');
        if (!storeSearch) return purchases;
        const q = storeSearch.toLowerCase();
        return purchases.filter(item => item.name.toLowerCase().includes(q));
    }, [storeSearch, bookedItems]);

    return (
        <div className="space-y-10">
            {/* Key Metrics */}
            <div>
                <SectionHeading>Key Metrics</SectionHeading>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={<CurrencyDollarIcon className="w-5 h-5" />} label="Total Revenue" value={`$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <StatCard icon={<BookingsIcon className="w-5 h-5" />} label="Total Bookings" value={stats.bookings.toString()} />
                    <StatCard icon={<GuestlistIcon className="w-5 h-5" />} label="Guestlist Signups" value={stats.guestlistSignups.toString()} />
                    <StatCard icon={<CalendarIcon className="w-5 h-5" />} label="Event RSVPs" value={stats.eventRsvps.toString()} />
                    <StatCard icon={<CurrencyDollarIcon className="w-5 h-5" />} label="Store Revenue" value={`$${stats.storeRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <StatCard icon={<StoreIcon className="w-5 h-5" />} label="Items Sold" value={stats.itemsSold.toString()} />
                </div>
            </div>

            {/* Visualizations */}
            <div>
                <SectionHeading>Visualizations</SectionHeading>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                        <RevenueChart data={revenueData} />
                    </div>
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                        <BookingsByVenueChart data={bookingsByVenueData} />
                    </div>
                </div>
            </div>

            {/* Data Tables */}
            <div>
                <SectionHeading>Data Tables</SectionHeading>
                <div className="space-y-6">
                    {/* Store Purchases */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <p className="text-sm font-bold text-white mb-4">Recent Store Purchases</p>
                        <SearchInput value={storeSearch} onChange={setStoreSearch} placeholder="Search store purchases..." />
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
                        {filteredStorePurchases.length === 0 && <p className="text-center text-gray-600 text-sm py-6 italic">No store purchases.</p>}
                    </div>

                    {/* Bookings */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <p className="text-sm font-bold text-white mb-4">Recent Bookings</p>
                        <SearchInput value={bookingSearch} onChange={setBookingSearch} placeholder="Search bookings by user, item, or wingman..." />
                        <Table headers={['User', 'Item', 'Date', 'Wingman', 'Price']}>
                            {filteredBookings.map(item => {
                                const userName = item.tableDetails?.guestDetails?.name || item.eventDetails?.guestDetails?.name || 'N/A';
                                const wingmanName = item.tableDetails?.wingman?.name || 'N/A';
                                const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>{userName}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{wingmanName}</TableCell>
                                        <TableCell>${price?.toFixed(2)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </Table>
                        {filteredBookings.length === 0 && <p className="text-center text-gray-600 text-sm py-6 italic">No bookings found.</p>}
                    </div>

                    {/* Guestlist */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <p className="text-sm font-bold text-white mb-4">Guestlist Attendance</p>
                        <SearchInput value={guestlistSearch} onChange={setGuestlistSearch} placeholder="Search by user, venue, or wingman..." />
                        <Table headers={['User', 'Venue', 'Wingman', 'Date', 'Status']}>
                            {filteredGuestlist.map(req => {
                                const user = users.find(u => u.id === req.userId);
                                const venue = venues.find(v => v.id === req.venueId);
                                const wingman = wingmen.find(p => p.id === req.wingmanId);
                                return (
                                    <TableRow key={req.id}>
                                        <TableCell>{user?.name || 'N/A'}</TableCell>
                                        <TableCell>{venue?.name || 'N/A'}</TableCell>
                                        <TableCell>{wingman?.name || 'N/A'}</TableCell>
                                        <TableCell>{req.date}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                                                req.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                                req.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                                'bg-red-500/15 text-red-400 border border-red-500/20'
                                            }`}>{req.status}</span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </Table>
                        {filteredGuestlist.length === 0 && <p className="text-center text-gray-600 text-sm py-6 italic">No guestlist entries found.</p>}
                    </div>

                    {/* RSVPs */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <p className="text-sm font-bold text-white mb-4">Event RSVPs</p>
                        <SearchInput value={rsvpSearch} onChange={setRsvpSearch} placeholder="Search by user or event..." />
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
                                );
                            })}
                        </Table>
                        {filteredRsvps.length === 0 && <p className="text-center text-gray-600 text-sm py-6 italic">No RSVPs found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};