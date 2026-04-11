import React, { useState } from 'react';
import { Promoter, User, Page, AccessGroup } from '../types';
import { AdminPromoterListItem } from './AdminPromoterListItem';
import { AdminUserListItem } from './AdminUserListItem';
import { CheckIcon } from './icons/CheckIcon';

interface AdminDashboardProps {
    users: User[];
    promoters: Promoter[];
    pendingGroups: AccessGroup[];
    onEditUser: (user: User) => void;
    onBlockUser: (userId: number) => void;
    onEditPromoter: (promoter: Promoter) => void;
    onApproveGroup: (groupId: number) => void;
    onNavigate: (page: Page) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, promoters, pendingGroups, onEditUser, onBlockUser, onEditPromoter, onApproveGroup, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'promoters' | 'users' | 'management'>('promoters');

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">
            <div className="flex border-b border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('promoters')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'promoters' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    Promoters ({promoters.length})
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'users' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    Users ({users.length})
                </button>
                 <button 
                    onClick={() => setActiveTab('management')}
                    className={`relative px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'management' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    Management
                    {pendingGroups.length > 0 && (
                        <span className="absolute top-1 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">{pendingGroups.length}</span>
                    )}
                </button>
            </div>

            <div>
                {activeTab === 'promoters' && (
                    <div className="space-y-3">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => onNavigate('promoterApplication')} className="bg-amber-400 text-black font-bold py-2 px-4 rounded-lg text-sm">Add Promoter</button>
                        </div>
                        {promoters.map(promoter => <AdminPromoterListItem key={promoter.id} promoter={promoter} onEdit={onEditPromoter} />)}
                    </div>
                )}
                {activeTab === 'users' && (
                    <div className="space-y-3">
                         <div className="flex justify-end mb-4">
                            <button className="bg-amber-400 text-black font-bold py-2 px-4 rounded-lg text-sm">Add User</button>
                        </div>
                        {users.map(user => <AdminUserListItem key={user.id} user={user} onEdit={onEditUser} onBlock={onBlockUser} />)}
                    </div>
                )}
                {activeTab === 'management' && (
                     <div>
                        <h3 className="text-xl font-bold mb-4">Pending Group Approvals</h3>
                        <div className="space-y-3">
                            {pendingGroups.length > 0 ? pendingGroups.map(group => (
                                <div key={group.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
                                    <img className="w-16 h-16 rounded-lg object-cover" src={group.coverImage} alt={group.name} />
                                    <div className="flex-grow">
                                        <p className="font-bold text-white">{group.name}</p>
                                        <p className="text-sm text-gray-400 line-clamp-2">{group.description}</p>
                                    </div>
                                    <button onClick={() => onApproveGroup(group.id)} className="flex items-center gap-2 bg-green-500/20 text-green-400 font-bold py-2 px-4 rounded-lg text-sm hover:bg-green-500/40">
                                        <CheckIcon className="w-5 h-5"/>
                                        Approve
                                    </button>
                                </div>
                            )) : <p className="text-gray-500 text-center py-8">No groups are pending approval.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};