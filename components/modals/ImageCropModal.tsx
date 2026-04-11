import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon } from '../icons/CloseIcon';

interface ImageCropModalProps {
  src: string | null;
  onClose: () => void;
  onCrop: (croppedImageUrl: string) => void;
  onError?: (message: string) => void;
}

const CROP_BOX_MIN_SIZE = 50;
const OUTPUT_SIZE = 300;

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ src, onClose, onCrop, onError }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 200, height: 200 });
  const [dragState, setDragState] = useState({ isDragging: false, isResizing: false, handle: '', startX: 0, startY: 0, startCrop: crop });

  const getContainedSize = (img: HTMLImageElement): { width: number; height: number } => {
    const container = containerRef.current;
    if (!container) return { width: 0, height: 0 };
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    const { naturalWidth, naturalHeight } = img;
    const imgRatio = naturalWidth / naturalHeight;
    const containerRatio = containerWidth / containerHeight;
    
    if (imgRatio > containerRatio) { // Image is wider than container
      return { width: containerWidth, height: containerWidth / imgRatio };
    } else { // Image is taller or same ratio
      return { height: containerHeight, width: containerHeight * imgRatio };
    }
  };

  const constrainCrop = useCallback((newCrop, imgSize) => {
    let { x, y, width, height } = newCrop;
    width = Math.max(CROP_BOX_MIN_SIZE, Math.min(width, imgSize.width - x));
    height = Math.max(CROP_BOX_MIN_SIZE, Math.min(height, imgSize.height - y));
    x = Math.max(0, Math.min(x, imgSize.width - width));
    y = Math.max(0, Math.min(y, imgSize.height - height));
    return { x, y, width, height };
  }, []);

  const handleMouseDown = (e: React.MouseEvent, handle = 'move') => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({
      isDragging: handle === 'move',
      isResizing: handle !== 'move',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: crop,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging && !dragState.isResizing) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const { startCrop } = dragState;
    let newCrop = { ...startCrop };
    
    if (dragState.isResizing) {
        if (dragState.handle.includes('e')) newCrop.width = startCrop.width + dx;
        if (dragState.handle.includes('s')) newCrop.height = startCrop.height + dy;
        if (dragState.handle.includes('w')) {
            newCrop.x = startCrop.x + dx;
            newCrop.width = startCrop.width - dx;
        }
        if (dragState.handle.includes('n')) {
            newCrop.y = startCrop.y + dy;
            newCrop.height = startCrop.height - dy;
        }
        
        // Ensure aspect ratio is 1:1 (square)
        if (dragState.handle.includes('e') || dragState.handle.includes('w')) {
            newCrop.height = newCrop.width;
        } else {
            newCrop.width = newCrop.height;
        }

    } else if (dragState.isDragging) {
      newCrop.x = startCrop.x + dx;
      newCrop.y = startCrop.y + dy;
    }

    if (imageRef.current) {
        const imgSize = getContainedSize(imageRef.current);
        setCrop(constrainCrop(newCrop, imgSize));
    }
  }, [dragState, constrainCrop]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, isResizing: false, handle: '', startX: 0, startY: 0, startCrop: crop });
  }, [crop]);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleCropConfirm = () => {
    if (!imageRef.current) return;
    
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            if (onError) onError("Failed to create crop canvas.");
            return;
        }

        const originalImage = imageRef.current;
        const { naturalWidth, naturalHeight } = originalImage;
        const { width: displayedWidth } = getContainedSize(originalImage);
        
        if (displayedWidth === 0) return;

        const scale = naturalWidth / displayedWidth;

        const sx = crop.x * scale;
        const sy = crop.y * scale;
        const sWidth = crop.width * scale;
        const sHeight = crop.height * scale;

        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;

        ctx.drawImage(originalImage, sx, sy, sWidth, sHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        
        onCrop(canvas.toDataURL('image/jpeg'));
    } catch (err) {
        console.error(err);
        if (onError) onError("An error occurred while cropping the image.");
    }
  };

  const handleImageLoad = () => {
    if (!imageRef.current) return;
    const { width, height } = getContainedSize(imageRef.current);
    const size = Math.min(width, height, 200);
    setCrop({
        x: (width - size) / 2,
        y: (height - size) / 2,
        width: size,
        height: size
    });
  };

  const handleImageError = () => {
      if (onError) onError("Failed to load image for cropping.");
      onClose();
  };

  if (!src) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Crop Profile Picture</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
        </div>
        <div ref={containerRef} className="p-4 flex-grow flex items-center justify-center relative select-none">
          <img 
            ref={imageRef} 
            src={src} 
            onLoad={handleImageLoad} 
            onError={handleImageError}
            style={{ maxWidth: '100%', maxHeight: '100%', userSelect: 'none' }} 
            alt="Crop preview" 
          />
          <div
            className="absolute border-2 border-dashed border-white/70"
            style={{
              transform: `translate(${crop.x}px, ${crop.y}px)`,
              width: crop.width,
              height: crop.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div onMouseDown={(e) => handleMouseDown(e)} className="absolute inset-0 cursor-move" />
            {['ne', 'se', 'sw', 'nw'].map(handle => (
              <div 
                key={handle}
                onMouseDown={(e) => handleMouseDown(e, handle)}
                className="absolute w-4 h-4 bg-white/50 border-2 border-white rounded-full"
                style={{
                  top: handle.includes('n') ? -8 : 'auto',
                  bottom: handle.includes('s') ? -8 : 'auto',
                  left: handle.includes('w') ? -8 : 'auto',
                  right: handle.includes('e') ? -8 : 'auto',
                  cursor: `${handle}-resize`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
          <button onClick={handleCropConfirm} className="bg-amber-400 text-black font-bold py-2 px-4 rounded-lg">Crop & Save</button>
        </div>
      </div>
    </div>
  );
};