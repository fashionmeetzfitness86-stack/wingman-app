
import React, { useEffect, useRef } from 'react';
import { CloseIcon } from '../icons/CloseIcon';

interface NotificationsModalProps {
  onClose: () => void;
  onEnable: () => void;
  onManagePreferences?: () => void;
}

const PREVIEW_ITEMS = [
  { emoji: '🎉', title: 'Wingman @ LIV — Tonight', sub: '5 spots remaining · Reserve now', color: '#E040FB' },
  { emoji: '✅', title: 'Booking Confirmed', sub: 'Thu, Apr 30 · LIV Miami · 11PM', color: '#22C55E' },
  { emoji: '⚡', title: 'Exclusive Drop', sub: 'New yacht experience available for you', color: '#00D4FF' },
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose, onEnable, onManagePreferences }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus inside modal
  useEffect(() => {
    const el = modalRef.current;
    if (el) el.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-title"
    >
      {/* Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-sm mx-auto rounded-t-3xl sm:rounded-3xl overflow-hidden focus:outline-none"
        style={{
          background: 'linear-gradient(160deg, #18181B 0%, #0F0F12 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 -16px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Close button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Hero icon */}
        <div className="flex flex-col items-center px-6 pb-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 relative"
            style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)' }}
          >
            {/* Animated pulse ring */}
            <span
              className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: 'linear-gradient(135deg, #E040FB, #00D4FF)' }}
            />
            <svg className="w-10 h-10 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          <h1 id="notifications-title" className="text-2xl font-black text-white text-center mb-2">
            Never Miss a Beat
          </h1>
          <p className="text-sm text-gray-400 text-center leading-relaxed max-w-xs">
            Stay ahead with real-time alerts on exclusive drops, booking updates, and personalized picks — curated just for you.
          </p>
        </div>

        {/* Preview notifications */}
        <div className="mx-4 mb-5 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
          {PREVIEW_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < PREVIEW_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              {/* Color dot */}
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-lg flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{item.title}</p>
                <p className="text-[11px] text-gray-500 truncate">{item.sub}</p>
              </div>
              <span className="text-[10px] text-gray-600 flex-shrink-0">now</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="px-4 pb-6 space-y-3">
          <button
            id="enable-notifications-btn"
            onClick={onEnable}
            className="w-full font-bold py-4 rounded-2xl text-white text-base transition-all active:scale-[0.98] hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: '0 8px 32px rgba(224,64,251,0.3)' }}
          >
            Enable Notifications
          </button>

          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-gray-500 hover:text-gray-300 transition-colors"
            >
              Maybe Later
            </button>
            {onManagePreferences && (
              <>
                <div className="w-px h-4 bg-gray-800" />
                <button
                  onClick={() => { onClose(); onManagePreferences(); }}
                  className="flex-1 py-3 text-sm font-semibold transition-colors"
                  style={{ color: '#E040FB' }}
                >
                  Manage Preferences
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};