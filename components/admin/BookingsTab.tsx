import React, { useState, useMemo } from 'react';
import { CartItem, User } from '../../types';

interface BookingsTabProps {
    bookedItems: CartItem[];
    onViewUser: (user: User) => void;
    users: User[];
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ bookedItems, onViewUser, users }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const findUserByDetails = (item: CartItem): User | undefined => {
        const guestDetails = item.tableDetails?.guestDetails || item.eventDetails?.guestDetails;
        if (!guestDetails) return undefined;
        return users.find(u => u.email === guestDetails.email || u.name === guestDetails.name);
    };

    const filteredBookings = useMemo(() => {
        const sorted = [...bookedItems].sort((a, b) => (b.bookedTimestamp || 0) - (a.bookedTimestamp || 0));
        if (!searchTerm) return sorted;

        const lowercasedQuery = searchTerm.toLowerCase();
        return sorted.filter(item => {
            const userName = item.tableDetails?.guestDetails?.name || item.eventDetails?.guestDetails?.name || '';
            const promoterName = item.tableDetails?.promoter?.name || '';
            return (
                item.name.toLowerCase().includes(lowercasedQuery) ||
                userName.toLowerCase().includes(lowercasedQuery) ||
                promoterName.toLowerCase().includes(lowercasedQuery)
            );
        });
    }, [searchTerm, bookedItems]);

    return (
        <div className="space-y-6">
            <input 
                type="text" 
                placeholder="Search bookings by user, item, or promoter..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3" 
            />
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                        <tr>
                            <th scope="col" className="px-4 py-3">User</th>
                            <th scope="col" className="px-4 py-3">Item</th>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Promoter</th>
                            <th scope="col" className="px-4 py-3">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(item => {
                            const user = findUserByDetails(item);
                            const promoterName = item.tableDetails?.promoter?.name || 'N/A';
                            const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
                            return (
                                <tr key={item.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800">
                                    <td className="px-4 py-3">
                                        {user ? (
                                            <button onClick={() => onViewUser(user)} className="flex items-center gap-3 group">
                                                <img src={user.profilePhoto} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>
                                                <span className="font-semibold text-white group-hover:underline">{user.name}</span>
                                            </button>
                                        ) : (
                                            <span>{item.tableDetails?.guestDetails?.name || 'N/A'}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{item.name}</td>
                                    <td className="px-4 py-3">{item.date}</td>
                                    <td className="px-4 py-3">{promoterName}</td>
                                    <td className="px-4 py-3 font-semibold text-white">${price?.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                 {filteredBookings.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p>No bookings found.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};