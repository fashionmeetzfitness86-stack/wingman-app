

import React from 'react';
import { CloseIcon } from '../icons/CloseIcon';
import { BellIcon } from '../icons/BellIcon';

interface NotificationsModalProps {
  onClose: () => void;
  onEnable: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose, onEnable }) => {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col p-6 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="notifications-title">
        <header className="flex items-center justify-end">
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close notifications prompt">
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>

        <main className="flex-grow flex flex-col justify-center items-center text-center">
            <div className="w-24 h-24 bg-pink-500 rounded-full flex items-center justify-center mb-8">
                <BellIcon className="w-12 h-12 text-white" />
            </div>

            <h1 id="notifications-title" className="text-4xl font-bold text-white">Never Miss a Beat</h1>
            <p className="text-gray-400 mt-4 max-w-sm mx-auto">
                Enable notifications for real-time updates, personalized recommendations, and exclusive access to premier events.
            </p>
        </main>
        
        <footer className="text-center pb-4">
            <button onClick={onEnable} className="w-full max-w-sm mx-auto bg-pink-500 text-white font-bold py-4 px-4 rounded-xl transition-transform duration-200 hover:scale-105">
                Enable Notifications
            </button>
            <button onClick={onClose} className="w-full max-w-sm mx-auto mt-4 text-gray-400 font-semibold py-2 px-4 rounded-lg hover:text-white transition-colors">
                Maybe Later
            </button>
        </footer>
    </div>
  );
};