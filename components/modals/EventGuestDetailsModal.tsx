
import React, { useState } from 'react';
import { Event, User, UserAccessLevel } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';

interface GuestDetails {
    name: string;
    email: string;
    phone: string;
}

interface EventGuestDetailsModalProps {
    event: Event;
    user: User;
    onClose: () => void;
    onConfirm: (details: GuestDetails) => void;
}

export const EventGuestDetailsModal: React.FC<EventGuestDetailsModalProps> = ({ event, user, onClose, onConfirm }) => {
    const [bookingFor, setBookingFor] = useState<'self' | 'guest'>('self');
    const [guestDetails, setGuestDetails] = useState<GuestDetails>({ name: '', email: '', phone: '' });

    const handleConfirm = () => {
        const detailsToConfirm = bookingFor === 'self'
            ? { name: user.name, email: user.email, phone: user.phoneNumber || '' }
            : guestDetails;
        
        if (bookingFor === 'guest' && (!detailsToConfirm.name || !detailsToConfirm.email)) {
            alert("Please fill in guest name and email.");
            return;
        }

        onConfirm(detailsToConfirm);
    };

    const price = user.accessLevel === UserAccessLevel.APPROVED_GIRL 
        ? event.priceFemale 
        : event.priceGeneral ?? event.priceMale;
    const priceText = price === 0 ? "Complimentary" : `$${price}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Confirm Booking for {event.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Who are you booking for?</h3>
                        <div className="space-y-4">
                            <button
                                onClick={() => setBookingFor('self')}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${bookingFor === 'self' ? 'bg-[#EC4899]/10 border-[#EC4899]' : 'bg-gray-800 border-gray-800 hover:border-gray-700'}`}
                            >
                                <p className="font-bold text-white">Book for Myself</p>
                                <p className="text-sm text-gray-400">{user.name}</p>
                            </button>
                            <button
                                onClick={() => setBookingFor('guest')}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${bookingFor === 'guest' ? 'bg-[#EC4899]/10 border-[#EC4899]' : 'bg-gray-800 border-gray-800 hover:border-gray-700'}`}
                            >
                                <p className="font-bold text-white">Book for a Guest</p>
                                <p className="text-sm text-gray-400">Enter their contact information</p>
                            </button>
                        </div>
                        
                        {bookingFor === 'guest' && (
                            <div className="mt-6 space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Guest Full Name</label>
                                    <input type="text" value={guestDetails.name} onChange={e => setGuestDetails({...guestDetails, name: e.target.value})} className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Guest Email</label>
                                    <input type="email" value={guestDetails.email} onChange={e => setGuestDetails({...guestDetails, email: e.target.value})} className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Guest Phone</label>
                                    <input type="tel" value={guestDetails.phone} onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})} className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center text-lg border-t border-gray-700 pt-4">
                        <span className="font-semibold text-gray-300">Total Price:</span>
                        <span className="font-bold text-[#EC4899]">{priceText}</span>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleConfirm} className="bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#d8428a]">Confirm Payment</button>
                </div>
            </div>
        </div>
    );
};
