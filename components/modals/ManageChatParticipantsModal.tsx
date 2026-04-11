
import React, { useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { User, FriendZoneChat } from '../../types';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { LeaveIcon } from '../icons/LeaveIcon';

interface ManageChatParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: FriendZoneChat;
  currentUser: User;
  allUsers: User[];
  onAddMember: (userId: number) => void;
  onRemoveMember: (userId: number) => void;
  onLeaveChat: () => void;
}

export const ManageChatParticipantsModal: React.FC<ManageChatParticipantsModalProps> = ({
  isOpen,
  onClose,
  chat,
  currentUser,
  allUsers,
  onAddMember,
  onRemoveMember,
  onLeaveChat,
}) => {
  const isCreator = chat.creatorId === currentUser.id;

  const currentMembers = useMemo(() => {
    return chat.memberIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
  }, [chat.memberIds, allUsers]);

  const availableFriends = useMemo(() => {
    const friendIds = currentUser.friends || [];
    return allUsers.filter(u => friendIds.includes(u.id) && !chat.memberIds.includes(u.id));
  }, [currentUser.friends, allUsers, chat.memberIds]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Participants">
      <div className="space-y-6">
        
        {/* Current Members List */}
        <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Members ({currentMembers.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {currentMembers.map(user => (
                    <div key={user.id} className="flex items-center justify-between bg-gray-800 p-2 rounded-lg">
                        <div className="flex items-center gap-3">
                            <img src={user.profilePhoto} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                            <span className="text-white font-medium">{user.name} {user.id === chat.creatorId && <span className="text-xs text-amber-400 ml-1">(Admin)</span>}</span>
                        </div>
                        {isCreator && user.id !== currentUser.id && (
                            <button 
                                onClick={() => onRemoveMember(user.id)}
                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                aria-label={`Remove ${user.name}`}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Add Friends Section (Creator Only) */}
        {isCreator && (
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Add Friends</h3>
                {availableFriends.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {availableFriends.map(user => (
                            <button 
                                key={user.id} 
                                onClick={() => onAddMember(user.id)}
                                className="w-full flex items-center justify-between bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <img src={user.profilePhoto} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                    <span className="text-white font-medium">{user.name}</span>
                                </div>
                                <div className="bg-[#EC4899] p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlusIcon className="w-4 h-4" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">No friends available to add.</p>
                )}
            </div>
        )}

        {/* Leave Chat Button (Non-Creator Only) */}
        {!isCreator && (
            <div className="border-t border-gray-800 pt-4">
                <button 
                    onClick={onLeaveChat}
                    className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-400 font-bold py-3 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                    <LeaveIcon className="w-5 h-5" />
                    Leave Chat
                </button>
            </div>
        )}
      </div>
    </Modal>
  );
};
