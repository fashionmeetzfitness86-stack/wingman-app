import React, { useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[101] p-4 rounded-lg flex items-center gap-3 shadow-lg animate-fade-in-down ${
        isSuccess ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {isSuccess ? (
        <CheckCircleIcon className="w-6 h-6 text-white" />
      ) : (
        <ExclamationCircleIcon className="w-6 h-6 text-white" />
      )}
      <p className="font-semibold text-white">{message}</p>
      <button onClick={onClose} className="ml-auto text-white/80 hover:text-white" aria-label="Close notification">
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
