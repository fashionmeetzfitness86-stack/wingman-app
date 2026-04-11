
import React, { useMemo } from 'react';
import { Page, User, GuestlistChat, Venue, Promoter, UserAccessLevel } from '../types';
import { users, bookingHistory } from '../data/mockData';

interface GuestlistChatsPageProps {
  currentUser: User;
  guestlistChats: GuestlistChat[];
  venues: Venue[];
  promoters: Promoter[];
  onViewChat: (chatId: number) => void;
}

export const GuestlistChatsPage: React.FC<GuestlistChatsPageProps> = ({ currentUser, guestlistChats, venues, promoters, onViewChat }) => {

  const myChats = useMemo(() => {
    return guestlistChats.filter(chat => chat.memberIds.includes(currentUser.id));
  }, [currentUser, guestlistChats]);

  return (
    <div className="p-4 md:p-8 animate-fade-in text-white">
      <div className="space-y-4">
        {myChats.length > 0 ? myChats.map(chat => {
          const venue = venues.find(v => v.id === chat.venueId);
          const promoter = promoters.find(p => p.id === chat.promoterId);
          if (!venue || !promoter) return null;

          const otherMembers = chat.memberIds.filter(id => id !== currentUser.id && id !== promoter.id)
            .map(id => users.find(u => u.id === id))
            .filter(Boolean);

          return (
            <button 
              key={chat.id} 
              onClick={() => onViewChat(chat.id)}
              className="w-full flex items-center gap-4 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-left"
            >
              <img src={venue.coverImage} alt={venue.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-grow">
                <p className="font-bold text-white text-lg">{venue.name} Guestlist</p>
                <p className="text-sm text-gray-400">
                  {new Date(chat.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
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
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-white">No Booking Chats</h3>
            <p className="text-gray-400 mt-2">Chats for your confirmed bookings will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
