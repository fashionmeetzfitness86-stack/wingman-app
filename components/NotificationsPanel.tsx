import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { AppNotification } from '../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onNavigate: (link: AppNotification['link']) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose, notifications, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="absolute top-20 right-4 md:right-8 w-80 max-w-[90vw] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-800">
          <h3 className="font-bold text-white">Notifications</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white" aria-label="Close notifications">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.map(notif => (
            <button
                key={notif.id}
                onClick={() => notif.link && onNavigate(notif.link)}
                className={`w-full text-left p-3 border-b border-gray-800 ${notif.read ? 'opacity-60' : ''} ${notif.link ? 'hover:bg-gray-800' : 'cursor-default'}`}
            >
              <p className="text-white text-sm">{notif.text}</p>
              <p className="text-gray-400 text-xs mt-1">{notif.time}</p>
            </button>
          ))}
          {notifications.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">No new notifications.</p>}
        </div>
      </div>
    </div>
  );
};