
import React from 'react';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { StarIcon } from '../icons/StarIcon';
import { ClockIcon } from '../icons/ClockIcon';

interface GuestlistJoinSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPlans: () => void;
  venueName: string;
  date: string;
  isVip?: boolean;
}

export const GuestlistJoinSuccessModal: React.FC<GuestlistJoinSuccessModalProps> = ({ isOpen, onClose, onNavigateToPlans, venueName, date, isVip }) => {
  if (!isOpen) return null;

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`bg-[#121212] border ${isVip ? 'border-amber-400' : 'border-gray-800'} rounded-xl shadow-2xl w-full max-w-sm m-4 p-8 text-center relative overflow-hidden`} onClick={e => e.stopPropagation()}>
        {isVip && <div className="absolute inset-0 bg-amber-400/5 pointer-events-none"></div>}
        
        {isVip ? (
             <StarIcon className="w-20 h-20 text-amber-400 mx-auto mb-4 fill-current" />
        ) : (
             <ClockIcon className="w-20 h-20 text-blue-500 mx-auto mb-4" />
        )}
        
        <h2 className={`text-3xl font-bold mb-2 ${isVip ? 'text-amber-400' : 'text-white'}`}>{isVip ? 'VIP Access Confirmed!' : "Request Received"}</h2>
        
        <p className="text-gray-400">
          {isVip ? (
              <>Your guestlist spot for <span className="font-semibold text-white">{venueName}</span> on <span className="font-semibold text-white">{formattedDate}</span> is confirmed.</>
          ) : (
              <>Your request to join the guestlist for <span className="font-semibold text-white">{venueName}</span> on <span className="font-semibold text-white">{formattedDate}</span> has been sent.</>
          )}
        </p>
        
        {isVip && (
            <p className="text-amber-200/80 text-sm mt-4 font-semibold">
                You have bypassed standard entry. Please proceed to the VIP line.
            </p>
        )}
        
        {!isVip && (
             <p className="text-gray-500 text-sm mt-4">
                You will receive a notification once the promoter reviews your request.
            </p>
        )}

        <div className="mt-8 flex flex-col gap-3 relative z-10">
          <button
            onClick={onNavigateToPlans}
            className={`w-full font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105 ${isVip ? 'bg-amber-400 text-black hover:bg-amber-300' : 'bg-[#EC4899] text-white'}`}
          >
            View in My Plans
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
