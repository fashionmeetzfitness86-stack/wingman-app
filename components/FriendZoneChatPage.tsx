


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SendIcon } from './icons/SendIcon';
import { User, Promoter, FriendZoneChatMessage, FriendZoneChat } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { AddPromoterToChatModal } from './modals/AddPromoterToChatModal';
import { UsersIcon } from './icons/UsersIcon';
import { StarIcon } from './icons/StarIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ManageChatParticipantsModal } from './modals/ManageChatParticipantsModal';

interface FriendZoneChatPageProps {
  chatId: number;
  currentUser: User;
  chats: FriendZoneChat[];
  messages: FriendZoneChatMessage[];
  promoters: Promoter[];
  users: User[];
  onSendMessage: (chatId: number, text: string) => void;
  onAddPromoter: (chatId: number, promoterId: number) => void;
  onRemovePromoter: (chatId: number, promoterId: number) => void;
  onBack: () => void;
  onAddMember: (chatId: number, userId: number) => void;
  onRemoveMember: (chatId: number, userId: number) => void;
  onLeaveChat: (chatId: number) => void;
}

const MessageBubble: React.FC<{ message: FriendZoneChatMessage, sender: User | Promoter | undefined, isCurrentUser: boolean }> = ({ message, sender, isCurrentUser }) => (
    <div className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
        {!isCurrentUser && sender && <img src={sender.profilePhoto} alt={`Avatar of ${sender.name}`} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
        <div className={`rounded-xl p-3 max-w-xs md:max-w-md ${isCurrentUser ? 'bg-[#EC4899] rounded-br-none text-white' : 'bg-gray-800 rounded-bl-none text-white'}`}>
            {sender && !isCurrentUser && (
                 <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm text-gray-300">{sender.name}</p>
                    <p className="text-[10px] text-gray-500">{message.timestamp}</p>
                </div>
            )}
            <p className="whitespace-pre-wrap text-sm">{message.text}</p>
            {isCurrentUser && <p className="text-[10px] text-white/70 text-right mt-1">{message.timestamp}</p>}
        </div>
    </div>
);

export const FriendZoneChatPage: React.FC<FriendZoneChatPageProps> = ({ chatId, currentUser, chats, messages, promoters, users, onSendMessage, onAddPromoter, onRemovePromoter, onBack, onAddMember, onRemoveMember, onLeaveChat }) => {
    const [inputValue, setInputValue] = useState('');
    const [isPromoterModalOpen, setIsPromoterModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const currentChat = chats.find(c => c.id === chatId);
    const chatMessages = messages.filter(m => m.chatId === chatId);
    
    const allParticipants = useMemo(() => [...users, ...promoters], [users, promoters]);
    
    const activePromoters = useMemo(() => {
        if (!currentChat?.promoterIds) return [];
        return currentChat.promoterIds.map(id => promoters.find(p => p.id === id)).filter(Boolean) as Promoter[];
    }, [currentChat, promoters]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inputValue.trim()) return;
        onSendMessage(chatId, inputValue);
        setInputValue('');
    }

    if (!currentChat) {
        return <div className="p-8 text-center text-gray-400">Chat not found.</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] bg-black animate-fade-in"> 
            {/* Header */}
            <div className="flex-shrink-0 p-3 border-b border-gray-800 bg-black/80 backdrop-blur-lg sticky top-0 z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Go back">
                            <ChevronLeftIcon className="w-6 h-6 text-white" />
                        </button>
                        <div className="flex-grow min-w-0">
                            <h2 className="font-bold text-white truncate text-lg">{currentChat.name}</h2>
                            <p className="text-xs text-gray-400">{currentChat.memberIds.length} members</p>
                        </div>
                    </div>
                    <button onClick={() => setIsManageModalOpen(true)} className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white" aria-label="Manage Chat">
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Promoter Management Area */}
                <div className="flex flex-col gap-2 bg-gray-900 rounded-lg p-2 px-3 border border-gray-800">
                    <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Wingmen</span>
                         <button 
                            onClick={() => setIsPromoterModalOpen(true)}
                            className="text-xs bg-[#EC4899] text-white font-bold px-3 py-1.5 rounded-full hover:bg-[#d8428a] transition-colors"
                        >
                            + Add Promoter
                        </button>
                    </div>
                    {activePromoters.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {activePromoters.map(promoter => (
                                <div key={promoter.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={promoter.profilePhoto} alt={promoter.name} className="w-8 h-8 rounded-full object-cover border-2 border-amber-400" />
                                            <div className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-0.5">
                                                <StarIcon className="w-2 h-2 text-black fill-current" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{promoter.name}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onRemovePromoter(chatId, promoter.id)}
                                        className="ml-auto text-xs text-red-400 hover:text-red-300 border border-red-900/50 bg-red-900/20 px-2 py-1 rounded transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-500 py-1">
                            <UsersIcon className="w-4 h-4" />
                            <span className="text-xs italic">No promoter in chat</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-[#121212]">
                <div className="space-y-4">
                    {chatMessages.map((msg) => {
                        const sender = allParticipants.find(p => p.id === msg.senderId);
                        const isCurrentUser = msg.senderId === currentUser.id;
                        return <MessageBubble key={msg.id} message={msg} sender={sender} isCurrentUser={isCurrentUser} />
                    })}
                    {chatMessages.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>Start the conversation!</p>
                            <p className="text-xs mt-1">Discuss plans with your friends.</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-black/80 backdrop-blur-lg border-t border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]"
                        aria-label="Chat input"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="w-12 h-12 flex-shrink-0 bg-[#EC4899] rounded-full flex items-center justify-center text-white disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-pink-900/20"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>

            <AddPromoterToChatModal 
                isOpen={isPromoterModalOpen}
                onClose={() => setIsPromoterModalOpen(false)}
                promoters={promoters}
                onAdd={(promoterId) => {
                    onAddPromoter(chatId, promoterId);
                    setIsPromoterModalOpen(false);
                }}
            />

            <ManageChatParticipantsModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                chat={currentChat}
                currentUser={currentUser}
                allUsers={users}
                onAddMember={(userId) => onAddMember(chatId, userId)}
                onRemoveMember={(userId) => onRemoveMember(chatId, userId)}
                onLeaveChat={() => onLeaveChat(chatId)}
            />
        </div>
    );
};
