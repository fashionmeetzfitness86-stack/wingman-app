import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

interface DeleteUserConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: number, reason: string) => void;
  user: User | null;
}

const DELETION_REASONS = [
  "Spam / Fake Account",
  "Violation of Terms of Service",
  "User requested deletion",
  "Other",
];

export const DeleteUserConfirmationModal: React.FC<DeleteUserConfirmationModalProps> = ({ isOpen, onClose, onConfirm, user }) => {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState(DELETION_REASONS[0]);
  const [otherReason, setOtherReason] = useState('');
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [confirmationName, setConfirmationName] = useState('');

  useEffect(() => {
    if (isOpen) {
        resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep(1);
    setReason(DELETION_REASONS[0]);
    setOtherReason('');
    setIsAcknowledged(false);
    setConfirmationName('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleConfirm = () => {
    if (!user) return;
    const finalReason = reason === 'Other' ? `Other: ${otherReason}` : reason;
    onConfirm(user.id, finalReason);
    handleClose();
  };

  if (!isOpen || !user) return null;

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            <h3 className="text-xl font-bold text-center">Delete User</h3>
            <p className="text-center text-[var(--color-text-muted)] mt-2">Are you sure you want to permanently delete <span className="font-bold text-[var(--color-foreground)]">{user.name}</span>? This action cannot be undone.</p>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="text-xl font-bold">Reason for Deletion</h3>
            <p className="text-[var(--color-text-muted)] mt-2 mb-4">Please select a reason for deleting this user's account.</p>
            <Select value={reason} onChange={e => setReason(e.target.value)}>
              {DELETION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            {reason === 'Other' && (
              <Textarea 
                value={otherReason} 
                onChange={e => setOtherReason(e.target.value)} 
                placeholder="Please specify the reason..." 
                className="mt-4"
              />
            )}
          </>
        );
      case 3:
        return (
          <>
            <h3 className="text-xl font-bold">Acknowledge Consequences</h3>
            <p className="text-[var(--color-text-muted)] mt-2 mb-4">Deleting this user will permanently remove their profile, booking history, group memberships, and all associated data.</p>
            <label className="flex items-center gap-3 p-4 bg-[var(--color-input)] rounded-lg cursor-pointer">
              <input 
                type="checkbox"
                checked={isAcknowledged}
                onChange={e => setIsAcknowledged(e.target.checked)}
                className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="font-semibold text-[var(--color-foreground)]">I understand the consequences and wish to proceed.</span>
            </label>
          </>
        );
      case 4:
        return (
          <>
            <h3 className="text-xl font-bold">Final Confirmation</h3>
            <p className="text-[var(--color-text-muted)] mt-2 mb-4">To confirm deletion, please type the user's full name: <span className="font-bold text-[var(--color-foreground)]">{user.name}</span></p>
            <Input 
              value={confirmationName}
              onChange={e => setConfirmationName(e.target.value)}
              placeholder={user.name}
              autoComplete="off"
            />
          </>
        );
      default:
        return null;
    }
  };
  
  const renderFooter = () => {
    const isNextDisabled = 
      (step === 2 && reason === 'Other' && !otherReason.trim()) ||
      (step === 3 && !isAcknowledged);

    const isFinalConfirmDisabled = (step === 4 && confirmationName !== user.name);

    return (
      <div className="flex justify-between items-center">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
        ) : <Button variant="secondary" onClick={handleClose}>Cancel</Button>}
        <div className="flex gap-2">
          {step < 4 ? (
            <Button variant={step === 1 ? 'danger' : 'primary'} onClick={() => setStep(step + 1)} disabled={isNextDisabled}>
              {step === 1 ? 'Delete' : 'Next'}
            </Button>
          ) : (
            <Button variant="danger" onClick={handleConfirm} disabled={isFinalConfirmDisabled}>
              Permanently Delete User
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} footer={renderFooter()}>
      {renderStepContent()}
    </Modal>
  );
};