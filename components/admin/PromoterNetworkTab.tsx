
import React, { useState, useMemo } from 'react';
import { User, Promoter, CartItem, UserAccessLevel } from '../../types';
import { EyeIcon } from '../icons/FeatureIcons';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface PromoterNetworkTabProps {
    promoter: Promoter;
    users: User[];
    bookedItems: CartItem[];
    onViewUser: (user: User) => void;
}

const UserRow: React.FC<{ user: User; type: 'Referral' | 'Client'; subtext: string; onView: () => void }> = ({ user, type, subtext, onView }) => (
    <tr className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800">
        <td className="px-4 py-3">
            <button onClick={onView} className="flex items-center gap-3 group text-left">
                <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                <div>
                    <span className="font-semibold text-white group-hover:underline block">{user.name}</span>
                    <span className="text-xs text-gray-400">{user.email}</span>
                </div>
            </button>
        </td>
        <td className="px-4 py-3 text-gray-300">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${type === 'Referral' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                {type}
            </span>
        </td>
        <td className="px-4 py-3 text-gray-300 text-sm">
            {subtext}
        </td>
        <td className="px-4 py-3 text-gray-300 text-sm">
             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.accessLevel === UserAccessLevel.APPROVED_GIRL ? 'bg-pink-900/50 text-pink-300' : 'bg-gray-700 text-gray-300'}`}>
                {user.accessLevel}
            </span>
        </td>
        <td className="px-4 py-3">
            <button onClick={onView} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="View Profile">
                <EyeIcon className="w-5 h-5" />
            </button>
        </td>
    </tr>
);

export const PromoterNetworkTab: React.FC<PromoterNetworkTabProps> = ({ promoter, users, bookedItems, onViewUser }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'referrals' | 'clients'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const referrals = useMemo(() => {
        return users.filter(u => u.referredByPromoterId === promoter.id);
    }, [users, promoter.id]);

    const clients = useMemo(() => {
        const clientIds = new Set<number>();
        bookedItems.forEach(item => {
            if (item.tableDetails?.promoter?.id === promoter.id && item.tableDetails.guestDetails) {
                const user = users.find(u => u.email === item.tableDetails?.guestDetails?.email);
                if (user) clientIds.add(user.id);
            }
        });
        // Exclude those who are already counted as referrals if we want distinct lists, but here 'Clients' might overlap
        return users.filter(u => clientIds.has(u.id));
    }, [bookedItems, users, promoter.id]);

    const displayedUsers = useMemo(() => {
        let list: { user: User; type: 'Referral' | 'Client'; subtext: string }[] = [];

        if (activeFilter === 'all' || activeFilter === 'referrals') {
            referrals.forEach(u => {
                list.push({ 
                    user: u, 
                    type: 'Referral', 
                    subtext: `Joined ${u.joinDate}` 
                });
            });
        }

        if (activeFilter === 'all' || activeFilter === 'clients') {
            clients.forEach(u => {
                // Avoid duplicates if showing all
                if (activeFilter === 'all' && list.some(item => item.user.id === u.id)) return;
                
                // Find last booking date
                const userBookings = bookedItems.filter(b => 
                    b.tableDetails?.promoter?.id === promoter.id && 
                    (b.tableDetails.guestDetails?.email === u.email || b.tableDetails.guestDetails?.name === u.name)
                );
                const lastBooking = userBookings.sort((a,b) => (b.bookedTimestamp || 0) - (a.bookedTimestamp || 0))[0];
                const date = lastBooking?.sortableDate || lastBooking?.date || 'N/A';

                list.push({ 
                    user: u, 
                    type: 'Client', 
                    subtext: `Last booked: ${date}` 
                });
            });
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(item => 
                item.user.name.toLowerCase().includes(lower) || 
                item.user.email.toLowerCase().includes(lower)
            );
        }

        return list;
    }, [referrals, clients, activeFilter, searchTerm, bookedItems, promoter.id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <input 
                        type="search" 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-4 focus:ring-[#EC4899] focus:border-[#EC4899]"
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <select 
                        value={activeFilter} 
                        onChange={(e) => setActiveFilter(e.target.value as any)} 
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 appearance-none focus:ring-[#EC4899] focus:border-[#EC4899] pr-8"
                    >
                        <option value="all">All Network</option>
                        <option value="referrals">Referrals</option>
                        <option value="clients">Booked Clients</option>
                    </select>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Relationship</th>
                            <th className="px-4 py-3">Details</th>
                            <th className="px-4 py-3">Access Level</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedUsers.length > 0 ? displayedUsers.map((item, idx) => (
                            <UserRow 
                                key={`${item.user.id}-${idx}`} 
                                user={item.user} 
                                type={item.type} 
                                subtext={item.subtext} 
                                onView={() => onViewUser(item.user)} 
                            />
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No users found in your network.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
