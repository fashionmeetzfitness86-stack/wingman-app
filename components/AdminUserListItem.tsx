import React, { useState } from 'react';
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
    onDelete?: (userId: number) => void;
}

export const AdminUserListItem: React.FC<AdminUserListItemProps> = ({
    user, onEdit, onBlock, onViewProfile, onViewAnalytics, onApprove, onReject, onDelete,
}) => {
    // 2-step delete state
    const [deleteStep, setDeleteStep] = useState<0 | 1>(0);

    const getApprovalBadge = (status?: string) => {
        switch (status) {
            case 'approved': return 'bg-[#051A10] text-[#4DB87C] border border-[#0A3A20]';
            case 'rejected': return 'bg-[#1A0505] text-[#D45050] border border-[#3A1010]';
            case 'pending':  return 'bg-[#1A1810] text-[#B89B4D] border border-[#333020]';
            default:         return 'bg-[#0F1014] text-[#5D616B] border border-[#1C1D22]';
        }
    };
    const getAccessLevelColor = (level: string) => {
        switch (level) {
            case 'Access Male':   return 'bg-[#111317] text-[#738596] border border-[#1C2229]';
            case 'Approved Girl': return 'bg-[#171113] text-[#967385] border border-[#291C22]';
            default:              return 'bg-[#0F1014] text-[#5D616B] border border-[#1C1D22]';
        }
    };

    const isProtected = user.role === UserRole.ADMIN || user.role === UserRole.WINGMAN;

    return (
        <div className={`relative rounded-lg overflow-hidden bg-transparent ${user.status === 'blocked' ? 'opacity-50' : ''}`}>
            <div className="relative z-10 w-full bg-[#0F1014] border border-[#1C1D22] rounded-lg p-4 flex items-center gap-4">
                {/* Left: clickable user info */}
                <div onClick={() => onViewProfile(user)} className="flex-grow flex items-center gap-4 text-left cursor-pointer min-w-0">
                    <img className="w-14 h-14 rounded-full object-cover flex-shrink-0" src={user.profilePhoto} alt={user.name} />
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4 items-center min-w-0">
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
                            <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded ${user.status === 'blocked' ? 'bg-[#1A0505] text-[#D45050] border border-[#3A1010]' : 'bg-[#051A10] text-[#4DB87C] border border-[#0A3A20]'}`}>
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

                {/* Right: action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">

                    {/* ── Approve (for pending users) */}
                    {user.approvalStatus === 'pending' && !isProtected && onApprove && (
                        <button
                            onClick={() => onApprove(user.id)}
                            className="px-2 py-1 text-xs font-semibold bg-[#051A10] border border-[#0A3A20] text-[#4DB87C] hover:bg-[#082A1A] rounded transition-colors"
                            title="Approve user"
                        >
                            Approve
                        </button>
                    )}

                    {/* ── Reject (for pending users) */}
                    {user.approvalStatus === 'pending' && !isProtected && onReject && (
                        <button
                            onClick={() => onReject(user.id)}
                            className="px-2 py-1 text-xs font-semibold bg-[#1A0505] border border-[#3A1010] text-[#D45050] hover:bg-[#2A0808] rounded transition-colors"
                            title="Reject user"
                        >
                            Reject
                        </button>
                    )}

                    {/* ── Reverse rejection → Approve (for rejected users) */}
                    {user.approvalStatus === 'rejected' && !isProtected && onApprove && (
                        <button
                            onClick={() => onApprove(user.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: 'rgba(74,222,128,0.1)',
                                border: '1px solid rgba(74,222,128,0.3)',
                                color: '#4ade80',
                            }}
                            title="Reverse rejection — move to Approved"
                        >
                            {/* Check icon inline */}
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Approve
                        </button>
                    )}

                    {/* ── Analytics */}
                    {onViewAnalytics && (
                        <button
                            onClick={() => onViewAnalytics(user)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-md transition-colors"
                            aria-label={`View analytics for ${user.name}`}
                            title="View Analytics"
                        >
                            <ChartBarIcon className="w-5 h-5" />
                        </button>
                    )}

                    {/* ── View profile */}
                    <button
                        onClick={() => onViewProfile(user)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        aria-label={`View profile of ${user.name}`}
                        title="View Profile"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>

                    {/* ── Block / Unblock */}
                    <button
                        onClick={() => onBlock(user)}
                        className="p-2 text-gray-400 hover:bg-gray-800 rounded-md transition-colors"
                        aria-label={user.status === 'blocked' ? `Unblock ${user.name}` : `Block ${user.name}`}
                        title={user.status === 'blocked' ? 'Unblock' : 'Block'}
                    >
                        {user.status === 'blocked'
                            ? <UserPlusIcon className="w-5 h-5 text-green-400" />
                            : <UserMinusIcon className="w-5 h-5 text-yellow-400" />}
                    </button>

                    {/* ── Edit */}
                    <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        aria-label={`Edit user ${user.name}`}
                        title="Edit"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>

                    {/* ── Delete — 2-step confirmation (not for admin) */}
                    {!isProtected && onDelete && (
                        deleteStep === 0 ? (
                            <button
                                onClick={() => setDeleteStep(1)}
                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                aria-label={`Delete user ${user.name}`}
                                title="Delete user"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        ) : (
                            /* Step 2 — inline confirm strip */
                            <div
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg animate-fade-in"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
                            >
                                <span className="text-[10px] font-bold text-red-400 whitespace-nowrap">Delete {user.name.split(' ')[0]}?</span>
                                <button
                                    onClick={() => { onDelete(user.id); setDeleteStep(0); }}
                                    className="px-2 py-0.5 text-[10px] font-black rounded text-white transition-all hover:opacity-80"
                                    style={{ background: '#ef4444' }}
                                    title="Confirm delete"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setDeleteStep(0)}
                                    className="px-2 py-0.5 text-[10px] font-black rounded text-gray-400 hover:text-white transition-colors"
                                    style={{ background: 'rgba(255,255,255,0.06)' }}
                                    title="Cancel"
                                >
                                    No
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};