
import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger' }) => {
  if (!isOpen) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="text-center p-4">
            <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
            <p className="text-gray-400 text-sm mb-8">{message}</p>

            <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose} className="w-full">
                    Cancel
                </Button>
                <Button variant={confirmVariant} onClick={onConfirm} className="w-full">
                    {confirmText}
                </Button>
            </div>
        </div>
    </Modal>
  );
};
