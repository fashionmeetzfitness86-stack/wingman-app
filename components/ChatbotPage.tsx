import React from 'react';
import { SparkleIcon } from './icons/SparkleIcon';

interface ChatbotPageProps {
    initialPrompt?: string;
}

export const ChatbotPage: React.FC<ChatbotPageProps> = () => {
    return (
        <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-black mb-4">
                <SparkleIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Gaby is resting</h2>
            <p className="text-gray-400 max-w-sm">
                Our AI nightlife concierge is temporarily offline. Check back soon!
            </p>
        </div>
    );
};
