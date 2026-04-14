import React from 'react';
import { User, UserRole } from '../types';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UserMinusIcon } from './icons/UserMinusIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { EyeIcon } from './icons/FeatureIcons';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface AdminUserListItemProps {
    user: User;
    onEdit: (user: User) => void;
    onBlock: (user: User) => void;
    onViewProfile: (user: User) => void;
    onViewAnalytics?: (user: User) => void;
    onApprove?: (userId: number) => void;
    onReject?: (userId: number) => void;
}

export const AdminUserListItem: React.FC<AdminUserListItemProps> = ({ user, onEdit, onBlock, onViewProfile, onViewAnalytics, onApprove, onReject }) => {
    const getApprovalBadge = (status?: string) => {
        switch (status) {
            case 'approved': return 'bg-green-900/50 text-green-300 border border-green-700/50';
            case 'rejected': return 'bg-red-900/50 text-red-400 border border-red-700/50';
            case 'pending':  return 'bg-[#EC4899]/15 text-pink-300 border border-[#EC4899]/40';
            default:         return 'bg-gray-800 text-gray-500 border border-gray-700';
        }
    };
    const getAccessLevelColor = (level: string) => {
        switch (level) {
            case 'Access Male': return 'bg-blue-900/50 text-blue-300';
            case 'Approved Girl': return 'bg-pink-900/50 text-pink-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };
    
    return (
         <div className={`relative rounded-lg overflow-hidden bg-gray-900 ${user.status === 'blocked' ? 'opacity-50' : ''}`}>
            <div
                className="relative z-10 w-full border border-gray-800 rounded-lg p-4 flex items-center gap-4"
            >
                <div onClick={() => onViewProfile(user)} className="flex-grow flex items-center gap-4 text-left cursor-pointer">
                    <img className="w-14 h-14 rounded-full object-cover flex-shrink-0" src={user.profilePhoto} alt={user.name} />
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                            <p className="font-bold text-white truncate">{user.name}</p>
                            <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAccessLevelColor(user.accessLevel)}`}>
                                {user.accessLevel}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-300">{user.role}</p>
                        </div>
                        <div>
                            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${user.status === 'blocked' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                                {user.status === 'blocked' ? 'Blocked' : 'Active'}
                            </span>
                        </div>
                        <div>
                            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getApprovalBadge(user.approvalStatus)}`}>
                                {user.approvalStatus ?? 'unreviewed'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{user.joinDate}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {/* Approve / Reject — only shown for regular users in pending state */}
                    {user.approvalStatus === 'pending'
                        && user.role !== UserRole.ADMIN
                        && user.role !== UserRole.WINGMAN
                        && onApprove && (
                        <button onClick={() => onApprove(user.id)} className="px-2 py-1 text-xs font-bold bg-green-700 hover:bg-green-600 text-white rounded transition-colors" title="Approve user">
                            Approve
                        </button>
                    )}
                    {user.approvalStatus === 'pending'
                        && user.role !== UserRole.ADMIN
                        && user.role !== UserRole.WINGMAN
                        && onReject && (
                        <button onClick={() => onReject(user.id)} className="px-2 py-1 text-xs font-bold bg-red-800 hover:bg-red-700 text-white rounded transition-colors" title="Reject user">
                            Reject
                        </button>
                    )}
                    {onViewAnalytics && (
                        <button onClick={() => onViewAnalytics(user)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-md transition-colors" aria-label={`View analytics for ${user.name}`} title="View Analytics">
                            <ChartBarIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={() => onViewProfile(user)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`View profile of ${user.name}`} title="View Profile">
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onBlock(user)} className="p-2 text-gray-400 hover:bg-gray-800 rounded-md transition-colors" aria-label={user.status === 'blocked' ? `Unblock user ${user.name}` : `Block user ${user.name}`} title={user.status === 'blocked' ? 'Unblock' : 'Block'}>
                        {user.status === 'blocked' ? <UserPlusIcon className="w-5 h-5 text-green-400" /> : <UserMinusIcon className="w-5 h-5 text-yellow-400" />}
                    </button>
                    <button onClick={() => onEdit(user)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`Edit user ${user.name}`} title="Edit">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};