
import React from 'react';
import { Page, CartItem } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface BookingConfirmedPageProps {
    items?: CartItem[];
    onNavigate: (page: Page, params?: Record<string, any>) => void;
    onStartChat?: (item: any) => void;
}

export const BookingConfirmedPage: React.FC<BookingConfirmedPageProps> = ({ items = [], onNavigate }) => {
    
    const totalAmount = items.reduce((acc, item) => {
        const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
        return acc + (price || 0);
    }, 0);

    const getTransactionId = () => {
        if (items.length > 0 && items[0].id) {
            const parts = items[0].id.split('-');
            if (parts.length > 1) {
                return parts[1];
            }
            return items[0].id;
        }
        return Date.now().toString().slice(-8);
    };

    const transactionId = getTransactionId();
    const transactionDate = new Date().toLocaleString();
    
    const paymentMethod = items.length > 0 && items[0].paymentMethod ? items[0].paymentMethod : 'usd';
    const isTokenPayment = paymentMethod === 'tokens';
    const USD_TO_TMKC_RATE = 100;
    
    const displayTotal = isTokenPayment 
        ? `${(totalAmount * USD_TO_TMKC_RATE).toLocaleString()} TMKC` 
        : `$${totalAmount.toFixed(2)}`;

    const paymentMethodLabel = {
        tokens: 'TMKC Tokens',
        usd: 'Credit/Debit Card',
        cashapp: 'Cash App'
    }[paymentMethod] || 'Credit/Debit Card';

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-black text-white flex flex-col animate-fade-in">
             <div className="p-4">
                <button 
                    onClick={() => onNavigate('home')} 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold"
                >
                    <ChevronLeftIcon className="w-5 h-5"/>
                    Back to Home
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4 pb-24">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-4 border border-green-500/20">
                            <CheckCircleIcon className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Payment Successful</h1>
                        <p className="text-gray-400 mt-2">Your booking is confirmed. Enjoy your night!</p>
                    </div>

                    {/* Receipt Card */}
                    <div className="bg-white text-black rounded-lg shadow-2xl overflow-hidden relative">
                        <div className="bg-gray-100 p-4 border-b border-gray-200 text-center">
                            <h2 className="font-bold text-lg tracking-widest uppercase text-gray-600">Receipt</h2>
                            <p className="text-xs text-gray-500 font-mono">{transactionDate}</p>
                        </div>
                        
                        <div className="p-6 bg-white">
                            <div className="space-y-4 mb-6">
                                {items.map((item, idx) => {
                                    const itemPrice = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                                    const itemDisplayPrice = isTokenPayment 
                                        ? `${((itemPrice || 0) * USD_TO_TMKC_RATE).toLocaleString()} TMKC`
                                        : `$${(itemPrice || 0).toFixed(2)}`;
                                    
                                    // Helper to safely get subtitle
                                    let subtitle = '';
                                    if (item.type === 'table') subtitle = item.tableDetails?.tableOption?.name || 'Table Reservation';
                                    else if (item.type === 'event') subtitle = 'Event Ticket';
                                    else if (item.type === 'experience') subtitle = 'Experience Booking';
                                    else if (item.type === 'guestlist') subtitle = 'Guestlist Entry';
                                    else if (item.type === 'storeItem') subtitle = item.storeItemDetails?.item.category || 'Store Item';

                                    const specialRequests = item.tableDetails?.specialRequests;

                                    return (
                                        <div key={idx} className="border-b border-dashed border-gray-200 pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="text-left">
                                                    <p className="font-bold text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.date || item.sortableDate || 'No Date'}</p>
                                                    <p className="text-xs text-gray-500">{subtitle}</p>
                                                    {item.paymentOption === 'deposit' && <span className="text-[10px] font-bold uppercase bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">Deposit</span>}
                                                </div>
                                                <p className="font-mono font-semibold text-sm">
                                                    {itemDisplayPrice}
                                                </p>
                                            </div>
                                            {specialRequests && (
                                                <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded mt-1">
                                                    "Request: {specialRequests}"
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t-2 border-black pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Method</span>
                                    <span className="font-medium">{paymentMethodLabel}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-mono">{displayTotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Fees</span>
                                    <span className="font-mono">{isTokenPayment ? '0 TMKC' : '$0.00'}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t border-gray-200">
                                    <span>Total</span>
                                    <span>{displayTotal}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-5 p-4 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-400 font-mono mb-1">Transaction ID: {transactionId}</p>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${transactionId}&bgcolor=F9FAFB&color=000000&qzone=0`} 
                                alt="Transaction QR" 
                                className="w-24 h-24 mx-auto mix-blend-multiply opacity-80" 
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4 justify-center">
                        <button 
                            onClick={() => onNavigate('bookings')}
                            className="bg-gray-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors w-full"
                        >
                            View All Bookings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
