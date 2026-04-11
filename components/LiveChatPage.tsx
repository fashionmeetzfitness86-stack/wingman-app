import React from 'react';
import { SparkleIcon } from './icons/SparkleIcon';

export const LiveChatPage: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-black animate-fade-in">
            <div className="p-4 border-b border-gray-800 text-center">
                <h1 className="text-xl font-bold text-white">Ask Gaby (Voice)</h1>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-black mb-4">
                    <SparkleIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Voice chat is resting</h2>
                <p className="text-gray-400 max-w-sm">
                    Our live voice concierge is temporarily offline. Check back soon!
                </p>
            </div>
        </div>
    );
};
