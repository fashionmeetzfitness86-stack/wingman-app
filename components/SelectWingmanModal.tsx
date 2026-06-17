
import React, { useMemo } from 'react';
import { Venue, Wingman } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { StarIcon } from './icons/StarIcon';

interface SelectWingmanModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: Venue | null;
  onSelectWingman: (wingman: Wingman) => void;
  wingmen: Wingman[];
}

export const SelectWingmanModal: React.FC<SelectWingmanModalProps> = ({ isOpen, onClose, venue, onSelectWingman, wingmen }) => {

  const availableWingmen = useMemo(() => {
    if (!venue) return [];
    return wingmen.filter(p => p.assignedVenueIds.includes(venue.id));
  }, [venue, wingmen]);

  if (!isOpen || !venue) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="select-wingman-title"
      onClick={onClose}
    >
      <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 id="select-wingman-title" className="text-xl font-bold text-white">Book at {venue.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-grow overflow-y-auto space-y-4">

          {/* Wingmen list — only shown if any are assigned */}
          {availableWingmen.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Book with a Wingman</p>
              {availableWingmen.map(wingman => (
                <button
                  key={wingman.id}
                  onClick={() => onSelectWingman(wingman)}
                  className="w-full flex items-center gap-4 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-left cursor-pointer focus:ring-2 focus:ring-white focus:outline-none"
                  aria-label={`Select wingman ${wingman.name}`}
                >
                  <img src={wingman.profilePhoto} alt={wingman.name} className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-grow">
                    <p className="font-bold text-white">{wingman.name}</p>
                    <p className="text-sm text-gray-400">{wingman.handle}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-full">
                    <StarIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-white font-semibold text-sm">{wingman.rating.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Book with a Wingman */}
          {availableWingmen.length > 0 && (
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Or</p>
          )}
          <button
            onClick={() => {
              const selected = availableWingmen.length > 0 ? availableWingmen[0] : wingmen[0];
              if (selected) {
                onSelectWingman(selected);
              }
            }}
            disabled={availableWingmen.length === 0 && wingmen.length === 0}
            className="w-full font-bold py-3.5 px-6 rounded-xl transition-all hover:opacity-90 focus:ring-2 focus:ring-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', color: '#fff', boxShadow: '0 6px 20px rgba(224,64,251,0.3)' }}
          >
            Book with a Wingman
          </button>

        </div>
      </div>
    </div>
  );
};
