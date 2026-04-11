
import React, { useState } from 'react';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { Page, PaymentMethod } from '../types';
import { AddPaymentMethodModal } from './modals/AddPaymentMethodModal';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { DestructiveConfirmationModal } from './modals/DestructiveConfirmationModal';
import { TokenIcon } from './icons/TokenIcon';

interface PaymentMethodsPageProps {
  onNavigate: (page: Page) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  paymentMethods?: PaymentMethod[];
  onUpdateMethods: (methods: PaymentMethod[]) => void;
}

const ThreeDotsIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
    </svg>
);

const getCardBrandColor = (type?: string) => {
    if (!type) return 'bg-gray-800 border-gray-700';
    const t = type.toLowerCase();
    if (t.includes('visa')) return 'bg-blue-900/40 border-blue-500/30';
    if (t.includes('mastercard')) return 'bg-orange-900/40 border-orange-500/30';
    if (t.includes('amex') || t.includes('american')) return 'bg-cyan-900/40 border-cyan-500/30';
    if (t.includes('discover')) return 'bg-yellow-900/40 border-yellow-500/30';
    return 'bg-gray-800 border-gray-700';
};

export const PaymentMethodsPage: React.FC<PaymentMethodsPageProps> = ({ onNavigate, showToast, paymentMethods = [], onUpdateMethods }) => {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | undefined>(undefined);
    const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

    const handleSetDefault = (id: string) => {
        const newMethods = paymentMethods.map(m => ({
            ...m,
            isDefault: m.id === id
        }));
        onUpdateMethods(newMethods);
        setActiveMenuId(null);
        showToast("Default payment method updated", "success");
    };

    const handleRemoveClick = (method: PaymentMethod) => {
        setMethodToDelete(method);
        setActiveMenuId(null);
    };

    const confirmRemove = () => {
        if (methodToDelete) {
            const newMethods = paymentMethods.filter(m => m.id !== methodToDelete.id);
            onUpdateMethods(newMethods);
            showToast("Payment method removed", "success");
            setMethodToDelete(null);
        }
    };

    const handleEdit = (method: PaymentMethod) => {
        setEditingMethod(method);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleOpenAdd = () => {
        setEditingMethod(undefined);
        setIsModalOpen(true);
    };

    const handleSaveMethod = (methodData: PaymentMethod) => {
        if (editingMethod) {
            // Update existing
            const newMethods = paymentMethods.map(m => m.id === methodData.id ? methodData : m);
            onUpdateMethods(newMethods);
            showToast("Payment method updated", "success");
        } else {
            // Add new
            // If it's the first method, make it default
            const isFirst = paymentMethods.length === 0;
            const newMethod = { ...methodData, isDefault: isFirst || methodData.isDefault };
            
            const newMethods = [...paymentMethods, newMethod];
            onUpdateMethods(newMethods);
            showToast("New payment method added", "success");
        }
    };

    const cards = paymentMethods.filter(m => m.category === 'cards');
    const otherMethods = paymentMethods.filter(m => m.category === 'other');

    return (
        <div className="p-4 md:p-6 animate-fade-in text-white pb-24">
             <button 
                onClick={() => onNavigate('settings')} 
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold"
            >
                <ChevronLeftIcon className="w-5 h-5"/>
                Back to Settings
            </button>
            
            <h1 className="text-3xl font-bold mb-8">Manage Payment Methods</h1>

            <div className="space-y-8">
                <div>
                    <h2 className="text-lg font-semibold text-white/80 mb-4 uppercase tracking-wider text-xs">Credit & Debit Cards</h2>
                    <div className="space-y-3">
                        {cards.map((card) => (
                            <div key={card.id} className={`p-4 rounded-xl flex items-center gap-4 border transition-all duration-300 ${getCardBrandColor(card.type)} ${card.isDefault ? 'ring-2 ring-[#EC4899] ring-offset-2 ring-offset-[#121212]' : ''}`}>
                                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-md">
                                    <CreditCardIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-bold text-white text-lg tracking-wide">{card.type}</p>
                                        <p className="text-white/60 font-mono">•••• {card.last4}</p>
                                        {card.isDefault && <span className="text-[10px] bg-[#EC4899] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shadow-sm">Default</span>}
                                    </div>
                                    <div className="flex gap-4 text-sm text-white/50">
                                        <p>Exp: {card.expiry}</p>
                                        {card.cardholderName && <p>{card.cardholderName}</p>}
                                    </div>
                                </div>
                                <div className="relative">
                                    <button onClick={() => setActiveMenuId(activeMenuId === card.id ? null : card.id)} className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                                        <ThreeDotsIcon />
                                    </button>
                                    
                                    {activeMenuId === card.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                            <div className="absolute right-0 mt-2 w-48 bg-[#1C1C1E] rounded-xl shadow-2xl z-20 border border-gray-700 overflow-hidden animate-fade-in-down">
                                                {!card.isDefault && (
                                                    <button onClick={() => handleSetDefault(card.id)} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors border-b border-gray-800">
                                                        <CheckCircleIcon className="w-4 h-4" /> Set as Default
                                                    </button>
                                                )}
                                                <button onClick={() => handleEdit(card)} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors border-b border-gray-800">
                                                    <PencilIcon className="w-4 h-4" /> Edit
                                                </button>
                                                <button onClick={() => handleRemoveClick(card)} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                                                    <TrashIcon className="w-4 h-4" /> Remove
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {cards.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-gray-800 rounded-xl">
                                <p className="text-gray-500 mb-4">No cards added yet.</p>
                                <button onClick={handleOpenAdd} className="text-amber-400 font-bold text-sm hover:underline">Add your first card</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Other Methods Section (PayPal, Crypto) */}
                <div>
                    <h2 className="text-lg font-semibold text-white/80 mb-4 uppercase tracking-wider text-xs">Other Methods</h2>
                    <div className="space-y-3">
                            {otherMethods.map((method) => (
                            <div key={method.id} className={`bg-gray-900 p-4 rounded-xl flex items-center gap-4 border border-gray-800 ${method.isDefault ? 'ring-2 ring-[#EC4899] ring-offset-2 ring-offset-[#121212]' : ''}`}>
                                <div className="bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden border border-gray-700 text-white">
                                    {method.type === 'Crypto Wallet' ? 
                                        <TokenIcon className="w-6 h-6 text-amber-400" /> :
                                        <span className="font-bold text-xl text-blue-500 italic">P</span>
                                    }
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-white">{method.type}</p>
                                        {method.isDefault && <span className="text-[10px] bg-[#EC4899] text-white px-2 py-0.5 rounded-full font-bold uppercase">Default</span>}
                                    </div>
                                    {method.detail && (
                                        <p className="text-sm text-gray-400 truncate max-w-[200px]">{method.detail}</p>
                                    )}
                                    {method.cardholderName && method.type === 'Crypto Wallet' && (
                                         <p className="text-xs text-gray-500">{method.cardholderName}</p>
                                    )}
                                </div>
                                <div className="relative">
                                    <button onClick={() => setActiveMenuId(activeMenuId === method.id ? null : method.id)} className="text-gray-500 hover:text-white p-2">
                                        <ThreeDotsIcon />
                                    </button>
                                        {activeMenuId === method.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                            <div className="absolute right-0 mt-2 w-48 bg-[#1C1C1E] rounded-xl shadow-2xl z-20 border border-gray-700 overflow-hidden animate-fade-in-down">
                                                {!method.isDefault && (
                                                    <button onClick={() => handleSetDefault(method.id)} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors border-b border-gray-800">
                                                        <CheckCircleIcon className="w-4 h-4" /> Set as Default
                                                    </button>
                                                )}
                                                <button onClick={() => handleEdit(method)} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors border-b border-gray-800">
                                                    <PencilIcon className="w-4 h-4" /> Edit
                                                </button>
                                                <button onClick={() => handleRemoveClick(method)} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                                                    <TrashIcon className="w-4 h-4" /> Remove
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                         {otherMethods.length === 0 && (
                             <p className="text-gray-500 text-sm italic">No other payment methods added.</p>
                         )}
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-gray-800 p-4 z-10">
                <div className="container mx-auto max-w-5xl">
                    <button 
                        onClick={handleOpenAdd}
                        className="w-full bg-[#EC4899] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-[1.02] shadow-lg shadow-pink-900/20"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        Add Payment Method
                    </button>
                </div>
            </div>

            <AddPaymentMethodModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveMethod} 
                initialMethod={editingMethod}
            />

            <DestructiveConfirmationModal
                isOpen={!!methodToDelete}
                onClose={() => setMethodToDelete(null)}
                onConfirm={confirmRemove}
                itemType="Payment Method"
                itemName={methodToDelete ? (methodToDelete.last4 ? `${methodToDelete.type} ending in ${methodToDelete.last4}` : methodToDelete.type) : 'Payment Method'}
                title="Remove Payment Method"
                message="Are you sure you want to remove this payment method? This action cannot be undone."
                confirmText="Remove"
            />
        </div>
    );
};
