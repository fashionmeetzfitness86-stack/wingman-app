


import React, { useState, useMemo } from 'react';
import { User, Itinerary, FriendZoneChat, Promoter } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UserMinusIcon } from './icons/UserMinusIcon';
import { RouteIcon } from './icons/RouteIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChatIcon } from './icons/ChatIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StarIcon } from './icons/StarIcon';

interface FriendsZonePageProps {
    currentUser: User;
    allUsers: User[];
    allItineraries: Itinerary[];
    onNavigate: (page: any, params?: any) => void;
    onAddFriend: (userId: number) => void;
    onRemoveFriend: (userId: number) => void;
    onViewProfile: (user: User) => void;
    friendZoneChats: FriendZoneChat[];
    onCreateChat: (name: string) => void;
    onDeleteChat: (chatId: number) => void;
    onOpenChat: (chatId: number) => void;
}

const FriendCard: React.FC<{ user: User, onRemove: () => void, onView: () => void }> = ({ user, onRemove, onView }) => (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 flex items-center justify-between">
        <button onClick={onView} className="flex items-center gap-3 text-left flex-grow">
            <img src={user.profilePhoto} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-xs text-gray-400">@{user.instagramHandle || 'user'}</p>
            </div>
        </button>
        <button 
            onClick={onRemove} 
            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            aria-label="Remove friend"
        >
            <UserMinusIcon className="w-5 h-5" />
        </button>
    </div>
);

const UserSearchCard: React.FC<{ user: User, onAdd: () => void, isAdded: boolean, onView: () => void }> = ({ user, onAdd, isAdded, onView }) => (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 flex items-center justify-between">
        <button onClick={onView} className="flex items-center gap-3 text-left flex-grow">
            <img src={user.profilePhoto} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.city || 'Miami'}</p>
            </div>
        </button>
        {!isAdded && (
            <button 
                onClick={onAdd} 
                className="p-2 bg-[#EC4899] rounded-full text-white hover:bg-[#d8428a] transition-colors"
                aria-label="Add friend"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
        )}
    </div>
);

const SharedItineraryCard: React.FC<{ itinerary: Itinerary, creator: User }> = ({ itinerary, creator }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-left transition-colors hover:bg-gray-800">
        <div className="flex items-center gap-3 mb-3">
            <img src={creator.profilePhoto} alt={creator.name} className="w-8 h-8 rounded-full object-cover" />
            <p className="text-sm text-gray-300"><span className="font-bold text-white">{creator.name}</span> shared an itinerary</p>
        </div>
        <h3 className="font-bold text-white text-lg">{itinerary.title}</h3>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{itinerary.description}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(itinerary.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <RouteIcon className="w-4 h-4" />
                <span>{itinerary.items.length} stops</span>
            </div>
        </div>
    </div>
);

const FriendZoneChatCard: React.FC<{ chat: FriendZoneChat, onOpen: () => void, onDelete: () => void, currentUser: User }> = ({ chat, onOpen, onDelete, currentUser }) => {
    const activePromoterCount = chat.promoterIds?.length || 0;
    
    return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 flex items-center justify-between group transition-colors hover:border-[#EC4899]/30">
        <button onClick={onOpen} className="flex items-center gap-4 text-left flex-grow">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-amber-400 relative">
                <ChatIcon className="w-6 h-6" />
                {activePromoterCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-[#EC4899] p-1 rounded-full border-2 border-gray-900" title="Promoter in Chat">
                        <StarIcon className="w-3 h-3 text-white fill-current" />
                    </div>
                )}
            </div>
            <div>
                <p className="font-bold text-white text-lg">{chat.name}</p>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{chat.memberIds.length} participants</p>
                    {activePromoterCount > 0 && (
                        <span className="text-[10px] bg-[#EC4899]/20 text-[#EC4899] px-1.5 py-0.5 rounded font-bold uppercase">
                            {activePromoterCount > 1 ? `${activePromoterCount} Promoters` : 'Promoter Active'}
                        </span>
                    )}
                </div>
            </div>
        </button>
        {chat.creatorId === currentUser.id && (
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors opacity-50 group-hover:opacity-100"
                aria-label="Delete chat"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        )}
    </div>
)};

export const FriendsZonePage: React.FC<FriendsZonePageProps> = ({ currentUser, allUsers, allItineraries, onNavigate, onAddFriend, onRemoveFriend, onViewProfile, friendZoneChats, onCreateChat, onDeleteChat, onOpenChat }) => {
    const [activeTab, setActiveTab] = useState<'chats' | 'circle' | 'find' | 'activity'>('chats');
    const [searchTerm, setSearchTerm] = useState('');
    const [newChatName, setNewChatName] = useState('');
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const friendsList = useMemo(() => {
        const friendIds = currentUser.friends || [];
        return allUsers.filter(u => friendIds.includes(u.id));
    }, [currentUser.friends, allUsers]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return allUsers.filter(u => 
            u.id !== currentUser.id &&
            (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             u.instagramHandle?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [allUsers, searchTerm, currentUser.id]);

    const sharedItineraries = useMemo(() => {
        const friendIds = currentUser.friends || [];
        return allItineraries.filter(it => friendIds.includes(it.creatorId) && it.isPublic);
    }, [allItineraries, currentUser.friends]);

    const myChats = useMemo(() => {
        return friendZoneChats.filter(c => c.memberIds.includes(currentUser.id));
    }, [friendZoneChats, currentUser.id]);

    const friendCount = friendsList.length;
    const MAX_FRIENDS = 25;

    const handleCreateChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newChatName.trim()) {
            onCreateChat(newChatName.trim());
            setNewChatName('');
            setIsCreatingChat(false);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
            <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm font-semibold">
                <ChevronLeftIcon className="w-5 h-5"/>
                Back to Home
            </button>

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Friends Zone</h1>
                <p className="text-gray-400 text-sm">Build your inner circle. Share plans. Party together.</p>
                
                <div className="mt-4 inline-flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
                    <UsersIcon className={`w-5 h-5 ${friendCount >= MAX_FRIENDS ? 'text-red-400' : 'text-green-400'}`} />
                    <span className="font-bold text-sm">{friendCount} / {MAX_FRIENDS} Friends</span>
                </div>
            </div>

            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('chats')}
                    className={`flex-shrink-0 px-4 py-2 text-sm md:text-lg font-semibold transition-colors ${activeTab === 'chats' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}
                >
                    Chat Rooms
                </button>
                <button 
                    onClick={() => setActiveTab('circle')}
                    className={`flex-shrink-0 px-4 py-2 text-sm md:text-lg font-semibold transition-colors ${activeTab === 'circle' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}
                >
                    My Circle
                </button>
                <button 
                    onClick={() => setActiveTab('find')}
                    className={`flex-shrink-0 px-4 py-2 text-sm md:text-lg font-semibold transition-colors ${activeTab === 'find' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}
                >
                    Find Friends
                </button>
                <button 
                    onClick={() => setActiveTab('activity')}
                    className={`flex-shrink-0 px-4 py-2 text-sm md:text-lg font-semibold transition-colors ${activeTab === 'activity' ? 'text-[#EC4899] border-b-2 border-[#EC4899]' : 'text-gray-400'}`}
                >
                    Activity
                </button>
            </div>

            {activeTab === 'chats' && (
                <div className="space-y-4">
                    {!isCreatingChat ? (
                        <button 
                            onClick={() => setIsCreatingChat(true)}
                            className="w-full bg-[#EC4899] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#d8428a] transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Create New Chat Room
                        </button>
                    ) : (
                        <form onSubmit={handleCreateChatSubmit} className="bg-gray-900 p-4 rounded-lg border border-gray-800 space-y-3">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">New Chat Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g., Weekend Plans, Birthday Bash" 
                                value={newChatName}
                                onChange={(e) => setNewChatName(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsCreatingChat(false)} className="flex-1 bg-gray-700 text-white font-bold py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-400">Create</button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-3">
                        {myChats.length > 0 ? (
                            myChats.map(chat => (
                                <FriendZoneChatCard 
                                    key={chat.id}
                                    chat={chat}
                                    onOpen={() => onOpenChat(chat.id)}
                                    onDelete={() => onDeleteChat(chat.id)}
                                    currentUser={currentUser}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No active chat rooms.</p>
                                <p className="text-xs text-gray-600 mt-1">Start a chat to plan with friends.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'circle' && (
                <div className="space-y-4">
                    {friendsList.length > 0 ? (
                        friendsList.map(friend => (
                            <FriendCard 
                                key={friend.id} 
                                user={friend} 
                                onRemove={() => onRemoveFriend(friend.id)}
                                onView={() => onViewProfile(friend)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-dashed border-gray-800">
                            <p className="text-gray-500">Your circle is empty.</p>
                            <button onClick={() => setActiveTab('find')} className="mt-4 text-[#EC4899] font-bold text-sm hover:underline">Find friends to add</button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'find' && (
                <div className="space-y-4">
                    <input 
                        type="search" 
                        placeholder="Search by name or handle..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]"
                    />
                    
                    {friendCount >= MAX_FRIENDS && (
                        <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">You've reached the maximum of 25 friends. Remove someone to add more.</p>
                    )}

                    <div className="space-y-3">
                        {searchResults.map(user => (
                            <UserSearchCard 
                                key={user.id} 
                                user={user} 
                                isAdded={(currentUser.friends || []).includes(user.id)}
                                onAdd={() => onAddFriend(user.id)}
                                onView={() => onViewProfile(user)}
                            />
                        ))}
                        {searchTerm && searchResults.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No users found.</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="space-y-4">
                    {sharedItineraries.length > 0 ? (
                        sharedItineraries.map(itinerary => {
                            const creator = allUsers.find(u => u.id === itinerary.creatorId);
                            if (!creator) return null;
                            return <SharedItineraryCard key={itinerary.id} itinerary={itinerary} creator={creator} />;
                        })
                    ) : (
                        <p className="text-center text-gray-500 py-12">No shared activity from friends yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};
