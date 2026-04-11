
import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { HeartIcon } from '../icons/HeartIcon';

interface FavoriteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  entityType?: 'Promoter' | 'Venue' | 'Event';
  action: 'add' | 'remove';
}

export const FavoriteConfirmationModal: React.FC<FavoriteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  entityName, 
  entityType = 'Promoter',
  action 
}) => {
  if (!isOpen) return null;

  const isRemove = action === 'remove';
  const title = isRemove ? `Unfavorite ${entityType}?` : `Favorite ${entityType}?`;
  const message = isRemove 
    ? `Are you sure you want to remove ${entityName} from your favorites?`
    : `Are you sure you want to add ${entityName} to your favorites?`;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-gray-700">
            <HeartIcon className={`w-8 h-8 ${isRemove ? 'text-gray-400' : 'text-[#EC4899]'}`} isFilled={!isRemove} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-[var(--color-text-muted)] mb-8">{message}</p>
        
        <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="w-full">Cancel</Button>
            <Button variant={isRemove ? 'danger' : 'primary'} onClick={onConfirm} className="w-full">
                {isRemove ? 'Yes, Remove' : 'Add Favorite'}
            </Button>
        </div>
      </div>
    </Modal>
  );
};
