
import React from 'react';
import { Page, CartItem } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface BookingConfirmedPageProps {
    items?: CartItem[];
    onNavigate: (page: Page, params?: Record<string, any>) => void;
    onStartChat?: (item: any) => void;
}

// ── Small detail row for the receipt info section ────────────────────────────
const InfoRow: React.FC<{ icon: string; label: string; value: string; highlight?: boolean }> = ({
    icon, label, value, highlight,
}) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-dashed border-gray-200 last:border-0">
        <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
            <p className={`text-sm font-semibold mt-0.5 leading-snug ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
        </div>
    </div>
);

export const BookingConfirmedPage: React.FC<BookingConfirmedPageProps> = ({ items = [], onNavigate, onStartChat }) => {

    const totalAmount = items.reduce((acc, item) => {
        const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
        return acc + (price || 0);
    }, 0);

    const getTransactionId = () => {
        if (items.length > 0 && items[0].id) {
            const parts = items[0].id.split('-');
            if (parts.length > 1) return parts[1];
            return items[0].id;
        }
        return Date.now().toString().slice(-8);
    };

    const transactionId   = getTransactionId();
    const transactionDate = new Date().toLocaleString();
    const paymentMethod   = items.length > 0 && items[0].paymentMethod ? items[0].paymentMethod : 'usd';
    const isTokenPayment  = paymentMethod === 'tokens';
    const isFree          = totalAmount === 0;
    const USD_TO_TMKC     = 100;

    const displayTotal = isFree
        ? 'FREE'
        : isTokenPayment
            ? `${(totalAmount * USD_TO_TMKC).toLocaleString()} TMKC`
            : `$${totalAmount.toFixed(2)}`;

    const paymentMethodLabel = isFree
        ? 'Complimentary'
        : ({ tokens: 'TMKC Tokens', usd: 'Credit/Debit Card', cashapp: 'Cash App' }[paymentMethod] || 'Credit/Debit Card');

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-black text-white flex flex-col animate-fade-in">
            <div className="p-4">
                <button
                    onClick={() => onNavigate('home')}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to Home
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4 pb-24">
                <div className="w-full max-w-md">

                    {/* Hero */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                            <CheckCircleIcon className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            {isFree ? 'Booking Confirmed!' : 'Payment Successful'}
                        </h1>
                        <p className="text-gray-400 mt-2">Your spot is confirmed. See you there! 🎉</p>
                    </div>

                    {/* Receipt Card */}
                    <div className="bg-white text-black rounded-2xl shadow-2xl overflow-hidden">

                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 text-center" style={{ background: '#F9FAFB' }}>
                            <h2 className="font-black text-lg tracking-widest uppercase text-gray-700">Wingman Receipt</h2>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{transactionDate}</p>
                        </div>

                        {/* Line items */}
                        <div className="p-5">
                            <div className="space-y-4 mb-5">
                                {items.map((item, idx) => {
                                    const itemPrice = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                                    const itemDisplayPrice = (itemPrice === 0 || !itemPrice)
                                        ? 'FREE'
                                        : isTokenPayment
                                            ? `${((itemPrice || 0) * USD_TO_TMKC).toLocaleString()} TMKC`
                                            : `$${(itemPrice || 0).toFixed(2)}`;

                                    let subtitle = '';
                                    if (item.type === 'table')          subtitle = item.tableDetails?.tableOption?.name || 'Table Reservation';
                                    else if (item.type === 'event')     subtitle = 'Wingman Experience';
                                    else if (item.type === 'experience') subtitle = 'Experience Booking';
                                    else if (item.type === 'guestlist') subtitle = 'Guestlist Entry';
                                    else if (item.type === 'storeItem') subtitle = item.storeItemDetails?.item.category || 'Store Item';

                                    // Pull venue details from tableDetails if present
                                    const venue = item.tableDetails?.venue;
                                    const wingman = item.tableDetails?.wingman;
                                    const guestCount = item.tableDetails?.numberOfGuests;
                                    const guestDetails = item.tableDetails?.guestDetails;
                                    const specialRequests = item.tableDetails?.specialRequests;

                                    return (
                                        <div key={idx} className="border-b border-dashed border-gray-200 pb-4 last:border-0 last:pb-0">
                                            {/* Item header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="text-left flex-1 pr-3">
                                                    <p className="font-black text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.date || item.sortableDate || 'No Date'}</p>
                                                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                                                </div>
                                                <p className={`font-mono font-bold text-sm flex-shrink-0 ${itemDisplayPrice === 'FREE' ? 'text-green-600' : ''}`}>
                                                    {itemDisplayPrice}
                                                </p>
                                            </div>

                                            {/* ── Detailed event info ─────────────────────────── */}
                                            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>

                                                {/* Arrival time */}
                                                <InfoRow
                                                    icon="🕐"
                                                    label="Arrival Time"
                                                    value={
                                                        venue?.arrivalTime ||
                                                        (item as any).arrivalTime ||
                                                        'As confirmed by your Wingman'
                                                    }
                                                />

                                                {/* Dress code */}
                                                <InfoRow
                                                    icon="👔"
                                                    label="Dress Code"
                                                    value={venue?.dressCode || 'Upscale nightlife attire'}
                                                />

                                                {/* Age restriction */}
                                                <InfoRow
                                                    icon="🔞"
                                                    label="Age Requirement"
                                                    value="21+ only — valid government-issued ID required at the door"
                                                    highlight
                                                />

                                                {/* ID reminder */}
                                                <InfoRow
                                                    icon="🪪"
                                                    label="Bring Your ID"
                                                    value="Driver's license, state ID, or passport. No ID = no entry. No exceptions."
                                                    highlight
                                                />

                                                {/* Entry notes */}
                                                {venue?.entryNotes && (
                                                    <InfoRow
                                                        icon="🚪"
                                                        label="Entry Instructions"
                                                        value={venue.entryNotes}
                                                    />
                                                )}

                                                {/* Arrival tip */}
                                                {venue?.arrivalTip && (
                                                    <InfoRow
                                                        icon="💡"
                                                        label="Pro Tip"
                                                        value={venue.arrivalTip}
                                                    />
                                                )}

                                                {/* Wingman */}
                                                {wingman && (
                                                    <InfoRow
                                                        icon="⚡"
                                                        label="Your Wingman"
                                                        value={`${wingman.name} (${wingman.handle})`}
                                                    />
                                                )}

                                                {/* Guest count */}
                                                {guestCount !== undefined && guestCount > 0 && (
                                                    <InfoRow
                                                        icon="👥"
                                                        label="Party Size"
                                                        value={`${guestCount} guest${guestCount !== 1 ? 's' : ''}`}
                                                    />
                                                )}

                                                {/* Guest details (if booked for someone else) */}
                                                {guestDetails?.name && (
                                                    <InfoRow
                                                        icon="🎫"
                                                        label="Booking For"
                                                        value={`${guestDetails.name}${guestDetails.email ? ` · ${guestDetails.email}` : ''}`}
                                                    />
                                                )}

                                                {/* Address */}
                                                {venue?.address && (
                                                    <InfoRow
                                                        icon="📍"
                                                        label="Address"
                                                        value={venue.address}
                                                    />
                                                )}

                                            </div>

                                            {/* Special requests */}
                                            {specialRequests && (
                                                <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded mt-2" style={{ border: '1px solid #E5E7EB' }}>
                                                    📝 Special request: {specialRequests}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Important Reminders banner ─────────────────── */}
                            <div className="rounded-xl p-3 mb-5 space-y-1.5" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">⚠️ Important Reminders</p>
                                <p className="text-xs text-red-800 leading-relaxed">• <strong>Bring a valid government-issued photo ID.</strong> 21+ entry only. No ID = denied entry.</p>
                                <p className="text-xs text-red-800 leading-relaxed">• Dress code is strictly enforced at the door. Review your dress code above.</p>
                                <p className="text-xs text-red-800 leading-relaxed">• Arrive within your arrival window. Late arrivals may not be accommodated.</p>
                                <p className="text-xs text-gray-500 leading-relaxed mt-2">You are purchasing access to a hosted Wingman Experience. Bottles, drinks, and food are purchased separately at the venue.</p>
                            </div>

                            {/* Totals */}
                            <div className="border-t-2 border-black pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Method</span>
                                    <span className="font-medium">{paymentMethodLabel}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className={`font-mono ${isFree ? 'text-green-600 font-bold' : ''}`}>{displayTotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Fees</span>
                                    <span className="font-mono">{isTokenPayment ? '0 TMKC' : '$0.00'}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t border-gray-200">
                                    <span>Total</span>
                                    <span className={isFree ? 'text-green-600' : ''}>{displayTotal}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Save This Receipt + Legal Notice ───────────── */}
                        <div className="px-5 pb-5">
                            {/* Save-receipt callout */}
                            <div
                                className="rounded-xl p-4 mb-4 flex items-start gap-3"
                                style={{
                                    background: 'linear-gradient(135deg, #FFF7ED, #FFFBF5)',
                                    border: '1.5px solid #FED7AA',
                                }}
                            >
                                <span className="text-2xl flex-shrink-0 mt-0.5">📸</span>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-orange-600 mb-1">Save This Receipt</p>
                                    <p className="text-xs text-orange-900 leading-relaxed">
                                        Please <strong>screenshot or save this receipt</strong> as proof of your purchase. You may be asked to present it when checking in for your Wingman experience.
                                    </p>
                                </div>
                            </div>

                            {/* Legal / what-you-purchased notice */}
                            <div
                                className="rounded-xl p-4 space-y-3"
                                style={{
                                    background: '#F8F9FA',
                                    border: '1px solid #E5E7EB',
                                }}
                            >
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                    <span>ℹ️</span> Important Information
                                </p>

                                {/* What you purchased */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">What You Purchased</p>
                                    <p className="text-xs text-gray-700 leading-relaxed">
                                        Your payment confirms the purchase of <strong>access to a curated Wingman experience</strong>. Wingman sells and organizes exclusive social and hospitality experiences, providing access to attend with a Wingman host and, where applicable, other participants.
                                    </p>
                                </div>

                                {/* Divider */}
                                <div style={{ height: 1, background: '#E5E7EB' }} />

                                {/* Not included */}
                                <div
                                    className="rounded-lg p-3"
                                    style={{ background: '#FFF1F2', border: '1px solid #FECDD3' }}
                                >
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1.5">⚠️ Not Included</p>
                                    <p className="text-xs text-red-900 leading-relaxed">
                                        This purchase <strong>does not include bottles, alcohol, food, beverages, table minimums, gratuities, or any additional venue charges</strong>, unless explicitly stated in the booking details.
                                    </p>
                                </div>

                                {/* Guest responsibility */}
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Any optional purchases made during the experience—including bottle service, drinks, meals, upgrades, or other personal expenses—are <strong>the sole responsibility of the guest</strong> and must be paid directly to the venue.
                                </p>

                                <p className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-200 pt-3">
                                    Keep this receipt for your records and bring it with you on the day of your experience.
                                </p>
                            </div>
                        </div>

                        {/* QR footer */}
                        <div className="p-4 border-t border-gray-200 text-center" style={{ background: '#F9FAFB' }}>
                            <p className="text-xs text-gray-400 font-mono mb-3">Booking ID: {transactionId}</p>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${transactionId}&bgcolor=F9FAFB&color=000000&qzone=0`}
                                alt="Booking QR Code"
                                className="w-28 h-28 mx-auto mix-blend-multiply opacity-80"
                            />
                            <p className="text-[10px] text-gray-400 mt-2">Show this QR at the door with your ID</p>
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="mt-8 flex flex-col gap-3">
                        <button
                            onClick={() => onNavigate('bookings')}
                            className="bg-white text-black font-bold py-3.5 px-6 rounded-xl hover:bg-gray-100 transition-colors w-full text-sm"
                        >
                            📋 View All Bookings
                        </button>
                        <button
                            onClick={() => onStartChat ? onStartChat(items[0]) : onNavigate('eventChatsList')}
                            className="bg-gray-800 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-gray-700 transition-colors w-full text-sm"
                        >
                            💬 Access Event Chat
                        </button>
                        <button
                            onClick={() => onNavigate('home')}
                            className="text-gray-500 text-sm font-semibold py-2 hover:text-gray-300 transition-colors text-center"
                        >
                            Back to Home
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
