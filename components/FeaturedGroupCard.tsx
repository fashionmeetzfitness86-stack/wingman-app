
/**
 * FeaturedGroupCard.tsx — Premium featured group card
 * Full-bleed hero image, gradient overlay, refined CTA
 */

import React from 'react';
import { AccessGroup } from '../types';
import { users } from '../data/mockData';

interface FeaturedGroupCardProps {
    group: AccessGroup;
    onJoin: (groupId: number) => void;
    canJoin: boolean;
    joinStatus?: 'none' | 'pending' | 'joined';
    onSelect?: () => void;
}

export const FeaturedGroupCard: React.FC<FeaturedGroupCardProps> = ({
    group, onJoin, canJoin, joinStatus = 'none', onSelect,
}) => {
    const members = group.memberIds
        .map(id => users.find(u => u.id === id))
        .filter(Boolean)
        .slice(0, 4);

    const renderCTA = () => {
        if (!canJoin) return null;
        if (joinStatus === 'joined') {
            return (
                <div className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-black text-green-400"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    ✓ Member
                </div>
            );
        }
        if (joinStatus === 'pending') {
            return (
                <button disabled
                    className="mt-3 w-full py-2.5 rounded-xl text-sm font-black cursor-not-allowed"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Request Sent
                </button>
            );
        }
        return (
            <button
                onClick={e => { e.stopPropagation(); onJoin(group.id); }}
                className="mt-3 w-full py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)', color: '#000' }}>
                Request to Join
            </button>
        );
    };

    return (
        <div
            onClick={onSelect}
            className="relative flex-shrink-0 w-64 sm:w-72 rounded-2xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
            style={{ border: '1px solid rgba(255,255,255,0.08)', height: 380 }}
        >
            {/* Hero image */}
            <img
                src={group.coverImage}
                alt={group.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)' }} />

            {/* Featured badge */}
            <div className="absolute top-3 left-3">
                <span
                    className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full text-white"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                    ✦ Featured
                </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-black text-white leading-tight">{group.name}</h3>
                <p className="text-sm text-gray-300 mt-1 line-clamp-2 leading-relaxed">{group.description}</p>

                {/* Member avatars */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="flex -space-x-2">
                        {members.map(member => member && (
                            <img
                                key={member.id}
                                src={member.profilePhoto}
                                alt={member.name}
                                className="w-7 h-7 rounded-full object-cover border-2 border-black"
                            />
                        ))}
                    </div>
                    <p className="text-xs font-semibold text-gray-400">{group.memberIds.length} members</p>
                </div>

                {renderCTA()}
            </div>
        </div>
    );
};
