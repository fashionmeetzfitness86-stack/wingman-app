import React from 'react';
import { CloseIcon } from '../icons/CloseIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, className = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--color-overlay)] flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl shadow-2xl w-full m-4 flex flex-col max-h-[90vh] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)] flex-shrink-0">
            <h2 className="text-xl font-bold text-[var(--color-foreground)]">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-input)]" aria-label="Close">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        
        <div className="p-6 flex-grow overflow-y-auto">
          {children}
        </div>
        
        {footer && (
          <div className="p-4 border-t border-[var(--color-border)] flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
