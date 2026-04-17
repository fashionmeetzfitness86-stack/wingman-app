import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface AskGabyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskGabyModal: React.FC<AskGabyModalProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    // Message queued — AI response handled by ChatbotPage
    setSent(true);
    setTimeout(() => { setSent(false); setMessage(''); onClose(); }, 1200);
  };

    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-gaby-title"
    >
      <div className="rounded-2xl shadow-2xl w-full max-w-lg m-4 relative flex flex-col overflow-hidden"
        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg, #E040FB22, #7B61FF22)' }}>✦</div>
            <h2 id="ask-gaby-title" className="text-lg font-black text-white">Ask Gaby</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors" aria-label="Close">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-grow">
          <p className="text-sm text-gray-400 mb-4 text-center leading-relaxed">
            Your personal AI nightlife concierge.<br />How can I help you plan the perfect night?
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., 'Find me a high-energy venue for Saturday in South Beach...'"
            className="w-full h-36 rounded-xl p-3 text-sm text-white resize-none border-0 focus:outline-none focus:ring-1"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            aria-label="Your message to Gaby"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleSend}
            disabled={!message.trim() || sent}
            className="w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-2xl text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: !message.trim() ? 'none' : '0 8px 24px rgba(224,64,251,0.25)' }}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            {sent ? 'Sent ✓' : 'Send to Gaby'}
          </button>
        </div>
      </div>
    </div>