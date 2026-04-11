import React from 'react';
import { SparkleIcon } from './icons/SparkleIcon';

interface AskGabyBannerProps {
  onAsk: () => void;
}

export const AskGabyBanner: React.FC<AskGabyBannerProps> = ({ onAsk }) => {
  return (
    <div className="bg-[#1C1C1E] rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-black p-2 rounded-lg">
          <SparkleIcon className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h3 className="font-bold text-white">Ask Gaby</h3>
          <p className="text-sm text-gray-400">Find your perfect Miami experience.</p>
        </div>
      </div>
      <button onClick={onAsk} className="bg-white text-blue-600 font-bold text-sm px-5 py-2 rounded-lg hover:bg-gray-200 transition-colors">
        Ask
      </button>
    </div>
  );
};