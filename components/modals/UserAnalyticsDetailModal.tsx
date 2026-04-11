import React, { useState, useMemo } from 'react';
import { User, UserAccessLevel, CartItem } from '../../types';
import { Modal } from '../ui/Modal';

interface UserAnalyticsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessLevel: UserAccessLevel | null;
  users: User[];
  bookedItems: CartItem[];
  onViewUser: (user: User) => void;
}

export const UserAnalyticsDetailModal: React.FC<UserAnalyticsDetailModalProps> = ({ isOpen, onClose, accessLevel, users, bookedItems, onViewUser }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!accessLevel) return [];
        return users.filter(u => 
            u.accessLevel === accessLevel &&
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, accessLevel, searchTerm]);
    
    const stats = useMemo(() => {
        const totalUsers = filteredUsers.length;
        let totalSpend = 0;
        let totalBookings = 0;
        
        const userEmails = new Set(filteredUsers.map(u => u.email));

        bookedItems.forEach(item => {
            const guestEmail = item.tableDetails?.guestDetails?.email || item.eventDetails?.guestDetails?.email;
            if (guestEmail && userEmails.has(guestEmail)) {
                const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                totalSpend += price || 0;
                totalBookings++;
            }
        });

        return { totalUsers, totalSpend, totalBookings };
    }, [filteredUsers, bookedItems]);

    if (!isOpen || !accessLevel) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Analytics: ${accessLevel}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Total Users</p>
                        <p className="text-xl font-bold text-white">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Total Spend</p>
                        <p className="text-xl font-bold text-white">${stats.totalSpend.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Total Bookings</p>
                        <p className="text-xl font-bold text-white">{stats.totalBookings}</p>
                    </div>
                </div>
                 <input 
                    type="search"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
                />
                 <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {filteredUsers.map(user => (
                        <button 
                            key={user.id}
                            onClick={() => onViewUser(user)}
                            className="w-full flex items-center gap-3 p-2 bg-gray-900 rounded-lg hover:bg-gray-800"
                        >
                            <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                            <div className="text-left">
                                <p className="font-semibold text-white">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
};
