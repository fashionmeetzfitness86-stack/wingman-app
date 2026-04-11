
import React, { useState, useMemo, useEffect } from 'react';
import { Promoter, Venue, User, UserAccessLevel, CartItem, UserRole } from '../../types';
import { venues as allVenues, promoters as allPromoters, users as allUsers } from '../../data/mockData';
import { CloseIcon } from '../icons/CloseIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { StarIcon } from '../icons/StarIcon';

interface GuestlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: { promoter?: Promoter; venue?: Venue; date?: string; };
  onConfirmJoin: (promoterId: number, venueId: number, date: string, maleGuests: number, femaleGuests: number) => void;
  currentUser: User;
  bookedItems: CartItem[];
  onViewProfile: (user: User) => void;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const INITIAL_ATTENDEE_COUNT = 15;
const ATTENDEE_INCREMENT = 10;


// A simple string hashcode function for mock data consistency
// @ts-ignore
if (!String.prototype.hashCode) {
  // @ts-ignore
  String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
}

const getPriceRating = (minSpend: number) => {
    if (minSpend >= 10000) return '$$$$$';
    if (minSpend >= 5000) return '$$$$';
    if (minSpend >= 2500) return '$$$';
    if (minSpend >= 1000) return '$$';
    return '$';
};


export const GuestlistModal: React.FC<GuestlistModalProps> = ({ isOpen, onClose, context, onConfirmJoin, currentUser, bookedItems, onViewProfile }) => {
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [visibleAttendees, setVisibleAttendees] = useState(INITIAL_ATTENDEE_COUNT);
  const [maleGuests, setMaleGuests] = useState(0);
  const [femaleGuests, setFemaleGuests] = useState(1);
  
  const isPrivilegedUser = currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PROMOTER;
  const isVipUser = currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.role === UserRole.ADMIN;

  const selectableVenues = useMemo(() => {
    if (context.venue) return [context.venue];
    if (context.promoter) {
        return allVenues.filter(v => context.promoter!.assignedVenueIds.includes(v.id));
    }
    return [];
  }, [context]);

  const selectedVenue = useMemo(() => allVenues.find(v => v.id === selectedVenueId), [selectedVenueId]);

  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const min = today.toISOString().split('T')[0];
    const max = new Date(new Date().setDate(today.getDate() + 30)).toISOString().split('T')[0];
    return { minDate: min, maxDate: max };
  }, []);

  useEffect(() => {
    if (isOpen) {
        if (context.venue) {
          setSelectedVenueId(context.venue.id);
        } else if (selectableVenues.length > 0) {
          setSelectedVenueId(selectableVenues[0].id);
        } else {
          setSelectedVenueId(null);
        }
        setSelectedDate(context.date || minDate);
        setMaleGuests(0);
        setFemaleGuests(1);
        setVisibleAttendees(INITIAL_ATTENDEE_COUNT);
    }
  }, [isOpen, context, selectableVenues, minDate]);
  
  // Reset visible attendees when selection changes
  useEffect(() => {
    setVisibleAttendees(INITIAL_ATTENDEE_COUNT);
  }, [selectedDate, selectedVenueId]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    if (!selectedVenue || !dateString) {
      setSelectedDate(dateString);
      return;
    };
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = WEEKDAYS[date.getDay()];
    if (!selectedVenue.operatingDays.includes(dayOfWeek)) {
        alert('This venue is not open on the selected day. Please choose another date.');
    } else {
        setSelectedDate(dateString);
    }
  };

  const attendees = useMemo(() => {
      if (!selectedDate || !selectedVenueId) return [];
      // @ts-ignore
      const seed = (selectedDate + selectedVenueId).hashCode();
      // Deterministic shuffle
      const shuffled = [...allUsers].sort((a, b) => {
        const hashA = (a.id * seed) % 1000;
        const hashB = (b.id * seed) % 1000;
        return hashA - hashB;
      });
      // Generate a larger list to demonstrate pagination (20-50 people)
      return shuffled.slice(0, 20 + (seed % 31));
  }, [selectedDate, selectedVenueId]);

  const femaleAttendeesCount = useMemo(() => {
    return attendees.filter(u => u.accessLevel === UserAccessLevel.APPROVED_GIRL).length;
  }, [attendees]);
  
  const displayedAttendees = useMemo(() => attendees.slice(0, visibleAttendees), [attendees, visibleAttendees]);

  const bookedTables = useMemo(() => {
    if (!isPrivilegedUser || !selectedDate || !selectedVenueId) return [];
    return bookedItems.filter(item =>
        !item.isPlaceholder &&
        item.type === 'table' &&
        item.tableDetails?.venue.id === selectedVenueId &&
        item.sortableDate === selectedDate
    );
  }, [isPrivilegedUser, selectedDate, selectedVenueId, bookedItems]);
  
  const primaryPromoter = useMemo(() => {
      if (!selectedVenue) return null;
      return context.promoter || allPromoters.find(p => p.assignedVenueIds.includes(selectedVenue.id));
  }, [selectedVenue, context.promoter]);

  const handleConfirm = () => {
    if (!primaryPromoter || !selectedVenueId || !selectedDate) {
        alert("Please select a venue and a valid date.");
        return;
    }
    if (maleGuests === 0 && femaleGuests === 0) {
        alert("Please specify the number of guests.");
        return;
    }
    onConfirmJoin(primaryPromoter.id, selectedVenueId, selectedDate, maleGuests, femaleGuests);
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={`bg-[#121212] border ${isVipUser ? 'border-amber-400/50' : 'border-gray-800'} rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
             {isVipUser && <StarIcon className="w-6 h-6 text-amber-400 fill-current" />}
             <h2 className={`text-xl font-bold ${isVipUser ? 'text-amber-400' : 'text-white'}`}>{isVipUser ? 'VIP Guestlist Access' : 'Join Guestlist'}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          {!context.venue && context.promoter && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Venue for {context.promoter?.name}</label>
              <select 
                value={selectedVenueId || ''} 
                onChange={(e) => {
                    setSelectedVenueId(Number(e.target.value));
                    setSelectedDate('');
                }}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]"
              >
                {selectableVenues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          )}
          {selectedVenue && (
            <div>
              <label htmlFor="guestlist-date" className="block text-sm font-medium text-gray-300 mb-2">Select Date for {selectedVenue.name}</label>
              <input 
                type="date" 
                id="guestlist-date"
                value={selectedDate}
                onChange={handleDateChange} 
                min={minDate} 
                max={maxDate} 
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]"
              />
               <p className="text-xs text-gray-500 mt-2">Open on: {selectedVenue.operatingDays.join(', ')}</p>
            </div>
          )}

           <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Number of Guests</label>
              <div className="flex gap-4">
                  <div className="relative w-1/2">
                      <UsersIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                      <input type="number" value={maleGuests} onChange={e => setMaleGuests(parseInt(e.target.value) || 0)} placeholder="Males" className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]" min="0" />
                  </div>
                  <div className="relative w-1/2">
                      <UsersIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                      <input type="number" value={femaleGuests} onChange={e => setFemaleGuests(parseInt(e.target.value) || 0)} placeholder="Females" className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]" min="0" />
                  </div>
              </div>
          </div>
          
          {isVipUser && (
               <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-4 flex items-start gap-3">
                   <StarIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                   <div>
                       <p className="text-amber-400 font-bold text-sm">VIP Status Active</p>
                       <p className="text-amber-200/70 text-xs mt-1">Your request will bypass standard queues and be auto-approved for expedited entry.</p>
                   </div>
               </div>
          )}

          {selectedDate && (
            <>
              {isPrivilegedUser && (
                  <div className="border-t border-gray-800 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                          <UsersIcon className="w-5 h-5 text-gray-400"/>
                          <h3 className="text-lg font-bold text-white">Guestlist Attendees ({attendees.length})</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                        {displayedAttendees.map(user => (
                            <button key={user.id} onClick={() => onViewProfile(user)} className="flex items-center gap-2 bg-gray-800 p-1.5 pr-3 rounded-full hover:bg-gray-700 transition-colors">
                                <img src={user.profilePhoto} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                                <span className="text-sm text-gray-300">{user.name}</span>
                            </button>
                        ))}
                      </div>
                      {attendees.length > visibleAttendees && (
                          <div className="text-center mt-3">
                              <button 
                                  onClick={() => setVisibleAttendees(prev => prev + ATTENDEE_INCREMENT)}
                                  className="text-sm font-semibold text-amber-400 hover:underline"
                              >
                                  Show More ({attendees.length - visibleAttendees} more)
                              </button>
                          </div>
                      )}
                  </div>
              )}
              
              {currentUser.accessLevel === UserAccessLevel.ACCESS_MALE && (
                <div className="border-t border-gray-800 pt-6">
                    <div className="flex items-center gap-2 mb-2">
                        <UsersIcon className="w-5 h-5 text-gray-400"/>
                        <h3 className="text-lg font-bold text-white">Girls Attending</h3>
                    </div>
                    <p className="text-4xl font-bold text-white text-center py-4">{femaleAttendeesCount}</p>
                </div>
              )}

              {isPrivilegedUser && selectedDate && bookedTables.length > 0 && (
                  <div className="border-t border-gray-800 pt-6">
                      <h3 className="text-lg font-bold text-white mb-4">Booked Tables for the Night</h3>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                          {bookedTables.map(booking => (
                              <div key={booking.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                  <div>
                                      <p className="font-semibold text-white">{booking.tableDetails?.tableOption?.name}</p>
                                      <p className="text-xs text-gray-400">Hosted by {booking.tableDetails?.guestDetails?.name}</p>
                                  </div>
                                  <span className="text-amber-400 font-bold text-sm">
                                      {getPriceRating(booking.tableDetails?.tableOption?.minSpend || 0)}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
            </>
          )}

        </div>
        <div className="p-4 border-t border-gray-800">
            {!isVipUser && (
                <p className="text-xs text-gray-500 mb-4 text-center">
                    Non-approved girls are not guaranteed entry. Make sure they fit the dress code/profile. Speak to the promoter for approval.
                </p>
            )}
            <button 
                onClick={handleConfirm}
                disabled={!selectedDate}
                className={`w-full text-black font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed ${isVipUser ? 'bg-amber-400 hover:bg-amber-300' : 'bg-[#EC4899] text-white hover:bg-[#d8428a]'}`}
            >
                {isVipUser ? 'Confirm VIP Entry' : 'Join Guestlist'}
            </button>
        </div>
      </div>
    </div>
  );
};
