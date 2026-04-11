import React from 'react';
import { User } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';

interface EventParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: User[];
}

export const EventParticipantsModal: React.FC<EventParticipantsModalProps> = ({ isOpen, onClose, participants }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-sm m-4 flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Participants ({participants.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="space-y-3">
            {participants.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-lg">
                <img src={p.profilePhoto} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                <p className="font-semibold text-white">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
