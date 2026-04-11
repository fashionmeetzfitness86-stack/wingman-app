import React, { useState, useMemo } from 'react';
import { Event, User } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { SendIcon } from '../icons/SendIcon';
import { CheckIcon } from '../icons/CheckIcon';

interface ShareEventModalProps {
    event: Event;
    onClose: () => void;
    currentUser: User;
    allUsers: User[];
    onSendInvites: (eventId: number, userIds: number[]) => void;
}

export const ShareEventModal: React.FC<ShareEventModalProps> = ({ event, onClose, currentUser, allUsers, onSendInvites }) => {
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const availableUsers = useMemo(() => {
        return allUsers.filter(user => 
            user.id !== currentUser.id &&
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, currentUser.id, searchTerm]);

    const handleToggleUser = (userId: number) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSend = () => {
        const originalEventId = typeof event.id === 'string' ? parseInt(event.id.split('-')[0], 10) : event.id;
        onSendInvites(originalEventId, selectedUserIds);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-event-title"
            onClick={onClose}
        >
            <div
                className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h2 id="share-event-title" className="text-xl font-bold text-white">Invite Friends to "{event.title}"</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#50B6FF] focus:border-[#50B6FF]"
                        />
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {availableUsers.map(user => (
                            <button
                                key={user.id}
                                onClick={() => handleToggleUser(user.id)}
                                className="w-full flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                <div className="flex-grow text-left">
                                    <p className="font-semibold text-white">{user.name}</p>
                                    {user.instagramHandle && <p className="text-xs text-gray-400">@{user.instagramHandle}</p>}
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedUserIds.includes(user.id) ? 'bg-[#50B6FF] border-[#50B6FF]' : 'border-gray-600'}`}>
                                    {selectedUserIds.includes(user.id) && <CheckIcon className="w-4 h-4 text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-gray-800 bg-black/30 rounded-b-xl">
                    <button
                        onClick={handleSend}
                        disabled={selectedUserIds.length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-[#50B6FF] text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#50B6FF] disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <SendIcon className="w-5 h-5" />
                        Send Invite{selectedUserIds.length > 1 ? 's' : ''} ({selectedUserIds.length})
                    </button>
                </div>
            </div>
        </div>
    );
};