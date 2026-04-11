import React, { useState, useEffect } from 'react';
import { StoreItem } from '../../types';
import { Modal } from '../ui/Modal';
import { PlayIcon } from '../icons/PlayIcon';
import { TokenIcon } from '../icons/TokenIcon';

interface StoreItemPreviewModalProps {
  item: StoreItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StoreItemPreviewModal: React.FC<StoreItemPreviewModalProps> = ({ item, isOpen, onClose }) => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowVideo(false);
    }
  }, [isOpen]);

  if (!item) return null;

  const handleModalClose = () => {
    setShowVideo(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title={`Preview: ${item.title}`}>
      <div className="space-y-4">
        <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video w-full group">
          {showVideo && item.video ? (
            <video src={item.video} controls autoPlay className="w-full h-full object-contain" onEnded={() => setShowVideo(false)} />
          ) : (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          )}
          {item.video && !showVideo && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setShowVideo(true)} className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110">
                <PlayIcon className="w-8 h-8" />
              </button>
            </div>
          )}
        </div>
        <div>
          <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{item.category}</span>
          <p className="text-gray-300 mt-4">{item.description}</p>
        </div>
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <TokenIcon className="w-6 h-6 text-amber-400" />
              <span className="text-white font-bold text-xl">{item.price.toLocaleString()}</span>
              <span className="text-gray-400 font-semibold">TMKC</span>
            </div>
            <p className="text-gray-400 text-sm font-semibold ml-8">${item.priceUSD.toFixed(2)} USD</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
