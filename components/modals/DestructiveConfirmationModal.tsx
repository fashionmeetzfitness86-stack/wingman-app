import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ExclamationCircleIcon } from '../icons/ExclamationCircleIcon';

interface DestructiveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: string;
  itemName: string;
  title?: string;
  message?: string;
  confirmText?: string;
}

export const DestructiveConfirmationModal: React.FC<DestructiveConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemType, itemName, title, message, confirmText }) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  
  // A simple check to see if we should ask the user to type the name.
  // We'll require it if the message includes the phrase "please type".
  const requiresTyping = message?.toLowerCase().includes('please type');

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
    }
  }, [isOpen]);

  const isConfirmed = !requiresTyping || confirmationInput === itemName;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };
  
  const modalTitle = title || `Delete ${itemType}`;
  const modalMessage = message || `Are you sure you want to permanently delete ${itemName}? This action cannot be undone.`;
  const confirmButtonText = confirmText || `Delete ${itemType}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mt-4 text-xl font-bold">{modalTitle}</h3>
            <p className="mt-2 text-[var(--color-text-muted)]">
                {modalMessage}
            </p>
            {requiresTyping && (
                <div className="mt-6 text-left">
                    <label htmlFor="confirmation-input" className="block text-sm font-medium text-[var(--color-text-muted)]">
                        To confirm, type "<span className="font-bold text-[var(--color-foreground)]">{itemName}</span>" in the box below
                    </label>
                    <Input
                        id="confirmation-input"
                        value={confirmationInput}
                        onChange={(e) => setConfirmationInput(e.target.value)}
                        className="mt-1"
                        autoComplete="off"
                    />
                </div>
            )}
        </div>
        <div className="mt-6 flex gap-4">
            <Button variant="secondary" onClick={onClose} className="w-full">
                Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirm} disabled={!isConfirmed} className="w-full">
                {confirmButtonText}
            </Button>
        </div>
    </Modal>
  );
};