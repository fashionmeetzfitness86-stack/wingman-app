
import React, { useState, useMemo } from 'react';
import { Event, CartItem, User } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { AddedToPlansModal } from './modals/AddedToPlansModal';

interface EventBookingFlowProps {
    event: Event;
    currentUser: User;
    onClose: () => void;
    onAddToCart: (item: CartItem) => void;
    onNavigateToCheckout: () => void;
    onKeepBooking: () => void;
}

export const EventBookingFlow: React.FC<EventBookingFlowProps> = ({ event, currentUser, onClose, onAddToCart, onNavigateToCheckout, onKeepBooking }) => {
    const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({
        female: 0,
        male: 0,
        general: 0
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const ticketTypes = useMemo(() => {
        const types = [];
        if (event.priceFemale !== undefined) {
            types.push({ id: 'female', label: 'Female Admission', price: event.priceFemale });
        }
        if (event.priceMale !== undefined) {
            types.push({ id: 'male', label: 'Male Admission', price: event.priceMale });
        }
        if (event.priceGeneral !== undefined) {
            types.push({ id: 'general', label: 'General Admission', price: event.priceGeneral });
        }
        return types;
    }, [event]);

    const handleCountChange = (typeId: string, change: number) => {
        setTicketCounts(prev => {
            const current = prev[typeId] || 0;
            const newCount = Math.max(0, current + change);
            return { ...prev, [typeId]: newCount };
        });
    };

    const totalAmount = ticketTypes.reduce((acc, type) => {
        return acc + (type.price * (ticketCounts[type.id] || 0));
    }, 0);

    const totalTickets = Object.keys(ticketCounts).reduce((sum, key) => {
        return sum + (ticketCounts[key] || 0);
    }, 0);

    const handleConfirm = () => {
        // Create cart items for each non-zero ticket type
        Object.keys(ticketCounts).forEach((typeId) => {
            const quantity = ticketCounts[typeId];
            if (quantity > 0) {
                const typeDef = ticketTypes.find(t => t.id === typeId);
                if (typeDef) {
                    const cartItem: CartItem = {
                        id: `event-${event.id}-${typeId}-${Date.now()}`,
                        type: 'event',
                        name: `${event.title} - ${typeDef.label}`,
                        image: event.image,
                        date: event.date,
                        sortableDate: event.date,
                        quantity: quantity,
                        fullPrice: typeDef.price * quantity,
                        paymentOption: 'full',
                        eventDetails: {
                            event: event,
                            guestDetails: { name: currentUser.name, email: currentUser.email }
                        }
                    };
                    onAddToCart(cartItem);
                }
            }
        });
        setShowSuccessModal(true);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
                <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-gray-800">
                        <div>
                            <h2 className="text-xl font-bold text-white">{event.title}</h2>
                            <p className="text-xs text-gray-400">Select Tickets</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto">
                        {ticketTypes.map(type => {
                            const count = ticketCounts[type.id] || 0;
                            return (
                                <div key={type.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white">{type.label}</p>
                                        <p className="text-amber-400 font-semibold">${type.price}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => handleCountChange(type.id, -1)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center border border-gray-600 ${count > 0 ? 'text-white hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'}`}
                                            disabled={count <= 0}
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center font-bold text-white">{count}</span>
                                        <button 
                                            onClick={() => handleCountChange(type.id, 1)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-gray-800 bg-black/30 rounded-b-xl">
                        <div className="flex justify-between items-center mb-4 text-lg">
                            <span className="text-gray-300">Total</span>
                            <span className="font-bold text-white">${totalAmount.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleConfirm}
                            disabled={totalTickets === 0}
                            className="w-full bg-[#EC4899] text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-[1.02] hover:bg-[#d8428a] disabled:bg-gray-700 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Add {totalTickets > 0 ? `${totalTickets} Ticket${totalTickets > 1 ? 's' : ''}` : ''} to Cart
                        </button>
                    </div>
                </div>
            </div>

            {showSuccessModal && (
                <AddedToPlansModal 
                    isOpen={showSuccessModal}
                    onClose={() => {
                        setShowSuccessModal(false);
                        onClose();
                    }}
                    venueName={event.title}
                    onCheckout={onNavigateToCheckout}
                    onKeepBooking={onKeepBooking}
                    keepBookingLabel="Keep Browsing"
                />
            )}
        </>
    );
};
