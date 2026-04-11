
import React, { useState } from 'react';
import { CartItem, Venue, User, UserRole, UserAccessLevel } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { KeyIcon } from './icons/KeyIcon';
import { ChatIcon } from './icons/ChatIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ConfirmationModal } from './modals/ConfirmationModal';

interface CartItemCardProps {
    item: CartItem;
    venues: Venue[];
    onRemove: (itemId: string) => void;
    onUpdatePaymentOption: (itemId: string, option: 'deposit' | 'full') => void;
    onMoveToCart?: (item: CartItem) => void;
    isBooked?: boolean;
    onViewReceipt?: (item: CartItem) => void;
    onStartChat?: (item: CartItem) => void;
    isSelected?: boolean;
    onToggleSelection?: (itemId: string) => void;
    currentUser?: User;
    onCancelRsvp?: (item: CartItem) => void;
}

const DetailRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-start text-sm gap-2">
        <p className="text-gray-400 flex-shrink-0">{label}</p>
        <p className="font-semibold text-white text-right break-words">{value}</p>
    </div>
);

export const CartItemCard: React.FC<CartItemCardProps> = ({ item, venues, onRemove, onUpdatePaymentOption, onMoveToCart, isBooked, onViewReceipt, onStartChat, isSelected, onToggleSelection, currentUser, onCancelRsvp }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRemoveModalOpen(true);
    };

    const confirmRemove = () => {
        onRemove(item.id);
        setIsRemoveModalOpen(false);
    };

    if (item.isPlaceholder) {
        return (
            <>
                <div className="bg-gray-900 rounded-lg p-4 border border-dashed border-gray-700 flex flex-col gap-2 group hover:border-gray-500 transition-colors">
                    <div className="flex gap-3">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover opacity-70" />
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <p className="font-bold text-gray-300 text-sm">{item.name}</p>
                                <button onClick={handleRemoveClick} className="text-gray-500 hover:text-red-500">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{new Date(item.date || '').toLocaleDateString()}</p>
                            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Watchlist</span>
                        </div>
                    </div>
                    {onMoveToCart && (
                        <button 
                            onClick={() => onMoveToCart(item)} 
                            className="mt-2 w-full bg-[#EC4899] text-white text-xs font-bold py-2 rounded hover:bg-[#d8428a] transition-colors"
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
                <ConfirmationModal 
                    isOpen={isRemoveModalOpen}
                    onClose={() => setIsRemoveModalOpen(false)}
                    onConfirm={confirmRemove}
                    title="Remove from Watchlist?"
                    message={`Are you sure you want to remove ${item.name} from your watchlist?`}
                    confirmText="Remove"
                    confirmVariant="danger"
                />
            </>
        );
    }

    const isGuestlist = item.type === 'guestlist';
    const status = isGuestlist ? item.guestlistDetails?.status : 'confirmed';
    
    const getStatusBadge = () => {
        if (status === 'approved') {
            return <div className="flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-900/50"><CheckCircleIcon className="w-3 h-3" /> Approved</div>;
        }
        if (status === 'pending') {
            return <div className="flex items-center gap-1 bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-yellow-900/50"><ClockIcon className="w-3 h-3" /> Pending</div>;
        }
        if (status === 'rejected') {
            return <div className="flex items-center gap-1 bg-red-900/30 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-900/50"><CloseIcon className="w-3 h-3" /> Rejected</div>;
        }
        return null;
    };

    return (
        <>
            <div className={`bg-gray-900 rounded-lg p-4 border transition-all duration-200 ${isSelected ? 'border-[#EC4899] bg-gray-900/80' : 'border-gray-800 hover:border-gray-700'}`}>
                <div className="flex gap-3">
                    {/* Selection Checkbox (Only for unbooked items in cart) */}
                    {!isBooked && onToggleSelection && (
                        <div className="flex items-center h-16">
                            <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => onToggleSelection(item.id)}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-[#EC4899] focus:ring-[#EC4899]"
                            />
                        </div>
                    )}

                    {/* Image */}
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                    
                    {/* Main Content */}
                    <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-white text-sm truncate pr-2">{item.name}</h3>
                                {isGuestlist && getStatusBadge()}
                            </div>
                            
                            {/* Action Buttons */}
                            {!isBooked ? (
                                <button onClick={handleRemoveClick} className="text-gray-500 hover:text-red-500 transition-colors p-1 -mr-1">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    {onStartChat && (
                                        <button onClick={() => onStartChat(item)} className="text-gray-400 hover:text-[#EC4899] transition-colors" title="Chat">
                                            <ChatIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    {onViewReceipt && (
                                        <button onClick={() => onViewReceipt(item)} className="text-gray-400 hover:text-white transition-colors" title="View Ticket">
                                            <KeyIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-gray-400 mt-1">{item.date || item.sortableDate}</p>
                        
                        {/* Price Display */}
                        {!isGuestlist && (
                            <div className="flex justify-between items-end mt-1">
                                <p className="text-sm font-semibold text-white">
                                    {item.paymentOption === 'full' ? `$${item.fullPrice?.toLocaleString()}` : `$${item.depositPrice?.toLocaleString()} Deposit`}
                                </p>
                                
                                {/* Payment Option Toggle (Cart Only) */}
                                {!isBooked && item.type === 'table' && (
                                    <div className="flex bg-gray-800 rounded p-0.5">
                                        <button 
                                            onClick={() => onUpdatePaymentOption(item.id, 'deposit')}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${item.paymentOption === 'deposit' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                        >
                                            Deposit
                                        </button>
                                        <button 
                                            onClick={() => onUpdatePaymentOption(item.id, 'full')}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${item.paymentOption === 'full' ? 'bg-[#EC4899] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                        >
                                            Full
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded Details Toggle */}
                <button 
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)} 
                    className="w-full flex items-center justify-center mt-3 pt-2 border-t border-gray-800 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <span className="mr-1">{isDetailsOpen ? 'Hide' : 'Show'} Details</span>
                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Details Section */}
                {isDetailsOpen && (
                    <div className="mt-3 space-y-2 bg-gray-800/50 p-3 rounded-lg animate-fade-in">
                        {item.type === 'table' && item.tableDetails && (
                            <>
                                <DetailRow label="Table" value={item.tableDetails.tableOption?.name || 'Standard'} />
                                <DetailRow label="Promoter" value={item.tableDetails.promoter?.name || 'None'} />
                                <DetailRow label="Guests" value={item.tableDetails.numberOfGuests || 0} />
                                {item.tableDetails.specialRequests && (
                                    <DetailRow label="Requests" value={item.tableDetails.specialRequests} />
                                )}
                                {item.tableDetails.selectedBottles && item.tableDetails.selectedBottles.length > 0 && (
                                    <div className="text-xs text-gray-400 pt-1">
                                        <p className="mb-1">Bottles:</p>
                                        <ul className="list-disc pl-4">
                                            {item.tableDetails.selectedBottles.map((b, idx) => (
                                                <li key={idx}>{b.quantity}x {b.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {item.type === 'guestlist' && item.guestlistDetails && (
                            <>
                                <DetailRow label="Venue" value={item.guestlistDetails.venue.name} />
                                <DetailRow label="Promoter" value={item.guestlistDetails.promoter.name} />
                                <DetailRow label="Guests" value={item.guestlistDetails.numberOfGuests} />
                                <DetailRow label="Status" value={status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'} />
                            </>
                        )}

                        {item.type === 'event' && item.eventDetails && (
                            <>
                                <DetailRow label="Event" value={item.eventDetails.event.title} />
                                <DetailRow label="Tickets" value={item.quantity} />
                            </>
                        )}

                        {item.type === 'experience' && item.experienceDetails && (
                            <>
                                <DetailRow label="Experience" value={item.experienceDetails.experience.title} />
                                <DetailRow label="Guests/Qty" value={item.quantity} />
                            </>
                        )}
                        
                        {item.type === 'storeItem' && item.storeItemDetails && (
                            <>
                                <DetailRow label="Item" value={item.storeItemDetails.item.title} />
                                <DetailRow label="Category" value={item.storeItemDetails.item.category} />
                            </>
                        )}
                    </div>
                )}
            </div>
            <ConfirmationModal 
                isOpen={isRemoveModalOpen}
                onClose={() => setIsRemoveModalOpen(false)}
                onConfirm={confirmRemove}
                title={item.isPlaceholder ? "Remove from Watchlist?" : "Remove Item?"}
                message={item.isPlaceholder ? `Are you sure you want to remove ${item.name} from your watchlist?` : `Are you sure you want to remove ${item.name} from your cart?`}
                confirmText="Remove"
                confirmVariant="danger"
            />
        </>
    );
};
