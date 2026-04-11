import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { CartItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onNavigateToCheckout: () => void;
  totalPrice: number;
}

export const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose, cartItems, onRemoveItem, onNavigateToCheckout, totalPrice }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="absolute top-0 right-0 h-full w-96 max-w-[90vw] bg-gray-900 border-l border-gray-700 shadow-2xl animate-slide-in-right flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-800 flex-shrink-0">
          <h3 className="font-bold text-white text-xl">My Plans</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white" aria-label="Close cart">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        {cartItems.length > 0 ? (
          <>
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="bg-gray-800 p-3 rounded-lg flex flex-col gap-2">
                    <div className="flex gap-3">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                        <div className="flex-grow">
                            <p className="font-semibold text-white text-sm">{item.name}</p>
                            {item.date && <p className="text-xs text-gray-400">{item.date}</p>}
                            <p className="text-xs text-gray-400 mt-1">
                                {item.paymentOption === 'full' ? `$${item.fullPrice?.toFixed(2)}` : `$${item.depositPrice?.toFixed(2)} Deposit`}
                            </p>
                        </div>
                        <button onClick={() => onRemoveItem(item.id)} className="text-gray-500 hover:text-red-500 self-start">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {item.tableDetails && (
                        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
                            <p>Table: {item.tableDetails.tableOption?.name}</p>
                            <p>Guests: {item.tableDetails.numberOfGuests}</p>
                            {item.tableDetails.selectedBottles && item.tableDetails.selectedBottles.length > 0 && (
                                <p>Bottles: {item.tableDetails.selectedBottles.map(b => `${b.quantity}x ${b.name}`).join(', ')}</p>
                            )}
                        </div>
                    )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-800 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-300 font-semibold">Total</p>
                    <p className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}</p>
                </div>
                <button 
                    onClick={onNavigateToCheckout}
                    className="w-full bg-[#EC4899] text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 hover:scale-105"
                >
                    Proceed to Checkout
                </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
            <p className="text-gray-400">Your cart is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};
