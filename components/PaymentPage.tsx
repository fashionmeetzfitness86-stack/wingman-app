import React, { useState } from 'react';

interface PaymentPageProps {
  onConfirmPayment: () => void;
}

const paymentOptions = ['Stripe', 'PayPal', 'TMKC Token', 'NFT Pass'];

export const PaymentPage: React.FC<PaymentPageProps> = ({ onConfirmPayment }) => {
  const [selectedMethod, setSelectedMethod] = useState('Stripe');

  return (
    <div className="p-4 md:p-6 animate-fade-in text-white min-h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex-grow">
        <h2 className="text-lg font-semibold text-white mb-4">Payment Method</h2>
        <div className="space-y-3">
          {paymentOptions.map(option => (
            <div
              key={option}
              onClick={() => setSelectedMethod(option)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer flex justify-between items-center ${
                selectedMethod === option
                  ? 'bg-amber-400/10 border-amber-400'
                  : 'bg-gray-900 border-gray-700 hover:border-gray-500'
              }`}
            >
              <label htmlFor={option} className="font-bold text-white">{option}</label>
              <div className="w-6 h-6 rounded-full border-2 border-gray-500 flex items-center justify-center">
                {selectedMethod === option && (
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={onConfirmPayment}
          className="w-full bg-amber-400 text-black font-bold py-4 px-4 rounded-xl transition-transform duration-200 hover:scale-105"
        >
          Confirm Payment
        </button>
      </div>
    </div>
  );
};
