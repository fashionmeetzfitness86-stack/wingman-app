
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SendIcon } from './icons/SendIcon';
import { User, Promoter, GuestlistChatMessage, GuestlistChat, Venue, CartItem } from '../types';
import { ParticipantsModal } from './modals/ParticipantsModal';
import { UsersIcon } from './icons/UsersIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ClockIcon } from './icons/ClockIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';

interface GuestlistChatPageProps {
  chatId: number;
  currentUser: User;
  messages: GuestlistChatMessage[];
  allUsers: User[];
  allPromoters: Promoter[];
  guestlistChats: GuestlistChat[];
  venues: Venue[]; 
  onSendMessage: (chatId: number, text: string) => void;
  onBack: () => void;
  bookedItems?: CartItem[];
}

const ChatHeader: React.FC<{ venue: Venue, chat: GuestlistChat, onBack: () => void, onOpenParticipants: () => void, bookedItems?: CartItem[], currentUserId: number }> = ({ venue, chat, onBack, onOpenParticipants, bookedItems, currentUserId }) => {
    const date = new Date(chat.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    const bookingInfo = useMemo(() => {
        if (!bookedItems) return null;
        // Find booking for this chat context
        // Matching logic: venueId, promoterId, date
        const booking = bookedItems.find(item => {
            if (item.type === 'table' && item.tableDetails) {
                 return item.tableDetails.venue.id === venue.id && 
                        item.tableDetails.promoter?.id === chat.promoterId &&
                        (item.sortableDate === chat.date || item.date === chat.date);
            }
            if (item.type === 'guestlist' && item.guestlistDetails) {
                 return item.guestlistDetails.venue.id === venue.id &&
                        item.guestlistDetails.promoter.id === chat.promoterId &&
                        (item.sortableDate === chat.date || item.date === chat.date);
            }
            return false;
        });

        if (!booking) return null;

        if (booking.type === 'table') {
            return {
                title: booking.tableDetails?.tableOption?.name || 'Table Reservation',
                subtitle: `Guests: ${booking.tableDetails?.numberOfGuests || 0}`
            };
        }
        if (booking.type === 'guestlist') {
             return {
                title: 'Guestlist Access',
                subtitle: `Status: ${booking.guestlistDetails?.status || 'Pending'}`
            };
        }
        return null;
    }, [bookedItems, venue.id, chat.promoterId, chat.date]);


    return (
        <div className="flex-shrink-0 p-3 pt-4 border-b border-gray-800 bg-black/80 backdrop-blur-lg sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Go back">
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>
                <img src={venue.coverImage} alt={venue.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-grow min-w-0">
                    <h2 className="font-bold text-white truncate text-lg">{bookingInfo ? bookingInfo.title : `${venue.name} Guestlist`}</h2>
                    <p className="text-xs text-gray-400">{date} • {venue.name}</p>
                </div>
                <button onClick={onOpenParticipants} className="flex-shrink-0 p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="View participants">
                    <UsersIcon className="w-6 h-6 text-white" />
                </button>
            </div>
            
            {bookingInfo && (
                <div className="mt-2 px-1">
                    <span className="text-xs font-semibold text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded border border-amber-900/40">
                        {bookingInfo.subtitle}
                    </span>
                </div>
            )}

            <div className="mt-3 bg-gray-900/50 p-3 rounded-lg text-xs text-gray-300 space-y-1.5 border border-gray-800">
                <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-gray-500" /><span>Meet-up: <span className="font-semibold text-white">{chat.meetupTime || '11:00 PM'}</span></span></div>
                <div className="flex items-center gap-2"><LocationMarkerIcon className="w-4 h-4 text-gray-500" /><span>Address: <span className="font-semibold text-white">{venue.location}</span></span></div>
            </div>
        </div>
    );
};


const MessageBubble: React.FC<{ message: GuestlistChatMessage, sender: User | Promoter | undefined, isCurrentUser: boolean }> = ({ message, sender, isCurrentUser }) => (
    <div className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
        {!isCurrentUser && sender && <img src={sender.profilePhoto} alt={`Avatar of ${sender.name}`} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
        <div className={`rounded-xl p-3 max-w-xs md:max-w-md ${isCurrentUser ? 'bg-blue-600 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
            {sender && !isCurrentUser && (
                 <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm text-[#EC4899]">{sender.name}</p>
                    <p className="text-xs text-gray-400">{message.timestamp}</p>
                </div>
            )}
            <p className="text-white whitespace-pre-wrap text-sm">{message.text}</p>
        </div>
    </div>
);

export const GuestlistChatPage: React.FC<GuestlistChatPageProps> = ({ chatId, currentUser, messages, allUsers, allPromoters, guestlistChats, venues, onSendMessage, onBack, bookedItems }) => {
    const [inputValue, setInputValue] = useState('');
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const allKnownUsers = useMemo(() => [...allUsers, ...allPromoters], [allUsers, allPromoters]);

    const currentChat = useMemo(() => guestlistChats.find(c => c.id === chatId), [chatId, guestlistChats]);
    const currentVenue = useMemo(() => venues.find(v => v.id === currentChat?.venueId), [currentChat, venues]);

    const participants = useMemo(() => {
        if (!currentChat) return [];
        return currentChat.memberIds.map(id => allKnownUsers.find(p => p.id === id)).filter((p): p is User | Promoter => !!p);
    }, [currentChat, allKnownUsers]);

    const getParticipantById = (id: number) => allKnownUsers.find(p => p.id === id);
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
    
    if (!currentChat || !currentVenue) {
        return <div className="p-8 text-center text-gray-400">Chat not found.</div>;
    }

    return (
        <>
            <ParticipantsModal isOpen={isParticipantsModalOpen} onClose={() => setIsParticipantsModalOpen(false)} participants={participants} />
            <div className="flex flex-col h-[calc(100vh-5rem)] bg-black animate-fade-in"> 
                <ChatHeader 
                    venue={currentVenue} 
                    chat={currentChat} 
                    onBack={onBack} 
                    onOpenParticipants={() => setIsParticipantsModalOpen(true)} 
                    bookedItems={bookedItems}
                    currentUserId={currentUser.id}
                />
                <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {chatMessages.map((msg) => {
                            const sender = getParticipantById(msg.senderId);
                            const isCurrentUser = msg.senderId === currentUser.id;
                            return <MessageBubble key={msg.id} message={msg} sender={sender} isCurrentUser={isCurrentUser} />
                        })}
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
        </>
    );
};
