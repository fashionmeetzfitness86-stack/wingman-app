import React, { useState } from 'react';
import { StoreItem } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { TokenIcon } from './icons/TokenIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';

interface PurchaseConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: 'tokens' | 'usd') => void;
    item: StoreItem;
    userTokenBalance: number;
}

export const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({ isOpen, onClose, onConfirm, item, userTokenBalance }) => {
    const [paymentMethod, setPaymentMethod] = useState<'tokens' | 'usd'>('tokens');
    
    if (!isOpen) return null;

    const hasEnoughTokens = userTokenBalance >= item.price;
    
    // Default to USD if user can't afford with tokens
    if (!hasEnoughTokens && paymentMethod === 'tokens') {
        setPaymentMethod('usd');
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="confirmation-modal-title"
            onClick={onClose}
        >
            <div 
                className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <h2 id="confirmation-modal-title" className="text-2xl font-bold text-white mb-4">Confirm Purchase</h2>
                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-lg mx-auto mb-4" />
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                </div>
                
                <div className="px-6 pb-6 space-y-3">
                     <button 
                        onClick={() => setPaymentMethod('tokens')} 
                        disabled={!hasEnoughTokens}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${paymentMethod === 'tokens' ? 'bg-amber-400/10 border-amber-400' : 'bg-gray-800 border-gray-800 hover:border-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-800`}
                    >
                        <TokenIcon className="w-6 h-6 text-amber-400 flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-bold text-white">Pay with Tokens</p>
                            <p className={`text-sm ${hasEnoughTokens ? 'text-gray-400' : 'text-red-400'}`}>Balance: {userTokenBalance.toLocaleString()}</p>
                        </div>
                        <p className="font-semibold text-white">{item.price.toLocaleString()}</p>
                    </button>
                    <button 
                        onClick={() => setPaymentMethod('usd')}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${paymentMethod === 'usd' ? 'bg-amber-400/10 border-amber-400' : 'bg-gray-800 border-gray-800 hover:border-gray-600'}`}
                    >
                        <CreditCardIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-bold text-white">Pay with Card</p>
                            <p className="text-sm text-gray-400">Visa •••• 4567</p>
                        </div>
                        <p className="font-semibold text-white">${item.priceUSD.toFixed(2)}</p>
                    </button>
                </div>

                <div className="p-4 border-t border-gray-800 flex gap-4">
                    <button onClick={onClose} className="w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500" aria-label="Cancel purchase">
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(paymentMethod)} className="w-full bg-amber-400 text-black font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-300" aria-label={`Confirm purchase of ${item.title}`}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};