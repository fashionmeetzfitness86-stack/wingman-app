
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Wingman } from '../../types';
import { StarIcon } from '../icons/StarIcon';

interface AddWingmanToChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  wingmen: Wingman[];
  onAdd: (wingmanId: number) => void;
}

export const AddWingmanToChatModal: React.FC<AddWingmanToChatModalProps> = ({ isOpen, onClose, wingmen, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWingmen = wingmen.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Wingman to Chat">
        <div className="space-y-4">
            <input 
                type="search"
                placeholder="Search wingmen by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#FFFFFF] focus:border-[#FFFFFF]"
                autoFocus
            />
            
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {filteredWingmen.map(wingman => (
                    <button 
                        key={wingman.id}
                        onClick={() => onAdd(wingman.id)}
                        className="w-full flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                    >
                        <img src={wingman.profilePhoto} alt={wingman.name} className="w-12 h-12 rounded-full object-cover border border-gray-700 group-hover:border-[#FFFFFF]" />
                        <div className="flex-grow">
                            <p className="font-bold text-white">{wingman.name}</p>
                            <p className="text-xs text-gray-400">{wingman.handle}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-gray-800">
                            <StarIcon className="w-3 h-3 text-amber-400" />
                            <span className="text-xs font-bold text-white">{wingman.rating.toFixed(1)}</span>
                        </div>
                    </button>
                ))}
                {filteredWingmen.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No wingmen found matching "{searchTerm}".</p>
                )}
            </div>
        </div>
    </Modal>
  );
};
