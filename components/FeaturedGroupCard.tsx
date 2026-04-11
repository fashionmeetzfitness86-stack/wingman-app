
import React from 'react';
import { AccessGroup } from '../types';
import { users } from '../data/mockData';

interface FeaturedGroupCardProps {
    group: AccessGroup;
    onJoin: (groupId: number) => void;
    canJoin: boolean;
    joinStatus?: 'none' | 'pending' | 'joined';
}

export const FeaturedGroupCard: React.FC<FeaturedGroupCardProps> = ({ group, onJoin, canJoin, joinStatus = 'none' }) => {
    
    const members = group.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean).slice(0, 4);

    const renderButton = () => {
        if (!canJoin) return null;
        
        if (joinStatus === 'joined') {
            return (
                <button 
                  disabled
                  className="mt-4 w-full bg-green-600 text-white font-bold py-2.5 rounded-lg cursor-default"
                >
                    Member
                </button>
            );
        }
        if (joinStatus === 'pending') {
            return (
                <button 
                  disabled
                  className="mt-4 w-full bg-gray-700 text-gray-300 font-bold py-2.5 rounded-lg cursor-not-allowed"
                >
                    Request Sent
                </button>
            );
        }
        return (
            <button 
              onClick={() => onJoin(group.id)}
              className="mt-4 w-full bg-amber-400 text-black font-bold py-2.5 rounded-lg hover:bg-amber-300 transition-colors"
              aria-label={`Request to join group: ${group.name}`}
            >
                Request to Join
            </button>
        );
    };

    return (
        <div className="relative flex-shrink-0 w-72 h-96 rounded-2xl overflow-hidden group text-left border border-gray-800">
            <img src={group.coverImage} alt={group.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="text-2xl font-bold text-white mt-1">{group.name}</h3>
                <p className="text-sm text-gray-300 mt-1 h-10 line-clamp-2">{group.description}</p>
                
                <div className="flex items-center gap-2 mt-4">
                     <div className="flex -space-x-2">
                        {members.map(member => member && (
                            <img key={member.id} src={member.profilePhoto} alt={member.name} className="w-8 h-8 rounded-full object-cover border-2 border-black" />
                        ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-300">{group.memberIds.length} members</p>
                </div>

                {renderButton()}
            </div>
        </div>
    );
};
