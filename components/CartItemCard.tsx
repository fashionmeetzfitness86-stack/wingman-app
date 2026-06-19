
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

// ─── Type config for experience badges ───────────────────────
const TYPE_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    scheduledBooking: { label: 'Event', icon: '⚡', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
    event:            { label: 'Event', icon: '⚡', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
    experience:       { label: 'Experience', icon: '✦', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    table:            { label: 'Table', icon: '🌙', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
    guestlist:        { label: 'Guestlist', icon: '🎟', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
    storeItem:        { label: 'Store', icon: '🏷', color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
};

const DetailRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-start gap-4">
        <p className="text-[11px] text-gray-500 flex-shrink-0">{label}</p>
        <p className="text-[11px] font-semibold text-gray-300 text-right">{value}</p>
    </div>
);

export const CartItemCard: React.FC<CartItemCardProps> = ({
    item, venues, onRemove, onUpdatePaymentOption, onMoveToCart,
    isBooked, onViewReceipt, onStartChat, isSelected, onToggleSelection,
    currentUser, onCancelRsvp
}) => {
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

    const meta = TYPE_META[item.type] ?? { label: item.type, icon: '●', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)' };
    const isGuestlist = item.type === 'guestlist';
    const status = isGuestlist ? item.guestlistDetails?.status : 'confirmed';

    const getStatusBadge = () => {
        if (status === 'approved') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide" style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircleIcon className="w-2.5 h-2.5" /> Approved
            </span>
        );
        if (status === 'pending') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                <ClockIcon className="w-2.5 h-2.5" /> Under Review
            </span>
        );
        if (status === 'rejected') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                <CloseIcon className="w-2.5 h-2.5" /> Restricted
            </span>
        );
        return null;
    };

    // ── Watchlist / placeholder card ─────────────────────────
    if (item.isPlaceholder) {
        return (
            <>
                <div
                    className="rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                        background: '#111113',
                        border: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    }}
                >
                    <div className="flex gap-3 p-4">
                        <div className="relative flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover opacity-70" />
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-black text-sm text-white/80 truncate pr-2 leading-tight">{item.name}</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">{new Date(item.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <button onClick={handleRemoveClick} className="text-gray-700 hover:text-red-500 transition-colors p-1 -mr-1 -mt-0.5">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.07)' }}>
                                Watchlist
                            </span>
                        </div>
                    </div>
                    {onMoveToCart && (
                        <div className="px-4 pb-4">
                            <button
                                onClick={() => onMoveToCart(item)}
                                className="w-full py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90 active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)' }}
                            >
                                Move to Cart
                            </button>
                        </div>
                    )}
                </div>
                <ConfirmationModal
                    isOpen={isRemoveModalOpen}
                    onClose={() => setIsRemoveModalOpen(false)}
                    onConfirm={confirmRemove}
                    title="Remove from Watchlist?"
                    message={`Remove ${item.name} from your watchlist?`}
                    confirmText="Remove"
                    confirmVariant="danger"
                />
            </>
        );
    }

    const isYacht = item.type === 'table' && item.tableDetails?.venue?.category === 'Yacht';
    const displayPrice = isYacht
        ? (item.paymentOption === 'full'
            ? (item.fullPrice != null ? `$${item.fullPrice.toLocaleString()}` : '—')
            : (item.depositPrice != null ? `$${item.depositPrice.toLocaleString()}` : '—'))
        : (item.fullPrice != null ? `$${item.fullPrice.toLocaleString()}` : '—');

    return (
        <>
            <div
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                    background: isSelected ? 'rgba(255,255,255,0.04)' : '#111113',
                    border: isSelected
                        ? '1px solid rgba(255,255,255,0.18)'
                        : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isSelected
                        ? '0 0 0 1px rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.4)'
                        : '0 2px 12px rgba(0,0,0,0.3)',
                }}
            >
                {/* ── Cover image strip ── */}
                {item.image && (
                    <div className="relative h-24 overflow-hidden">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            style={{ filter: isSelected ? 'brightness(0.75)' : 'brightness(0.55)' }}
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,17,19,1) 0%, rgba(17,17,19,0.4) 55%, transparent 100%)' }} />

                        {/* Type badge */}
                        <span
                            className="absolute top-2.5 left-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}
                        >
                            {meta.icon} {meta.label}
                        </span>

                        {/* Checkbox */}
                        {!isBooked && onToggleSelection && (
                            <button
                                onClick={() => onToggleSelection(item.id)}
                                className="absolute top-2.5 right-2.5 flex items-center justify-center w-6 h-6 rounded-lg transition-all"
                                style={{
                                    background: isSelected ? '#fff' : 'rgba(0,0,0,0.55)',
                                    border: isSelected ? '2px solid #fff' : '2px solid rgba(255,255,255,0.25)',
                                }}
                                aria-label={isSelected ? 'Deselect item' : 'Select item'}
                            >
                                {isSelected && (
                                    <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        )}

                        {/* Booked action buttons */}
                        {isBooked && (
                            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                                {onStartChat && (
                                    <button onClick={() => onStartChat(item)} className="flex items-center justify-center w-7 h-7 rounded-lg text-white/70 hover:text-white transition-colors" style={{ background: 'rgba(0,0,0,0.55)' }} title="Chat">
                                        <ChatIcon className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                {onViewReceipt && (
                                    <button onClick={() => onViewReceipt(item)} className="flex items-center justify-center w-7 h-7 rounded-lg text-white/70 hover:text-white transition-colors" style={{ background: 'rgba(0,0,0,0.55)' }} title="View Ticket">
                                        <KeyIcon className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Card body ── */}
                <div className="px-4 pt-2.5 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-black text-white text-sm leading-snug truncate">{item.name}</h3>
                            {item.date && (
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                    {new Date((item.date || '') + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            )}
                            {isGuestlist && <div className="mt-1">{getStatusBadge()}</div>}
                        </div>

                        <div className="flex items-start gap-2 flex-shrink-0">
                            {/* Price */}
                            {!isGuestlist && (
                                <p className="text-sm font-black text-white">{displayPrice}</p>
                            )}
                            {/* Remove button */}
                            {!isBooked && (
                                <button
                                    onClick={handleRemoveClick}
                                    className="p-1 text-gray-700 hover:text-red-500 transition-colors -mr-0.5 -mt-0.5"
                                    aria-label="Remove item"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>



                    {/* Payment option toggle — Yacht only (large charter price) */}
                    {!isBooked && isYacht && item.depositPrice != null && (
                        <div
                            className="flex mt-2 rounded-xl overflow-hidden p-0.5"
                            style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)' }}
                        >
                            {(['deposit', 'full'] as const).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => onUpdatePaymentOption(item.id, opt)}
                                    className="flex-1 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-lg transition-all duration-200"
                                    style={item.paymentOption === opt
                                        ? { background: 'linear-gradient(135deg,#00D4FF,#7B61FF)', color: '#fff', boxShadow: '0 0 10px rgba(0,212,255,0.3)' }
                                        : { color: '#6B7280' }
                                    }
                                >
                                    {opt === 'deposit' ? `$${item.depositPrice?.toLocaleString()} Deposit` : 'Pay in Full'}
                                </button>
                            ))}
                        </div>
                    )}                   {/* Details toggle */}
                    <button
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        className="w-full flex items-center justify-center gap-1 mt-2.5 pt-2.5 text-[10px] font-semibold transition-colors"
                        style={{
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            color: isDetailsOpen ? 'rgba(255,255,255,0.5)' : '#4B5563',
                        }}
                    >
                        {isDetailsOpen ? 'Hide Details' : 'Show Details'}
                        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isDetailsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Expanded details */}
                    {isDetailsOpen && (
                        <div
                            className="mt-2.5 rounded-xl p-3 space-y-1.5 animate-fade-in"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            {item.type === 'table' && item.tableDetails && (<>
                                <DetailRow label="Table" value={item.tableDetails.tableOption?.name || 'Standard'} />
                                <DetailRow label="Wingman" value={item.tableDetails.wingman?.name || 'None'} />
                                <DetailRow label="Guests" value={item.tableDetails.numberOfGuests || 0} />
                                {item.tableDetails.specialRequests && (
                                    <DetailRow label="Requests" value={item.tableDetails.specialRequests} />
                                )}
                                {item.tableDetails.selectedBottles && item.tableDetails.selectedBottles.length > 0 && (
                                    <div className="pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p className="text-[10px] text-gray-600 mb-1">Bottles</p>
                                        {item.tableDetails.selectedBottles.map((b, idx) => (
                                            <p key={idx} className="text-[11px] text-gray-400">• {b.quantity}× {b.name}</p>
                                        ))}
                                    </div>
                                )}
                            </>)}

                            {item.type === 'guestlist' && item.guestlistDetails && (<>
                                <DetailRow label="Venue" value={item.guestlistDetails.venue.name} />
                                <DetailRow label="Wingman" value={item.guestlistDetails.wingman.name} />
                                <DetailRow label="Guests" value={item.guestlistDetails.numberOfGuests} />
                                <DetailRow label="Status" value={
                                    status === 'rejected' ? 'Restricted'
                                    : status === 'pending' ? 'Under Review'
                                    : status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Under Review'
                                } />
                            </>)}

                            {item.type === 'event' && item.eventDetails && (<>
                                <DetailRow label="Event" value={item.eventDetails.event.title} />
                                <DetailRow label="Tickets" value={item.quantity} />
                            </>)}

                            {item.type === 'experience' && item.experienceDetails && (<>
                                <DetailRow label="Experience" value={item.experienceDetails.experience.title} />
                                <DetailRow label="Guests / Qty" value={item.quantity} />
                            </>)}

                            {item.type === 'storeItem' && item.storeItemDetails && (<>
                                <DetailRow label="Item" value={item.storeItemDetails.item.title} />
                                <DetailRow label="Category" value={item.storeItemDetails.item.category} />
                            </>)}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={isRemoveModalOpen}
                onClose={() => setIsRemoveModalOpen(false)}
                onConfirm={confirmRemove}
                title={item.isPlaceholder ? 'Remove from Watchlist?' : 'Remove Item?'}
                message={item.isPlaceholder
                    ? `Remove ${item.name} from your watchlist?`
                    : `Remove ${item.name} from your cart?`}
                confirmText="Remove"
                confirmVariant="danger"
            />
        </>
    );
};
