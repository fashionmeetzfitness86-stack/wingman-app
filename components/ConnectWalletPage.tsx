import React from 'react';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

const WalletOption: React.FC<{ name: string, icon: React.ReactNode }> = ({ name, icon }) => (
    <button className="w-full flex items-center gap-4 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
        <div className="w-10 h-10 flex items-center justify-center">{icon}</div>
        <span className="font-semibold text-white flex-grow text-left">{name}</span>
        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
    </button>
);

export const ConnectWalletPage: React.FC = () => {
  return (
    <div className="p-6 flex flex-col items-center justify-center text-center animate-fade-in min-h-[calc(100vh-5rem)]">
        <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 3V9a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9" />
            </svg>
        </div>
        <h1 className="text-4xl font-bold text-white">Connect your wallet</h1>
        <p className="text-gray-400 mt-4 max-w-sm mx-auto">
            Connect your wallet to unlock exclusive features and access your digital assets securely.
        </p>
        <div className="w-full max-w-sm mx-auto space-y-3 mt-10">
            <WalletOption name="WalletConnect" icon={<img src="https://picsum.photos/seed/wc/40/40" className="w-8 h-8 rounded-md" alt="WalletConnect"/>} />
            <WalletOption name="MetaMask" icon={<img src="https://picsum.photos/seed/mm/40/40" className="w-8 h-8 rounded-md" alt="MetaMask"/>} />
        </div>
        <p className="text-gray-600 text-xs mt-8">
            By connecting your wallet, you agree to our <a href="#" className="underline hover:text-gray-400">Terms of Service</a> and <a href="#" className="underline hover:text-gray-400">Privacy Policy</a>.
        </p>
    </div>
  );
};
