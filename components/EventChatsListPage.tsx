
import React, { useMemo, useState } from 'react';
// Fix: Imported UserRole to resolve type errors.
import { Page, User, EventChat, Event, UserAccessLevel, GuestlistChat, Venue, Promoter, UserRole } from '../types';
import { users, bookingHistory } from '../data/mockData';

interface EventChatsListPageProps {
  currentUser: User;
  onNavigate: (page: Page, params?: Record<string, any>) => void;
  eventChats: EventChat[];
  guestlistChats: GuestlistChat[];
  allEvents: Event[];
  venues: Venue[];
  promoters: Promoter[];
  allUsers: User[];
}

export const EventChatsListPage: React.FC<EventChatsListPageProps> = ({ currentUser, onNavigate, eventChats, guestlistChats, allEvents, venues, promoters, allUsers }) => {
    const [activeTab, setActiveTab] = useState<'guestlists' | 'events'>('guestlists');

    const myEventChats = useMemo(() => eventChats.filter(chat => chat.memberIds.includes(currentUser.id)), [currentUser.id, eventChats]);
    
    const myGuestlistChats = useMemo(() => {
        return guestlistChats.filter(chat => chat.memberIds.includes(currentUser.id));
    }, [currentUser.id, guestlistChats]);

    const EventChatList = () => (
        <div className="space-y-4">
            {myEventChats.length > 0 ? myEventChats.map(chat => {
                const event = allEvents.find(e => e.id === chat.eventId);
                if (!event) return null;
                const otherMembers = chat.memberIds.filter(id => id !== currentUser.id).map(id => allUsers.find(u => u.id === id)).filter(Boolean);
                return (
                    <button key={chat.id} onClick={() => onNavigate('eventChat', { chatId: chat.id })} className="w-full flex items-center gap-4 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-left">
                        <img src={event.image} alt={event.title} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-grow">
                            <p className="font-bold text-white text-lg">{event.title} Chat</p>
                            <p className="text-sm text-gray-400">{new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            <p className="text-xs text-gray-500 mt-1">{chat.memberIds.length} members</p>
                        </div>
                        <div className="flex -space-x-2">
                            {otherMembers.slice(0, 4).map(member => member && (
                                <img key={member.id} src={member.profilePhoto} alt={member.name} className="w-8 h-8 rounded-full object-cover border-2 border-black" />
                            ))}
                        </div>
                    </button>
                );
            }) : (
                <div className="text-center py-16"><h3 className="text-xl font-semibold text-white">No Event Chats</h3><p className="text-gray-400 mt-2">RSVP to an event to join its chat.</p></div>
            )}
        </div>
    );
    
    const GuestlistChatList = () => (
         <div className="space-y-4">
            {myGuestlistChats.length > 0 ? myGuestlistChats.map(chat => {
              const venue = venues.find(v => v.id === chat.venueId);
              const promoter = promoters.find(p => p.id === chat.promoterId);
              if (!venue || !promoter) return null;
              const otherMembers = chat.memberIds.filter(id => id !== currentUser.id && id !== promoter.id).map(id => allUsers.find(u => u.id === id)).filter(Boolean);
              return (
                <button key={chat.id} onClick={() => onNavigate('guestlistChat', { chatId: chat.id })} className="w-full flex items-center gap-4 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-left">
                  <img src={venue.coverImage} alt={venue.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-grow">
                    <p className="font-bold text-white text-lg">{venue.name} Guestlist</p>
                    <p className="text-sm text-gray-400">{new Date(chat.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-500 mt-1">Managed by {promoter.name}</p>
                  </div>
                  <div className="flex -space-x-2">
                    <img src={promoter.profilePhoto} alt={promoter.name} className="w-8 h-8 rounded-full object-cover border-2 border-black" />
                    {otherMembers.slice(0, 3).map(member => member && (
                        <img key={member.id} src={member.profilePhoto} alt={member.name} className="w-8 h-8 rounded-full object-cover border-2 border-black" />
                    ))}
                  </div>
                </button>
              );
            }) : (
              <div className="text-center py-16"><h3 className="text-xl font-semibold text-white">No Guestlist Chats</h3><p className="text-gray-400 mt-2">Join a guestlist from a venue's page to start a chat.</p></div>
            )}
        </div>
    );

    const showTabs = currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PROMOTER;

    if (showTabs) {
        return (
            <div className="p-4 md:p-8 animate-fade-in text-white">
                <div className="flex border-b border-gray-700 mb-6">
                    <button onClick={() => setActiveTab('guestlists')} className={`px-4 py-2 text-lg font-semibold transition-colors w-1/2 ${activeTab === 'guestlists' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>
                        Guestlists
                    </button>
                    <button onClick={() => setActiveTab('events')} className={`px-4 py-2 text-lg font-semibold transition-colors w-1/2 ${activeTab === 'events' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>
                        Events
                    </button>
                </div>
                {activeTab === 'guestlists' ? <GuestlistChatList /> : <EventChatList />}
            </div>
        );
    }

    // Default view for general users (and now Access Male) who might only have event chats
    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">
            <EventChatList />
        </div>
    );
};
