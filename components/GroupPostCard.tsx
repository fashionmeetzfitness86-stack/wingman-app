import React from 'react';
import { GroupPost, User, Promoter, UserRole } from '../types';
import { HeartIcon } from './icons/HeartIcon';

interface GroupPostCardProps {
    post: GroupPost;
    author: User | Promoter;
    currentUser: User;
    onToggleLike: (postId: number) => void;
}

export const GroupPostCard: React.FC<GroupPostCardProps> = ({ post, author, currentUser, onToggleLike }) => {
    
    const isLiked = post.likes.includes(currentUser.id);

    return (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4 flex items-center gap-3">
                <img src={author.profilePhoto} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <p className="font-bold text-white">{author.name}</p>
                    <p className="text-xs text-gray-400">{post.timestamp}</p>
                </div>
            </div>

            <div className="px-4 pb-4">
                <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
            </div>
            
            {post.image && (
                <img src={post.image} alt="Post content" className="w-full h-auto max-h-96 object-cover" />
            )}

            <div className="p-2 border-t border-gray-800 flex items-center gap-2">
                <button 
                    onClick={() => onToggleLike(post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
                >
                    <HeartIcon className="w-5 h-5" isFilled={isLiked} />
                    <span className="text-sm font-semibold">{post.likes.length}</span>
                </button>
            </div>
        </div>
    );
};