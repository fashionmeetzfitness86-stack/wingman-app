import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJIS = ['😊', '😂', '❤️', '🔥', '🎉', '👍', '🥂', ' Miami'];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  return (
    <div className="absolute bottom-16 left-0 bg-gray-800 p-2 rounded-lg flex gap-1 shadow-lg border border-gray-700 animate-fade-in-up">
      {EMOJIS.map(emoji => (
        <button 
          key={emoji} 
          onClick={() => onEmojiSelect(emoji)} 
          className="p-2 text-2xl rounded-md hover:bg-gray-700 transition-colors"
          aria-label={`Select emoji ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};