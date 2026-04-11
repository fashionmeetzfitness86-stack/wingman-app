import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SendIcon } from './icons/SendIcon';
import { UserRole, User, Promoter } from '../types';
import { mockGroupChatMessages } from '../data/mockData';
import { EmojiIcon } from './icons/EmojiIcon';
import { EmojiPicker } from './EmojiPicker';

interface GroupChatPageProps {
  currentUser: User;
  users: User[];
  promoters: Promoter[];
}

interface Message {
    senderId: number;
    text: string;
    timestamp: string;
}

const MessageBubble: React.FC<{ message: Message, sender: User | Promoter | undefined, isCurrentUser: boolean }> = ({ message, sender, isCurrentUser }) => (
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

const TypingIndicator: React.FC<{ sender?: User | Promoter }> = ({ sender }) => (
    <div className="flex items-start gap-3">
        {sender && <img src={sender.profilePhoto} alt={`Avatar of ${sender.name}`} className="w-8 h-8 rounded-full object-cover" />}
         <div className="bg-gray-800 rounded-xl rounded-bl-none p-4">
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
);

export const GroupChatPage: React.FC<GroupChatPageProps> = ({ currentUser, users, promoters }) => {
    const [messages, setMessages] = useState<Message[]>(mockGroupChatMessages);
    const [inputValue, setInputValue] = useState('');
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const allParticipants = useMemo(() => [...users, ...promoters], [users, promoters]);

    const getParticipantById = (id: number) => allParticipants.find(p => p.id === id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inputValue.trim()) return;
        
        const newMessage: Message = {
            senderId: currentUser.id, 
            text: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setIsEmojiPickerOpen(false);

        // Simulate a reply
        const replyingPromoter = promoters.find(p => p.id === 1); // Anderson
        if (replyingPromoter) {
            setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                    const replyMessage: Message = {
                        senderId: replyingPromoter.id,
                        text: "On it. I'll get back to you shortly.",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages(prev => [...prev, replyMessage]);
                    setIsTyping(false);
                }, 2000); // Typing for 2 seconds
            }, 1000); // Wait 1 second before showing typing indicator
        }
    }
    
    return (
         <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in">
            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map((msg, index) => {
                        const sender = getParticipantById(msg.senderId);
                        const isCurrentUser = msg.senderId === currentUser.id;
                        return <MessageBubble key={index} message={msg} sender={sender} isCurrentUser={isCurrentUser} />
                    })}
                    {isTyping && <TypingIndicator sender={getParticipantById(1)} />}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 md:p-6 bg-black border-t border-gray-800 relative">
                {isEmojiPickerOpen && <EmojiPicker onEmojiSelect={(emoji) => setInputValue(prev => prev + emoji)} onClose={() => setIsEmojiPickerOpen(false)} />}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <button type="button" onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className="p-2 text-gray-400 hover:text-white">
                        <EmojiIcon className="w-6 h-6" />
                    </button>
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