import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface AskGabyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskGabyModal: React.FC<AskGabyModalProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSend = () => {
    // Placeholder for sending message to AI
    console.log('Sending message to Gaby:', message);
    setMessage('');
    onClose(); // Close modal after sending for now
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-gaby-title"
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-amber-500/10 w-full max-w-lg m-4 relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 id="ask-gaby-title" className="text-xl font-bold text-white">Ask Gaby</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white" aria-label="Close">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-grow">
          <p className="text-gray-300 mb-4 text-center">Your personal AI nightlife concierge. How can I help you plan the perfect night?</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., 'Find me a high-energy hip-hop club for Saturday night in South Beach...'"
            className="w-full h-40 bg-gray-800 border-gray-600 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 resize-none"
            aria-label="Your message to Gaby"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50 rounded-b-xl">
           <button 
             onClick={handleSend}
             disabled={!message.trim()}
             className="w-full flex items-center justify-center gap-2 bg-amber-400 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:scale-100"
           >
             <PaperAirplaneIcon className="w-5 h-5" />
             Send
           </button>
        </div>
      </div>
    </div>
  );
};