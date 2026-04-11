import React, { useState } from 'react';
import { User } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ExclamationCircleIcon } from '../icons/ExclamationCircleIcon';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentUser: User;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm, currentUser }) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [step, setStep] = useState(1);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  const reset = () => {
    setStep(1);
    setConfirmationInput('');
  };
  
  const handleClose = () => {
    reset();
    onClose();
  };

  const isConfirmationMatch = confirmationInput === currentUser.name;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Delete Account">
      {step === 1 && (
        <>
            <div className="text-center">
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="mt-4 text-xl font-bold">Are you sure?</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    This action is permanent and cannot be undone. You will lose all your data, including booking history, favorites, and TMKC tokens.
                </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
                 <Button variant="danger" onClick={() => setStep(2)} className="w-full">
                    Yes, I want to delete my account
                </Button>
                <Button variant="secondary" onClick={handleClose} className="w-full">
                    Cancel
                </Button>
            </div>
        </>
      )}

      {step === 2 && (
        <>
           <h3 className="text-xl font-bold">Final Confirmation</h3>
            <p className="text-[var(--color-text-muted)] mt-2 mb-4">
                To confirm permanent deletion, please type your full name: <span className="font-bold text-[var(--color-foreground)]">{currentUser.name}</span>
            </p>
            <Input 
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={currentUser.name}
                autoComplete="off"
            />
             <div className="mt-6 flex gap-4">
                <Button variant="secondary" onClick={() => setStep(1)} className="w-full">
                    Back
                </Button>
                <Button variant="danger" onClick={handleConfirm} disabled={!isConfirmationMatch} className="w-full">
                    Permanently Delete Account
                </Button>
            </div>
        </>
      )}
    </Modal>
  );
};