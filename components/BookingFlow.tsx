
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Promoter, Venue, TableOption, UserAccessLevel, User, CartItem, UserRole } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UsersIcon } from './icons/UsersIcon';
import { AddedToPlansModal } from './modals/AddedToPlansModal';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';

interface BookingFlowProps {
  promoter: Promoter;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  currentUser: User;
  initialVenue?: Venue;
  initialDate?: string;
  tableBookings: Record<string, number>;
  onNavigateToCheckout: () => void;
  onKeepBooking: () => void;
  venues: Venue[];
}

const TAX_SERVICE_RATE = 0.36;
const DEPOSIT_AMOUNT = 50;
const LARGE_GROUP_MAX_GUESTS = 20;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DetailRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-gray-400">{label}</p>
        <p className="font-semibold text-white text-right">{value}</p>
    </div>
);


export const BookingFlow: React.FC<BookingFlowProps> = ({ promoter, onClose, onAddToCart, currentUser, initialVenue, initialDate, tableBookings, onNavigateToCheckout, onKeepBooking, venues }) => {
  const [step, setStep] = useState(initialVenue ? 2 : 1);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(initialVenue || null);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || '');
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null);
  const isPrivilegedUser = useMemo(() => currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.role === UserRole.ADMIN, [currentUser.accessLevel, currentUser.role]);

  const [numberOfMaleGuests, setNumberOfMaleGuests] = useState<number | ''>(isPrivilegedUser ? 0 : 1);
  const [numberOfFemaleGuests, setNumberOfFemaleGuests] = useState<number | ''>(isPrivilegedUser ? 1 : 0);
  const [errors, setErrors] = useState<{ date?: string; guests?: string }>({});

  const [bookingFor, setBookingFor] = useState<'self' | 'guest'>('self');
  const [guestDetails, setGuestDetails] = useState({ name: '', email: '', phone: '' });
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Ref for focus first input
  const firstInputRef = useRef<HTMLInputElement | HTMLButtonElement>(null);

  const promoterVenues = useMemo(() => {
      const assigned = venues.filter(v => promoter.assignedVenueIds.includes(v.id));
      if (initialVenue && !assigned.find(v => v.id === initialVenue.id)) {
          return [initialVenue, ...assigned];
      }
      return assigned;
  }, [promoter.assignedVenueIds, venues, initialVenue]);

  const minDate = useMemo(() => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (initialVenue) {
        setSelectedVenue(initialVenue);
        setStep(2);
    }
    if (initialDate) {
        setSelectedDate(initialDate);
    }
  }, [initialVenue, initialDate]);
  
  // Focus management
  useEffect(() => {
      if (firstInputRef.current) {
          firstInputRef.current.focus();
      }
  }, [step]);

  const totalGuests = useMemo(() => Number(numberOfMaleGuests || 0) + Number(numberOfFemaleGuests || 0), [numberOfMaleGuests, numberOfFemaleGuests]);

  const totalWithTaxAndService = useMemo(() => {
    const totalMinSpend = selectedTable?.minSpend || 0;
    return totalMinSpend * (1 + TAX_SERVICE_RATE);
  }, [selectedTable]);

  const handleVenueSelect = (venue: Venue) => { setSelectedVenue(venue); setStep(2); };
  
  const handleTableSelect = (table: TableOption) => { 
      setSelectedTable(table); 
      setStep(4); 
  };

  const validateAndProceed = () => {
    const newErrors: { date?: string; guests?: string } = {};
    let isValid = true;
    
    if (!selectedDate) {
        newErrors.date = "Please select a date for your reservation.";
        isValid = false;
    } else if (selectedDate < minDate) {
        newErrors.date = "Please select a future date.";
        isValid = false;
    } else if (selectedVenue) {
         const dateObj = new Date(selectedDate + 'T00:00:00');
         if (isNaN(dateObj.getTime())) {
             newErrors.date = "Invalid date selected.";
             isValid = false;
         } else {
             const dayOfWeek = WEEKDAYS[dateObj.getDay()];
             const isOpen = selectedVenue.operatingDays.some(day => day.toLowerCase() === dayOfWeek.toLowerCase());
             
             if (!isOpen) {
                 newErrors.date = `${selectedVenue.name} is closed on ${dayOfWeek}s.`;
                 isValid = false;
             }
         }
    }

    if (step === 2 && totalGuests === 0) {
      newErrors.guests = "Please specify the number of guests.";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
        setStep(s => s + 1);
    }
  };
  
  const handleConfirmBooking = () => {
    if (!selectedVenue || !selectedTable || !selectedDate) return;
    
    if (bookingFor === 'guest' && (!guestDetails.name || !guestDetails.email)) {
        alert("Please enter the guest's name and email.");
        return;
    }

    const cartItem: CartItem = {
      id: `table-${selectedVenue.id}-${selectedDate}-${selectedTable.id}-${Date.now()}`,
      type: 'table',
      name: selectedVenue.name,
      image: selectedVenue.coverImage,
      date: new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      sortableDate: selectedDate,
      quantity: 1,
      fullPrice: totalWithTaxAndService,
      depositPrice: DEPOSIT_AMOUNT,
      paymentOption: 'full',
      tableDetails: {
        venue: selectedVenue, tableOption: selectedTable, promoter: promoter, numberOfGuests: totalGuests,
        guestDetails: bookingFor === 'guest' ? guestDetails : { name: currentUser.name, email: currentUser.email, phone: currentUser.phoneNumber || ''},
        specialRequests: specialRequests
      }
    };
    
    onAddToCart(cartItem);
    setShowSuccessModal(true);
  };

  const renderStepContent = () => {
    switch (step) {
        case 1: // Select Venue
            return (
                <div role="region" aria-label="Select a Venue">
                    <h2 className="text-2xl font-bold text-white mb-6">Select a Venue</h2>
                    <div className="space-y-3">
                        {promoterVenues.map((venue, index) => (
                            <button 
                                key={venue.id} 
                                onClick={() => handleVenueSelect(venue)} 
                                ref={index === 0 ? firstInputRef as React.RefObject<HTMLButtonElement> : null}
                                className="w-full flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left group focus:ring-2 focus:ring-[#EC4899] focus:outline-none" 
                                aria-label={`Select ${venue.name}`}
                            >
                                <img src={venue.coverImage} alt={venue.name} className="w-20 h-14 object-cover rounded-md group-hover:opacity-80 transition-opacity" />
                                <div>
                                    <p className="font-bold text-white">{venue.name}</p>
                                    <p className="text-sm text-gray-400">{venue.location}</p>
                                    <p className="text-xs text-gray-500 mt-1">Open: {venue.operatingDays.join(', ')}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );
        case 2: // Date & Guests
            return (
                <div role="region" aria-label="Select Date and Guests">
                    <h2 className="text-2xl font-bold text-white mb-6">Date & Guests</h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="booking-date" className="block text-sm font-medium text-gray-300 mb-2">Select Date</label>
                            <input 
                                type="date" 
                                id="booking-date" 
                                ref={firstInputRef as React.RefObject<HTMLInputElement>}
                                value={selectedDate} 
                                onChange={e => { setSelectedDate(e.target.value); setErrors({...errors, date: undefined}); }} 
                                min={minDate} 
                                className={`w-full bg-gray-800 border ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-[#EC4899] focus:ring-[#EC4899]'} text-white rounded-lg p-3 transition-colors`} 
                                aria-invalid={!!errors.date}
                                aria-describedby={errors.date ? "date-error" : undefined}
                            />
                             {errors.date && (
                                <div id="date-error" className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-fade-in">
                                    <ExclamationCircleIcon className="w-4 h-4" />
                                    <span>{errors.date}</span>
                                </div>
                             )}
                             {selectedVenue && !errors.date && (
                                 <p className="text-xs text-gray-500 mt-2 ml-1">
                                     Open: <span className="text-gray-400">{selectedVenue.operatingDays.join(', ')}</span>
                                 </p>
                             )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Number of Guests</label>
                            <div className="flex gap-4">
                                <div className="relative w-1/2">
                                    <UsersIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                    <input 
                                        type="number" 
                                        value={numberOfMaleGuests} 
                                        onChange={e => { setNumberOfMaleGuests(e.target.value === '' ? '' : parseInt(e.target.value, 10)); setErrors({...errors, guests: undefined}); }} 
                                        placeholder="Males" 
                                        className={`w-full bg-gray-800 border ${errors.guests ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-[#EC4899]'} text-white rounded-lg p-3 pl-10 focus:ring-1`} 
                                        min="0" 
                                        max={LARGE_GROUP_MAX_GUESTS} 
                                        aria-label="Number of male guests"
                                    />
                                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">M</span>
                                </div>
                                <div className="relative w-1/2">
                                    <UsersIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                    <input 
                                        type="number" 
                                        value={numberOfFemaleGuests} 
                                        onChange={e => { setNumberOfFemaleGuests(e.target.value === '' ? '' : parseInt(e.target.value, 10)); setErrors({...errors, guests: undefined}); }} 
                                        placeholder="Females" 
                                        className={`w-full bg-gray-800 border ${errors.guests ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-[#EC4899]'} text-white rounded-lg p-3 pl-10 focus:ring-1`} 
                                        min="0" 
                                        max={LARGE_GROUP_MAX_GUESTS} 
                                        aria-label="Number of female guests"
                                    />
                                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">F</span>
                                </div>
                            </div>
                            {errors.guests && (
                                <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-fade-in">
                                    <ExclamationCircleIcon className="w-4 h-4" />
                                    <span>{errors.guests}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={validateAndProceed} 
                        className="mt-10 w-full bg-[#EC4899] text-white font-bold py-3.5 px-4 rounded-lg transition-transform duration-200 hover:scale-[1.02] hover:bg-[#d8428a] active:scale-95 shadow-lg shadow-pink-500/20 focus:ring-2 focus:ring-white focus:outline-none"
                    >
                        Next
                    </button>
                </div>
            );
        case 3: // Select Table
            const tablesForVenue = selectedVenue?.tableOptions && selectedVenue.tableOptions.length > 0 
                ? selectedVenue.tableOptions 
                : [{
                    id: 'general-inquiry',
                    name: 'General Reservation Request',
                    area: 'General',
                    minSpend: 0,
                    description: 'Submit a request for a table. A promoter will contact you with options.',
                    capacityHint: 'Small Groups'
                } as TableOption];

            return (
                <div role="region" aria-label="Select a Table">
                    <h2 className="text-2xl font-bold text-white mb-6">Select a Table</h2>
                    <div className="space-y-3">
                        {tablesForVenue.map((table, index) => {
                        const tableKey = `${table.id}-${selectedDate}`;
                        const bookingsForTable = tableBookings[tableKey] || 0;
                        const isAvailable = table.totalAvailable === undefined || bookingsForTable < table.totalAvailable;

                        return (
                                <button 
                                    key={table.id} 
                                    onClick={() => handleTableSelect(table)} 
                                    ref={index === 0 ? firstInputRef as React.RefObject<HTMLButtonElement> : null}
                                    disabled={!isAvailable} 
                                    className="w-full p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-800/50 disabled:cursor-not-allowed flex flex-col border border-transparent hover:border-gray-600 focus:ring-2 focus:ring-[#EC4899] focus:outline-none"
                                    aria-disabled={!isAvailable}
                                >
                                    <div className="w-full text-left">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-white">{table.name}</p>
                                                <p className="text-sm text-gray-400 mt-1">{table.description}</p>
                                            </div>
                                            {!isAvailable && <span className="text-xs font-bold text-red-400 mt-1 flex-shrink-0 ml-2 bg-red-900/20 px-2 py-1 rounded">SOLD OUT</span>}
                                        </div>

                                        <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-700">
                                            <div className="flex items-center gap-2 text-sm">
                                                <UsersIcon className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-400">Capacity</p>
                                                    <p className="font-semibold text-white">{table.capacityHint}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Min Spend</p>
                                                <p className="font-bold text-lg text-amber-400">${table.minSpend.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {table.notes && <p className="text-xs text-amber-300/80 mt-2 text-left bg-amber-900/30 p-2 rounded-md w-full border border-amber-900/50">Note: {table.notes}</p>}
                                </button>
                        );
                        })}
                    </div>
                </div>
            );
        case 4: // Confirmation
            if (!selectedVenue || !selectedTable) return null;
            return (
                <div role="region" aria-label="Confirm Booking">
                    <h2 className="text-2xl font-bold text-white mb-4">Confirm Your Booking</h2>

                    {/* 1. Summary */}
                    <div className="bg-gray-800 rounded-lg p-4 space-y-3 border border-gray-700 mb-6">
                        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-3">
                            <h3 className="font-bold text-white">Reservation Summary</h3>
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">Step 4 of 4</span>
                        </div>
                        <DetailRow label="Venue" value={selectedVenue.name} />
                        <DetailRow label="Date" value={new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} />
                        <DetailRow label="Table" value={selectedTable.name} />
                        <DetailRow label="Wingman" value={promoter.name} />
                        <DetailRow label="Guests" value={totalGuests} />
                        
                        <div className="border-t border-gray-700 !mt-4 pt-3">
                            <DetailRow label="Table Min Spend" value={`$${selectedTable.minSpend.toLocaleString()}`} />
                            <div className="flex justify-between items-center text-sm py-1">
                                <p className="text-gray-400">Tax & Service (36%)</p>
                                <p className="font-semibold text-white text-right">${(selectedTable.minSpend * TAX_SERVICE_RATE).toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-700/50 mt-2">
                                <p className="text-white">Total Estimated</p>
                                <p className="text-amber-400">${totalWithTaxAndService.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* 2. Guest Info */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Who are you booking for?</h3>
                        <div className="flex gap-4 mb-4">
                            <button onClick={() => setBookingFor('self')} className={`w-1/2 p-3 rounded-lg border-2 font-semibold transition-colors ${bookingFor === 'self' ? 'bg-pink-500/10 border-pink-500 text-white' : 'bg-gray-800 border-gray-800 text-gray-400 hover:bg-gray-700'}`}>Myself</button>
                            <button onClick={() => setBookingFor('guest')} className={`w-1/2 p-3 rounded-lg border-2 font-semibold transition-colors ${bookingFor === 'guest' ? 'bg-pink-500/10 border-pink-500 text-white' : 'bg-gray-800 border-gray-800 text-gray-400 hover:bg-gray-700'}`}>A Guest</button>
                        </div>

                        {bookingFor === 'guest' && (
                            <div className="space-y-3 animate-fade-in">
                                 <input type="text" value={guestDetails.name} onChange={e => setGuestDetails({...guestDetails, name: e.target.value})} placeholder="Guest Full Name" className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500" required aria-label="Guest Full Name" />
                                 <input type="email" value={guestDetails.email} onChange={e => setGuestDetails({...guestDetails, email: e.target.value})} placeholder="Guest Email" className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500" required aria-label="Guest Email" />
                                 <input type="tel" value={guestDetails.phone} onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})} placeholder="Guest Phone (Optional)" className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500" aria-label="Guest Phone" />
                            </div>
                        )}
                    </div>
                    
                    {/* 3. Special Requests */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Special Requests (Optional)</label>
                        <textarea
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            placeholder="e.g., Booth location preference, birthday celebration, bottle requests..."
                            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899] resize-none h-24 placeholder-gray-500"
                        />
                    </div>

                    {/* 4. Confirm */}
                    <button 
                        onClick={handleConfirmBooking} 
                        className="mt-8 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-[1.02] hover:bg-green-400 shadow-lg shadow-green-900/20 focus:ring-2 focus:ring-white focus:outline-none"
                    >
                        Confirm & Add to Plans
                    </button>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <>
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
            <div 
                className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 relative flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-800 flex-shrink-0">
                    <div>
                        <h2 id="booking-modal-title" className="text-xl font-bold text-white">
                            {step === 1 ? 'Select a Venue' : step === 2 ? 'Date & Guests' : step === 3 ? 'Select a Table' : 'Confirm Details'}
                        </h2>
                        {step > 1 && selectedVenue && <p className="text-xs text-gray-400">at {selectedVenue.name}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close booking flow">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 scroll-smooth">
                    {renderStepContent()}
                </div>

                {step > 1 && (
                    <div className="p-4 border-t border-gray-800 flex-shrink-0">
                        <button 
                            onClick={() => setStep(step - 1)} 
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                            aria-label="Go to previous step"
                        >
                            <ChevronLeftIcon className="w-5 h-5"/>
                            Back
                        </button>
                    </div>
                )}
            </div>
            
            {showSuccessModal && (
                <AddedToPlansModal
                    isOpen={true}
                    onClose={() => {
                        setShowSuccessModal(false);
                        onClose();
                    }}
                    venueName={selectedVenue ? selectedVenue.name : ''}
                    onCheckout={onNavigateToCheckout}
                    onKeepBooking={onKeepBooking}
                    keepBookingLabel="Keep Booking"
                />
            )}
        </div>
    </>
  );
};
