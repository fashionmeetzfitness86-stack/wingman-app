import React, { useState } from 'react';
import { GiftIcon } from './icons/GiftIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { CheckIcon } from './icons/CheckIcon';

export const ReferFriendPage: React.FC = () => {
  const referralCode = 'TMKPRO2024';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 flex flex-col items-center text-center animate-fade-in">
      <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mb-8 mt-4">
        <GiftIcon className="w-12 h-12 text-black" />
      </div>
      <h1 className="text-4xl font-bold text-white">Invite Friends, Earn Rewards</h1>
      <p className="text-gray-400 mt-4 max-w-sm mx-auto">
        Share your code with friends. They get a discount, and you get 500 TMKC points after their first booking.
      </p>

      <div className="w-full max-w-sm mx-auto mt-10">
        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider block mb-2">Your Referral Code</label>
        <div className="relative">
          <input
            type="text"
            readOnly
            value={referralCode}
            className="w-full bg-gray-900 border-2 border-gray-700 text-white text-center text-lg font-mono tracking-widest rounded-lg p-4 pr-12"
          />
          <button
            onClick={handleCopy}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white"
            aria-label="Copy referral code"
          >
            {copied ? <CheckIcon className="w-6 h-6 text-green-500" /> : <DocumentDuplicateIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="w-full max-w-sm mx-auto space-y-4 mt-8">
        <button className="w-full bg-amber-400 text-black font-bold py-4 px-4 rounded-xl transition-transform duration-200 hover:scale-105">
          Share Code
        </button>
        <button className="w-full bg-gray-800 text-white font-bold py-4 px-4 rounded-xl transition-colors hover:bg-gray-700">
          Invite via Link
        </button>
      </div>
       <p className="text-gray-600 text-xs mt-8">
            Terms and conditions apply.
        </p>
    </div>
  );
};