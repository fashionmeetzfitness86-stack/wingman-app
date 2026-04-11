import React, { useState } from 'react';
import { AskGabyIcon } from './icons/AskGabyIcon';
import { Page } from '../types';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { ChatBubbleLeftIcon } from './icons/ChatBubbleLeftIcon';
import { CloseIcon } from './icons/CloseIcon';

interface FloatingActionButtonProps {
    onNavigate: (page: Page) => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleNavigate = (page: Page) => {
        setIsOpen(false);
        onNavigate(page);
    };

    return (
        <div className="fixed bottom-28 right-4 md:right-8 z-40">
            <div className="relative flex flex-col items-center gap-4">
                 {isOpen && (
                    <div className="flex flex-col items-center gap-4 animate-fade-in-up">
                        <button 
                            onClick={() => handleNavigate('liveChat')}
                            className="w-14 h-14 bg-white rounded-full flex flex-col items-center justify-center text-[#EC4899] shadow-md transition-transform hover:scale-110"
                            aria-label="Ask Gaby with voice"
                        >
                            <MicrophoneIcon className="w-6 h-6"/>
                            <span className="text-xs font-bold">Voice</span>
                        </button>
                        <button 
                            onClick={() => handleNavigate('chatbot')}
                            className="w-14 h-14 bg-white rounded-full flex flex-col items-center justify-center text-[#EC4899] shadow-md transition-transform hover:scale-110"
                            aria-label="Ask Gaby with text"
                        >
                            <ChatBubbleLeftIcon className="w-6 h-6"/>
                            <span className="text-xs font-bold">Text</span>
                        </button>
                    </div>
                )}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 bg-[#EC4899] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#EC4899]/40 transition-transform hover:scale-110"
                    aria-label="Toggle AI assistant menu"
                    aria-expanded={isOpen}
                >
                    {isOpen ? <CloseIcon className="w-8 h-8"/> : <AskGabyIcon className="w-8 h-8" />}
                </button>
            </div>
        </div>
    )
}