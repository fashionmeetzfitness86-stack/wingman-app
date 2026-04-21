
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SparkleIcon } from './icons/SparkleIcon';
import { SendIcon } from './icons/SendIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { WingmanChat, WingmanChatMessage, User } from '../types';

interface ChatbotPageProps {
    chatId?: number;
    initialPrompt?: string;
    currentUser: User;
    wingmanChats: WingmanChat[];
    messages: WingmanChatMessage[];
    onSendMessage: (chatId: number | undefined, text: string) => void;
    onBack: () => void;
}

export const ChatbotPage: React.FC<ChatbotPageProps> = ({ chatId, initialPrompt, currentUser, wingmanChats, messages, onSendMessage, onBack }) => {
    const [inputValue, setInputValue] = useState(initialPrompt || '');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);

    const currentChat = useMemo(() => wingmanChats.find(c => c.id === chatId), [chatId, wingmanChats]);
    
    // If we have a specific chat, use its messages, otherwise get all messages for a newly initiated context?
    // Let's just filter by chatId if provided, else empty (new chat)
    const chatMessages = useMemo(() => {
        return messages.filter(m => m.chatId === chatId);
    }, [messages, chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, isTyping]);

    // Simple typing simulation when wingman takes a moment to respond
    useEffect(() => {
        const lastMessage = chatMessages[chatMessages.length - 1];
        if (lastMessage && lastMessage.senderId === currentUser.id) {
            setIsTyping(true);
            const timer = setTimeout(() => setIsTyping(false), 1500);
            return () => clearTimeout(timer);
        } else {
            setIsTyping(false);
        }
    }, [chatMessages, currentUser.id]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inputValue.trim()) return;
        onSendMessage(chatId, inputValue);
        setInputValue('');
        setIsTyping(true);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] bg-black animate-fade-in">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center gap-3 p-3 border-b border-gray-800 bg-black/80 backdrop-blur-lg sticky top-0 z-10">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Go back">
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFFFFF, #738596, #1A252C)' }}>
                    <SparkleIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow min-w-0">
                    <h2 className="font-bold text-white truncate">Wingman Concierge</h2>
                    <p className="text-xs text-gray-400">Always online</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="space-y-4">
                    {/* Initial Welcome Message if empty */}
                    {chatMessages.length === 0 && (
                        <div className="flex justify-center my-8">
                            <div className="bg-gray-900 rounded-xl p-6 text-center max-w-sm border border-gray-800">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #FFFFFF, #738596, #1A252C)' }}>
                                    <SparkleIcon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Wingman Support</h3>
                                <p className="text-sm text-gray-400">
                                    Send a message to start chatting with your concierge. We can help with bookings, guestlists, or answering any questions.
                                </p>
                            </div>
                        </div>
                    )}

                    {chatMessages.map(msg => {
                        const isUser = msg.senderId === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[85%]`}>
                                    {!isUser && (
                                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFFFFF, #738596, #1A252C)' }}>
                                            <SparkleIcon className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-xl ${isUser ? 'bg-white text-black rounded-br-sm' : 'bg-gray-800 text-white rounded-bl-sm border border-gray-700'}`}>
                                        <p className="whitespace-pre-wrap text-[15px]">{msg.text}</p>
                                    </div>
                                </div>
                                <span className={`text-[11px] text-gray-500 ${isUser ? 'pr-2' : 'pl-10'}`}>
                                    {msg.timestamp}
                                </span>
                            </div>
                        );
                    })}
                    
                    {isTyping && (
                        <div className="flex items-end gap-2 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFFFFF, #738596, #1A252C)' }}>
                                <SparkleIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-gray-800 rounded-xl rounded-bl-sm p-3 border border-gray-700">
                                <div className="flex items-center gap-1.5 h-3">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-black/80 backdrop-blur-lg border-t border-gray-800">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Message Wingman..."
                        className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg p-3 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] transition-colors"
                        aria-label="Message input"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="w-12 h-12 flex-shrink-0 bg-white text-black hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};
