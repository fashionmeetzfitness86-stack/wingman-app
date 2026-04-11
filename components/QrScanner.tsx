
import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface QrScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isScanningRef = useRef(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;
    const isMounted = { current: true };

    const startScan = async () => {
      // Check for BarcodeDetector support
      // @ts-ignore
      if (!('BarcodeDetector' in window)) {
        if (isMounted.current) {
            setError('QR Scanning not supported on this device. Use simulation.');
            isScanningRef.current = false;
        }
        return;
      }

      try {
        // @ts-ignore
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scanFrame(barcodeDetector);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if(isMounted.current) {
            setError('Camera access denied or unavailable.');
            isScanningRef.current = false;
        }
      }
    };

    const scanFrame = async (barcodeDetector: any) => {
      if (!videoRef.current || videoRef.current.readyState < 2 || !isScanningRef.current) {
        if (isScanningRef.current) {
            animationFrameId = requestAnimationFrame(() => scanFrame(barcodeDetector));
        }
        return;
      }

      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);
        if (barcodes.length > 0 && isScanningRef.current) {
          isScanningRef.current = false;
          onScan(barcodes[0].rawValue);
        }
      } catch (err) {
        // Ignore detection errors
      }
      
      if (isScanningRef.current) {
        animationFrameId = requestAnimationFrame(() => scanFrame(barcodeDetector));
      }
    };

    startScan();

    return () => {
      isMounted.current = false;
      isScanningRef.current = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if(animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-[100] animate-fade-in" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-md aspect-square p-4 bg-black">
        {!error ? (
            <>
                <video ref={videoRef} className="w-full h-full object-cover rounded-lg" playsInline muted />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-amber-400/80 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1"></div>
                        <div className="absolute inset-0 bg-amber-400/10 animate-pulse"></div>
                    </div>
                </div>
            </>
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-lg p-6 text-center">
                <p className="text-red-400 font-bold mb-2">Scanner Unavailable</p>
                <p className="text-gray-400 text-sm">{error}</p>
            </div>
        )}
      </div>
      
      <p className="text-center text-white mt-6 font-medium">Align QR code within the frame</p>

      {/* Simulation Button for Demo Purposes */}
      <button 
        onClick={() => onScan('wingman-venue-checkin-mock-data')} 
        className="mt-8 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-amber-400 font-bold rounded-full transition-colors border border-gray-700"
      >
        Simulate Successful Scan
      </button>
      
      <button onClick={onClose} className="absolute top-6 right-6 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition-colors backdrop-blur-md" aria-label="Close scanner">
          <CloseIcon className="w-6 h-6" />
      </button>
    </div>
  );
};
