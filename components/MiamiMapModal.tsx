import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface MiamiMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiamiMapModal: React.FC<MiamiMapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex flex-col items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full h-full p-4 md:p-8 relative">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Explore Miami Nightlife</h2>
        <iframe
          src="https://www.google.com/maps/d/embed?mid=1_Z-4C-Yw_N8qR-JkY5R-s4hWl9g&hl=en&ehbc=2E312F"
          width="100%"
          height="90%"
          className="border-2 border-amber-400 rounded-lg"
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 bg-black/50 p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="Close map"
        >
          <CloseIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};