
import React from 'react';
import { ImageCarousel } from '../ImageCarousel';
import { CloseIcon } from '../icons/CloseIcon';

interface ImageCarouselModalProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
  isOpen: boolean;
}

export const ImageCarouselModal: React.FC<ImageCarouselModalProps> = ({ images, startIndex, onClose, isOpen }) => {
  if (!isOpen) {
    return null;
  }
  
  return (
    <div
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
        aria-label="Close gallery"
      >
        <CloseIcon className="w-8 h-8" />
      </button>
      <div className="w-full h-full max-w-5xl max-h-[90vh] p-4 flex items-center justify-center" onClick={e => e.stopPropagation()}>
         <ImageCarousel images={images} startIndex={startIndex} className="w-full h-full" objectFit="contain" />
      </div>
    </div>
  );
};
