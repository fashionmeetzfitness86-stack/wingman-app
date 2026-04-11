
import React, { useState, useMemo } from 'react';
import { Experience, User, UserRole, UserAccessLevel, CartItem } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { AddedToPlansModal } from './modals/AddedToPlansModal';

interface ExperienceBookingFlowProps {
  experience: Experience;
  user: User;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onNavigateToCheckout: () => void;
  onKeepBooking: () => void;
}

const getPriceForUser = (experience: Experience, user: User): { price: number; type: string } | null => {
    const { pricing } = experience;

    if (user.role === UserRole.PROMOTER || user.role === UserRole.ADMIN) {
        if (typeof pricing.promoter === 'number') {
            return { price: pricing.promoter, type: 'Promoter Rate' };
        }
    }
    if (user.accessLevel === UserAccessLevel.APPROVED_GIRL) {
        if (typeof pricing.female === 'number') {
            return { price: pricing.female, type: 'Female Access' };
        }
    }
    if (user.accessLevel === UserAccessLevel.ACCESS_MALE) {
        if (typeof pricing.male === 'number') {
            return { price: pricing.male, type: 'Male Access' };
        }
    }
    if (typeof pricing.general === 'number') {
        return { price: pricing.general, type: 'General' };
    }
    
    const fallbackPrice = pricing.general ?? pricing.male ?? pricing.female;
    if (typeof fallbackPrice === 'number') {
        return { price: fallbackPrice, type: 'General' };
    }

    return null;
};

export const ExperienceBookingFlow: React.FC<ExperienceBookingFlowProps> = ({ experience, user, onClose, onAddToCart, onNavigateToCheckout, onKeepBooking }) => {
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [bookingFor, setBookingFor] = useState<'self' | 'guest'>('self');
    const [guestDetails, setGuestDetails] = useState({ name: '', email: '', phone: '' });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const priceDetails = useMemo(() => getPriceForUser(experience, user), [experience, user]);
    const unitPrice = priceDetails?.price ?? 0;
    const totalPriceInUSD = unitPrice * quantity;

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setQuantity(value > 0 ? value : 1);
        if (error) setError('');
    };
    
    const validateAndProceed = () => {
        if (experience.pricing.unit !== 'night' && experience.pricing.unit !== 'week') {
            if(experience.capacity && quantity > experience.capacity) {
                setError(`This experience has a maximum capacity of ${experience.capacity} guests.`);
                return;
            }
        }
        setStep(step + 1);
    };

    const handleAddToCart = () => {
        if (bookingFor === 'guest' && (!guestDetails.name || !guestDetails.email)) {
            alert("Please enter the guest's name and email.");
            return;
        }

        const cartItem: CartItem = {
            id: `experience-${experience.id}`, // Simple ID, assumes one booking per experience in cart
            type: 'experience',
            name: experience.title,
            image: experience.coverImage,
            quantity: quantity,
            fullPrice: totalPriceInUSD,
            paymentOption: 'full', // Experiences are always full payment
            experienceDetails: {
                experience: experience,
                guestDetails: bookingFor === 'self' 
                    ? { name: user.name, email: user.email, phone: user.phoneNumber || '' } 
                    : guestDetails
            }
        };

        onAddToCart(cartItem);
        setShowSuccessModal(true);
    };

    const renderStep = () => {
        let quantityLabel: string;
        let quantityIcon: React.ReactNode;

        switch (experience.pricing.unit) {
            case 'night':
                quantityLabel = 'Number of Nights';
                quantityIcon = <CalendarIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />;
                break;
            case 'week':
                quantityLabel = 'Number of Weeks';
                quantityIcon = <CalendarIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />;
                break;
            default:
                quantityLabel = 'Number of Guests';
                quantityIcon = <UsersIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />;
                break;
        }


        switch (step) {
            case 1: // Details & Guests
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Booking Details</h2>
                        <p className="text-gray-400 mb-6">Confirm details for <span className="text-amber-400">{experience.title}</span>.</p>
                        <div className="mb-6">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2">{quantityLabel}</label>
                            <div className="relative">
                                {quantityIcon}
                                <input
                                    type="number"
                                    id="quantity"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className={`w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-600'} text-white rounded-lg p-3 pl-10 focus:ring-amber-400 focus:border-amber-400`}
                                    min="1"
                                    aria-label={quantityLabel}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm border border-gray-700">
                            <div className="flex justify-between"><span className="text-gray-400">Price per {experience.pricing.unit}:</span> <span className="text-white font-semibold">${unitPrice.toLocaleString()}</span></div>
                            <div className="border-t border-gray-700 my-1"></div>
                            <div className="flex justify-between text-base"><span className="text-gray-200 font-bold">Total (USD):</span> <span className="text-amber-400 font-bold">${totalPriceInUSD.toLocaleString()}</span></div>
                        </div>
                        
                        <button onClick={validateAndProceed} className="mt-6 w-full bg-[#EC4899] text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105 hover:bg-[#d8428a]">
                            Continue
                        </button>
                    </div>
                );
            case 2: // Guest Details
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Who are you booking for?</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => setBookingFor('self')}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${bookingFor === 'self' ? 'bg-pink-500/10 border-pink-500' : 'bg-gray-800 border-gray-800 hover:border-gray-700'}`}
                            >
                                <p className="font-bold text-white">Book for Myself</p>
                                <p className="text-sm text-gray-400">{user.name}</p>
                            </button>
                            <button
                                onClick={() => setBookingFor('guest')}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${bookingFor === 'guest' ? 'bg-pink-500/10 border-pink-500' : 'bg-gray-800 border-gray-800 hover:border-gray-700'}`}
                            >
                                <p className="font-bold text-white">Book for a Guest</p>
                                <p className="text-sm text-gray-400">Enter their contact information</p>
                            </button>
                        </div>
                        
                        {bookingFor === 'guest' && (
                            <div className="mt-6 space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Guest Full Name</label>
                                    <input type="text" value={guestDetails.name} onChange={e => setGuestDetails({...guestDetails, name: e.target.value})} className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Guest Email</label>
                                    <input type="email" value={guestDetails.email} onChange={e => setGuestDetails({...guestDetails, email: e.target.value})} className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Guest Phone</label>
                                    <input type="tel" value={guestDetails.phone} onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})} className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500" />
                                </div>
                            </div>
                        )}
                        
                        <button onClick={handleAddToCart} className="mt-8 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105">
                            Add to Cart
                        </button>
                    </div>
                );
            default: return null;
        }
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
                <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-gray-800 flex-shrink-0">
                        <h2 className="text-xl font-bold text-white truncate">{experience.title}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close booking flow">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6">
                        {renderStep()}
                    </div>
                    {step > 1 && (
                        <div className="p-4 border-t border-gray-800 flex-shrink-0">
                            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors" aria-label="Go to previous step">
                                <ChevronLeftIcon className="w-5 h-5"/>
                                Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {showSuccessModal && (
                <AddedToPlansModal
                    isOpen={true}
                    onClose={() => {
                        setShowSuccessModal(false);
                        onClose();
                    }}
                    venueName={experience.title}
                    onCheckout={onNavigateToCheckout}
                    onKeepBooking={onKeepBooking}
                    keepBookingLabel="Keep booking"
                />
            )}
        </>
    );
};
