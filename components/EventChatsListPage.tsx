
import React, { useMemo, useState } from 'react';
// Fix: Imported UserRole to resolve type errors.
import { Page, User, EventChat, Event, UserAccessLevel, GuestlistChat, Venue, Wingman, UserRole, WingmanChat } from '../types';
import { users, bookingHistory } from '../data/mockData';
import { SparkleIcon } from './icons/SparkleIcon';

interface EventChatsListPageProps {
  currentUser: User;
  onNavigate: (page: Page, params?: Record<string, any>) => void;
  eventChats: EventChat[];
  guestlistChats: GuestlistChat[];
  wingmanChats?: WingmanChat[];
  allEvents: Event[];
  venues: Venue[];
  wingmen: Wingman[];
  allUsers: User[];
}

export const EventChatsListPage: React.FC<EventChatsListPageProps> = ({ currentUser, onNavigate, eventChats, guestlistChats, wingmanChats = [], allEvents, venues, wingmen, allUsers }) => {
    
    const myEventChats = useMemo(() => eventChats.filter(chat => chat.memberIds.includes(currentUser.id)), [currentUser.id, eventChats]);
    
    const myGuestlistChats = useMemo(() => {
        return guestlistChats.filter(chat => chat.memberIds.includes(currentUser.id));
    }, [currentUser.id, guestlistChats]);

    const myWingmanChats = useMemo(() => {
        return wingmanChats.filter(chat => chat.userId === currentUser.id);
    }, [currentUser.id, wingmanChats]);

    const showGuestlists = currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.WINGMAN;
    const [activeTab, setActiveTab] = useState<'guestlists' | 'events' | 'wingman'>(showGuestlists ? 'guestlists' : 'wingman');

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
              const wingman = wingmen.find(p => p.id === chat.wingmanId);
              if (!venue || !wingman) return null;
              const otherMembers = chat.memberIds.filter(id => id !== currentUser.id && id !== wingman.id).map(id => allUsers.find(u => u.id === id)).filter(Boolean);
              return (
                <button key={chat.id} onClick={() => onNavigate('guestlistChat', { chatId: chat.id })} className="w-full flex items-center gap-4 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-left">
                  <img src={venue.coverImage} alt={venue.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-grow">
                    <p className="font-bold text-white text-lg">{venue.name} Guestlist</p>
                    <p className="text-sm text-gray-400">{new Date(chat.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-500 mt-1">Managed by {wingman.name}</p>
                  </div>
                  <div className="flex -space-x-2">
                    <img src={wingman.profilePhoto} alt={wingman.name} className="w-8 h-8 rounded-full object-cover border-2 border-black" />
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

    const WingmanChatList = () => (
         <div className="space-y-4">
            {myWingmanChats.length > 0 ? myWingmanChats.map(chat => (
                <button key={chat.id} onClick={() => onNavigate('chatbot', { chatId: chat.id })} className="w-full flex items-center gap-4 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-left">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FFFFFF, #738596, #1A252C)' }}>
                      <SparkleIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-white text-lg">{chat.title}</p>
                    <p className="text-sm text-gray-400">{new Date(chat.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold border capitalize ${chat.status === 'open' ? 'text-green-400 border-green-900/50 bg-green-900/20' : 'text-gray-400 border-gray-700 bg-gray-800'}`}>{chat.status}</span>
                </button>
            )) : (
              <div className="text-center py-16">
                  <h3 className="text-xl font-semibold text-white">No Wingman Chats</h3>
                  <p className="text-gray-400 mt-2">Book a table or ask a question to start a chat with Wingman.</p>
                  <button onClick={() => onNavigate('chatbot')} className="mt-4 px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                      Start New Chat
                  </button>
              </div>
            )}
        </div>
    );

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">
            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto no-scrollbar">
                {showGuestlists && (
                    <button onClick={() => setActiveTab('guestlists')} className={`px-4 py-2 text-lg font-semibold transition-colors flex-shrink-0 ${activeTab === 'guestlists' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>
                        Guestlists
                    </button>
                )}
                <button onClick={() => setActiveTab('events')} className={`px-4 py-2 text-lg font-semibold transition-colors flex-shrink-0 ${activeTab === 'events' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>
                    Events
                </button>
                <button onClick={() => setActiveTab('wingman')} className={`px-4 py-2 text-lg font-semibold transition-colors flex-shrink-0 ${activeTab === 'wingman' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>
                    Wingman
                </button>
            </div>
            {activeTab === 'guestlists' ? <GuestlistChatList /> : activeTab === 'events' ? <EventChatList /> : <WingmanChatList />}
        </div>
    );
};
