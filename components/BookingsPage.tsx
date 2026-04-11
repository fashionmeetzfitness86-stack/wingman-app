
import React, { useState, useMemo } from 'react';
import { Booking, Page, CartItem, Venue } from '../types';
import { bookingHistory } from '../data/mockData';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';

interface BookingsPageProps {
  onNavigate: (page: Page) => void;
  bookedItems?: CartItem[];
  venues?: Venue[];
}

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const renderBookingStatus = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed':
                return <span className="text-blue-400 font-semibold">{status}</span>;
            case 'Completed':
                return <span className="text-green-400 font-semibold">{status}</span>;
            case 'Cancelled':
                return <span className="text-red-400 font-semibold">{status}</span>;
            default:
                return <span className="text-gray-400 font-semibold">{status}</span>;
        }
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-white text-lg">{booking.venueName}</p>
                    <p className="text-sm text-gray-400">with {booking.promoterName}</p>
                </div>
                {renderBookingStatus(booking.status)}
            </div>
            <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between items-center text-sm">
                <p className="text-gray-400">{booking.date}</p>
                <p className="text-gray-300">Table: <span className="font-semibold text-white">{booking.tableTier}</span></p>
            </div>
        </div>
    );
};

const EventBookingCard: React.FC<{ item: CartItem, venue?: Venue, status: string }> = ({ item, venue, status }) => {
    let statusColor = 'text-blue-400';
    if (status === 'Approved' || status === 'Confirmed') statusColor = 'text-green-400 bg-green-900/20 border-green-900/50';
    else if (status === 'Pending') statusColor = 'text-yellow-400 bg-yellow-900/20 border-yellow-900/50';
    else if (status === 'Rejected') statusColor = 'text-red-400 bg-red-900/20 border-red-900/50';
    else statusColor = 'text-blue-400 bg-blue-900/20 border-blue-900/50';

    return (
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex gap-4">
            <img src={item.image} alt={item.name} className="w-20 h-20 rounded object-cover flex-shrink-0" />
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-lg">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded font-bold border ${statusColor}`}>{status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <LocationMarkerIcon className="w-4 h-4" />
                    <span>{venue?.name || 'Unknown Venue'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{item.date || item.sortableDate}</span>
                </div>
            </div>
        </div>
    );
};

type FilterType = 'All' | 'Tables' | 'Events';

export const BookingsPage: React.FC<BookingsPageProps> = ({ onNavigate, bookedItems = [], venues = [] }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const allBookings = useMemo(() => {
      const normalizedTableBookings = bookingHistory.map(b => ({
          id: `mock-table-${b.id}`,
          type: 'table',
          name: b.venueName,
          date: b.date,
          status: b.status,
          originalData: b,
          isEvent: false
      }));

      const normalizedSessionBookings = bookedItems.map(item => {
          let venueName = '';
          let status = 'Confirmed';

          if (item.type === 'table' && item.tableDetails) {
              venueName = item.tableDetails.venue.name;
          }
          else if (item.type === 'event' && item.eventDetails) {
              const v = venues.find(v => v.id === item.eventDetails!.event.venueId);
              venueName = v ? v.name : 'Unknown Venue';
          } else if (item.type === 'guestlist' && item.guestlistDetails) {
              venueName = item.guestlistDetails.venue.name;
              if (item.guestlistDetails.status) {
                  status = item.guestlistDetails.status.charAt(0).toUpperCase() + item.guestlistDetails.status.slice(1);
              } else {
                  status = 'Pending';
              }
          }

          return {
              id: item.id,
              type: item.type,
              name: item.name,
              date: item.sortableDate || item.date || '',
              status: status, 
              originalData: item,
              isEvent: item.type === 'event' || item.type === 'guestlist',
              venueName: venueName
          };
      });

      return [...normalizedTableBookings, ...normalizedSessionBookings];
  }, [bookedItems, venues]);

  const filteredList = useMemo(() => {
      const today = new Date().toISOString().split('T')[0];
      
      return allBookings.filter(item => {
          // Tab filter (Upcoming vs Past)
          const isPast = item.date < today;
          if (activeTab === 'upcoming' && isPast) return false;
          if (activeTab === 'past' && !isPast) return false;

          // Type filter
          if (activeFilter === 'Tables' && item.type !== 'table' && item.type !== 'guestlist') return false;
          if (activeFilter === 'Events' && !item.isEvent) return false;

          return true;
      }).sort((a, b) => {
          // Sort by date
          return activeTab === 'upcoming' 
            ? new Date(a.date).getTime() - new Date(b.date).getTime() 
            : new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [allBookings, activeTab, activeFilter]);

  return (
    <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
      <button onClick={() => onNavigate('userProfile')} className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold">
        <ChevronLeftIcon className="w-5 h-5"/>
        Back to Profile
      </button>

      <h1 className="text-3xl font-bold text-white mb-6">My Bookings</h1>

      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'upcoming' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'past' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
        >
          Past
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {['All', 'Tables', 'Events'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as FilterType)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${activeFilter === filter ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                  {filter}
              </button>
          ))}
      </div>

      <div className="space-y-4">
        {filteredList.length > 0 ? (
          filteredList.map(item => {
              if (item.isEvent) {
                  // It's a CartItem of type event or guestlist
                  const cartItem = item.originalData as CartItem;
                  const venue = venues.find(v => v.name === item.venueName);
                  return <EventBookingCard key={item.id} item={cartItem} venue={venue} status={item.status} />;
              } else if (item.type === 'table' && 'tableTier' in item.originalData) {
                  // It's a mock Booking
                  return <BookingCard key={item.id} booking={item.originalData as Booking} />;
              } else if (item.type === 'table') {
                   // It's a CartItem of type table
                   const cartItem = item.originalData as CartItem;
                   return (
                       <div key={item.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white text-lg">{item.venueName}</p>
                                    <p className="text-sm text-gray-400">with {cartItem.tableDetails?.promoter?.name || 'N/A'}</p>
                                </div>
                                <span className="text-blue-400 font-semibold">Confirmed</span>
                            </div>
                            <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between items-center text-sm">
                                <p className="text-gray-400">{item.date}</p>
                                <p className="text-gray-300">Table: <span className="font-semibold text-white">{cartItem.tableDetails?.tableOption?.name || 'Standard'}</span></p>
                            </div>
                        </div>
                   )
              }
              return null;
          })
        ) : (
          <p className="text-gray-400 text-center py-16">No bookings found.</p>
        )}
      </div>
    </div>
  );
};
