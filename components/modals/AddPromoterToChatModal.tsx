
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Promoter } from '../../types';
import { StarIcon } from '../icons/StarIcon';

interface AddPromoterToChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoters: Promoter[];
  onAdd: (promoterId: number) => void;
}

export const AddPromoterToChatModal: React.FC<AddPromoterToChatModalProps> = ({ isOpen, onClose, promoters, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPromoters = promoters.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Promoter to Chat">
        <div className="space-y-4">
            <input 
                type="search"
                placeholder="Search promoters by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]"
                autoFocus
            />
            
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {filteredPromoters.map(promoter => (
                    <button 
                        key={promoter.id}
                        onClick={() => onAdd(promoter.id)}
                        className="w-full flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                    >
                        <img src={promoter.profilePhoto} alt={promoter.name} className="w-12 h-12 rounded-full object-cover border border-gray-700 group-hover:border-[#EC4899]" />
                        <div className="flex-grow">
                            <p className="font-bold text-white">{promoter.name}</p>
                            <p className="text-xs text-gray-400">{promoter.handle}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-gray-800">
                            <StarIcon className="w-3 h-3 text-amber-400" />
                            <span className="text-xs font-bold text-white">{promoter.rating.toFixed(1)}</span>
                        </div>
                    </button>
                ))}
                {filteredPromoters.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No promoters found matching "{searchTerm}".</p>
                )}
            </div>
        </div>
    </Modal>
  );
};
