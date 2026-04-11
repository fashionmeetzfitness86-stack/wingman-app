import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SendIcon } from './icons/SendIcon';
import { User, Promoter, EventChatMessage, Event, EventChat } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { EventParticipantsModal } from './modals/EventParticipantsModal';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

const ChatHeader: React.FC<{ event: Event; onBack: () => void; onOpenParticipants: () => void; }> = ({ event, onBack, onOpenParticipants }) => {
    const eventDate = new Date(event.date + 'T00:00:00');
    const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div className="flex-shrink-0 flex items-center gap-3 p-3 border-b border-gray-800 bg-black/80 backdrop-blur-lg sticky top-0 z-10">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Go back">
                <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <img src={event.image} alt={event.title} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-grow min-w-0">
                <h2 className="font-bold text-white truncate">{event.title}</h2>
                <p className="text-xs text-gray-400">{formattedDate}</p>
            </div>
            <button onClick={onOpenParticipants} className="flex-shrink-0 p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="View participants">
                <UsersIcon className="w-6 h-6 text-white" />
            </button>
        </div>
    );
};


const MessageBubble: React.FC<{ message: EventChatMessage; sender: User | Promoter | undefined; isCurrentUser: boolean; isRead: boolean; reader: User | undefined; }> = ({ message, sender, isCurrentUser, isRead, reader }) => (
    <div className={`flex items-end gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && sender && <img src={sender.profilePhoto} alt={`Avatar of ${sender.name}`} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
        <div className={`rounded-xl p-3 max-w-[80%] md:max-w-[70%] ${isCurrentUser ? 'bg-blue-600 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
            {!isCurrentUser && sender && (
                 <p className="font-bold text-sm text-[#EC4899] mb-1">{sender.name}</p>
            )}
            <p className="text-white whitespace-pre-wrap text-sm">{message.text}</p>
            <div className="flex justify-end items-center gap-2 mt-1.5">
                <p className={`text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-400'}`}>{message.timestamp}</p>
                {isCurrentUser && isRead && reader && (
                    <img
                        src={reader.profilePhoto}
                        alt={`Read by ${reader.name}`}
                        title={`Read by ${reader.name}`}
                        className="w-4 h-4 rounded-full"
                    />
                )}
            </div>
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


interface EventChatPageProps {
  chatId: number;
  currentUser: User;
  messages: EventChatMessage[];
  allParticipants: (User | Promoter)[];
  allEvents: Event[];
  eventChats: EventChat[];
  onSendMessage: (chatId: number, text: string) => void;
  onBack: () => void;
}

export const EventChatPage: React.FC<EventChatPageProps> = ({ chatId, currentUser, messages, allParticipants, allEvents, eventChats, onSendMessage, onBack }) => {
    const [inputValue, setInputValue] = useState('');
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [readByParticipantMessageId, setReadByParticipantMessageId] = useState<number | null>(null);
    
    const currentChat = useMemo(() => eventChats.find(c => c.id === chatId), [chatId, eventChats]);
    const currentEvent = useMemo(() => allEvents.find(e => e.id === currentChat?.eventId), [currentChat, allEvents]);

    const participants = useMemo(() => {
        if (!currentChat) return [];
        return currentChat.memberIds.map(id => allParticipants.find(p => p.id === id)).filter((p): p is User | Promoter => !!p);
    }, [currentChat, allParticipants]);
    
    const otherParticipant = useMemo(() => {
        return participants.find(p => p.id !== currentUser.id);
    }, [participants, currentUser]);

    const getParticipantById = (id: number) => allParticipants.find(p => p.id === id);

    const chatMessages = messages.filter(m => m.chatId === chatId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const lastMessage = chatMessages[chatMessages.length - 1];
        if (lastMessage && lastMessage.senderId !== currentUser.id) {
            setIsTyping(false);
        }

        if (lastMessage && lastMessage.senderId === currentUser.id && lastMessage.id !== readByParticipantMessageId) {
            const timer = setTimeout(() => {
                setReadByParticipantMessageId(lastMessage.id);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [chatMessages, currentUser.id, readByParticipantMessageId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inputValue.trim()) return;
        setReadByParticipantMessageId(null);
        onSendMessage(chatId, inputValue);
        setInputValue('');

        if (otherParticipant) {
            setIsTyping(true);
        }
    }
    
    if (!currentChat || !currentEvent) {
        return <div className="p-8 text-center text-gray-400">Chat not found.</div>;
    }

    return (
        <>
            <EventParticipantsModal isOpen={isParticipantsModalOpen} onClose={() => setIsParticipantsModalOpen(false)} participants={participants as User[]} />
            <div className="flex flex-col h-[calc(100vh-5rem)] bg-black"> 
                <ChatHeader event={currentEvent} onBack={onBack} onOpenParticipants={() => setIsParticipantsModalOpen(true)} />
                <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {chatMessages.map((msg) => {
                            const sender = getParticipantById(msg.senderId);
                            const isCurrentUser = msg.senderId === currentUser.id;
                            const isRead = msg.id === readByParticipantMessageId;

                            return (
                                <MessageBubble 
                                    key={msg.id} 
                                    message={msg} 
                                    sender={sender} 
                                    isCurrentUser={isCurrentUser}
                                    isRead={isRead}
                                    reader={otherParticipant}
                                />
                            );
                        })}
                        {isTyping && <TypingIndicator sender={otherParticipant} />}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="p-4 md:p-6 bg-black/80 backdrop-blur-lg border-t border-gray-800">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]"
                            aria-label="Chat input"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="w-12 h-12 flex-shrink-0 bg-[#EC4899] rounded-full flex items-center justify-center text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};