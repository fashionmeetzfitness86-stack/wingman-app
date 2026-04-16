
import React from 'react';
import { SparkleIcon } from './icons/SparkleIcon';

interface ChatbotPageProps {
    initialPrompt?: string;
}

export const ChatbotPage: React.FC<ChatbotPageProps> = () => {
    return (
        <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-fade-in">
            {/* Branded icon */}
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{
                    background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)',
                    boxShadow: '0 0 32px rgba(224,64,251,0.3)',
                }}
            >
                <SparkleIcon className="w-9 h-9 text-white" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Gaby AI
            </h2>
            <p className="text-[11px] font-bold tracking-widest uppercase mb-4"
                style={{
                    background: 'linear-gradient(90deg, #E040FB, #00D4FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                Your Nightlife Concierge
            </p>
            <p className="text-gray-500 text-sm max-w-[280px] leading-relaxed">
                Gaby is being trained on Miami's best experiences. She'll be ready soon to help you find your perfect night.
            </p>

            <div className="mt-8 flex items-center gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#E040FB' }} />
                Coming soon
            </div>
        </div>
    );
};
