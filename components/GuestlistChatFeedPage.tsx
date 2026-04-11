import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SendIcon } from './icons/SendIcon';
import { User, Promoter, GuestlistChatMessage } from '../types';
import { users as allUsers, promoters } from '../data/mockData';

interface GuestlistChatFeedPageProps {
  chatId: number;
  currentUser: User;
  messages: GuestlistChatMessage[];
  onSendMessage: (chatId: number, text: string) => void;
}

const MessageBubble: React.FC<{ message: GuestlistChatMessage, sender: User | Promoter | undefined, isCurrentUser: boolean }> = ({ message, sender, isCurrentUser }) => (
    <div className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
        {!isCurrentUser && sender && <img src={sender.profilePhoto} alt={`Avatar of ${sender.name}`} className="w-8 h-8 rounded-full object-cover" />}
        <div className={`rounded-xl p-3 max-w-xs md:max-w-md ${isCurrentUser ? 'bg-blue-600 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
            {sender && !isCurrentUser && (
                 <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm text-white">{sender.name}</p>
                    <p className="text-xs text-gray-400">{message.timestamp}</p>
                </div>
            )}
            <p className="text-white whitespace-pre-wrap text-sm">{message.text}</p>
        </div>
    </div>
);

export const GuestlistChatFeedPage: React.FC<GuestlistChatFeedPageProps> = ({ chatId, currentUser, messages, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const allParticipants = useMemo(() => [...allUsers, ...promoters], []);

    const getParticipantById = (id: number) => allParticipants.find(p => p.id === id);
    const chatMessages = messages.filter(m => m.chatId === chatId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inputValue.trim()) return;
        onSendMessage(chatId, inputValue);
        setInputValue('');
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in">
            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="space-y-6">
                    {chatMessages.map((msg) => {
                        const sender = getParticipantById(msg.senderId);
                        const isCurrentUser = msg.senderId === currentUser.id;
                        return <MessageBubble key={msg.id} message={msg} sender={sender} isCurrentUser={isCurrentUser} />
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 md:p-6 bg-black border-t border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="w-12 h-12 flex-shrink-0 bg-amber-400 rounded-full flex items-center justify-center text-black disabled:bg-gray-600 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};