
import React from 'react';
import { Modal } from '../ui/Modal';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { CartIcon } from '../icons/CartIcon';
import { BookTableIcon } from '../icons/BookTableIcon';

interface AddedToPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName: string;
  onCheckout: () => void;
  onKeepBooking: () => void;
  keepBookingLabel?: string;
}

export const AddedToPlansModal: React.FC<AddedToPlansModalProps> = ({ isOpen, onClose, venueName, onCheckout, onKeepBooking, keepBookingLabel }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <div className="text-center p-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">Added to Plans!</h3>
        <p className="text-gray-400 mb-8">
            Your booking for <span className="text-white font-semibold">{venueName}</span> has been secured in your cart.
        </p>

        <div className="flex flex-col gap-3">
             <button 
                onClick={onCheckout}
                className="w-full bg-[#EC4899] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#d8428a] transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20"
            >
                <CartIcon className="w-5 h-5" />
                Go to My Plans
            </button>

            <button 
                onClick={onKeepBooking}
                className="w-full bg-gray-800 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 border border-gray-700"
            >
                <BookTableIcon className="w-5 h-5" />
                {keepBookingLabel || "Keep Booking"}
            </button>
        </div>
      </div>
    </Modal>
  );
};
