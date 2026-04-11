
import React from 'react';
import { AccessGroup, GroupPost, User, UserRole, Promoter, GroupJoinRequest } from '../types';
import { promoters, users } from '../data/mockData';
import { GroupPostCard } from './GroupPostCard';
import { SendIcon } from './icons/SendIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';

interface AccessGroupFeedPageProps {
    groupId: number;
    currentUser: User;
    allPosts: GroupPost[];
    allGroups: AccessGroup[];
    onToggleLike: (postId: number) => void;
    groupJoinRequests: GroupJoinRequest[];
    onApproveRequest: (requestId: number) => void;
    onRejectRequest: (requestId: number) => void;
    users: User[];
}

const allAuthors = [...promoters, ...users.filter(u => u.role === UserRole.ADMIN)];

export const AccessGroupFeedPage: React.FC<AccessGroupFeedPageProps> = ({ groupId, currentUser, allPosts, allGroups, onToggleLike, groupJoinRequests, onApproveRequest, onRejectRequest, users }) => {
    
    const group = allGroups.find(g => g.id === groupId);
    const posts = allPosts.filter(p => p.groupId === groupId).sort((a, b) => b.id - a.id);
    
    if (!group) {
        return <div className="p-8 text-center text-red-500">Group not found.</div>;
    }

    const canPost = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PROMOTER;
    const isCreator = currentUser.id === group.creatorId;

    const pendingRequests = groupJoinRequests.filter(r => r.groupId === groupId && r.status === 'pending');

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in">
            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                {isCreator && pendingRequests.length > 0 && (
                    <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-white mb-3">Membership Requests ({pendingRequests.length})</h3>
                        <div className="space-y-3">
                            {pendingRequests.map(request => {
                                const requestingUser = users.find(u => u.id === request.userId);
                                if (!requestingUser) return null;
                                return (
                                    <div key={request.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <img src={requestingUser.profilePhoto} alt={requestingUser.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-bold text-white text-sm">{requestingUser.name}</p>
                                                <p className="text-xs text-gray-400">Request pending</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => onApproveRequest(request.id)} className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/40 transition-colors" title="Approve">
                                                <CheckIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => onRejectRequest(request.id)} className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors" title="Reject">
                                                <CloseIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {posts.map(post => {
                        const author = allAuthors.find(a => a.id === post.authorId);
                        return author ? (
                            <GroupPostCard 
                                key={post.id} 
                                post={post} 
                                author={author} 
                                currentUser={currentUser} 
                                onToggleLike={onToggleLike} 
                            />
                        ) : null;
                    })}
                    {posts.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No posts yet. Be the first to share an update!</p>
                    )}
                </div>
            </div>

            {canPost && (
                 <div className="p-4 md:p-6 bg-black border-t border-gray-800">
                    <form className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Share an update..."
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                            aria-label="New post input"
                        />
                        <button
                            type="submit"
                            className="w-12 h-12 flex-shrink-0 bg-amber-400 rounded-full flex items-center justify-center text-black"
                            aria-label="Send message"
                        >
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
