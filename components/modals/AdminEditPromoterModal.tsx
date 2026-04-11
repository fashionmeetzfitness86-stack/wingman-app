
import React, { useState, useEffect } from 'react';
import { Promoter, User } from '../../types';
import { venues } from '../../data/mockData';
import { CloseIcon } from '../icons/CloseIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { StarIcon } from '../icons/StarIcon';

interface AdminEditPromoterModalProps {
  data: { promoter: Promoter; user: User } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (promoter: Promoter, user: User) => void;
}

export const AdminEditPromoterModal: React.FC<AdminEditPromoterModalProps> = ({ data, isOpen, onClose, onSave }) => {
    const [editedPromoter, setEditedPromoter] = useState<Promoter | null>(null);
    const [editedUser, setEditedUser] = useState<User | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (data) {
            setEditedPromoter(data.promoter);
            setEditedUser(data.user);
            setErrors({});
        }
    }, [data]);
    
    const handleVenueToggle = (venueId: number) => {
        if (!editedPromoter) return;
        const newAssignedVenueIds = editedPromoter.assignedVenueIds.includes(venueId)
            ? editedPromoter.assignedVenueIds.filter(id => id !== venueId)
            : [...editedPromoter.assignedVenueIds, venueId];
        setEditedPromoter({ ...editedPromoter, assignedVenueIds: newAssignedVenueIds });
        
        if (newAssignedVenueIds.length > 0) {
             setErrors(prev => ({...prev, assignedVenueIds: ''}));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!editedPromoter?.name.trim()) newErrors.name = "Name is required.";
        if (!editedPromoter?.handle.trim()) newErrors.handle = "Handle is required.";
        if (!editedPromoter?.bio.trim()) newErrors.bio = "Bio is required.";
        if (!editedPromoter?.city.trim()) newErrors.city = "City is required.";
        
        if (!editedUser?.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(editedUser.email)) {
            newErrors.email = "Email is invalid.";
        }
        
        if (!editedUser?.phoneNumber?.trim()) newErrors.phoneNumber = "Phone number is required.";

        if (!editedPromoter?.assignedVenueIds || editedPromoter.assignedVenueIds.length === 0) {
            newErrors.assignedVenueIds = "At least one venue must be assigned.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveChanges = () => {
        if (validate() && editedPromoter && editedUser) {
            onSave(editedPromoter, editedUser);
        }
    };
  
    if (!isOpen || !editedPromoter || !editedUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
        <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Edit Promoter: {editedPromoter.name}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
                {/* Profile Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={editedPromoter.name} 
                                onChange={e => setEditedPromoter({...editedPromoter, name: e.target.value})} 
                                className={`w-full bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400`} 
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Handle <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={editedPromoter.handle} 
                                onChange={e => setEditedPromoter({...editedPromoter, handle: e.target.value})} 
                                className={`w-full bg-gray-800 border ${errors.handle ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400`} 
                            />
                            {errors.handle && <p className="text-red-500 text-xs mt-1">{errors.handle}</p>}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Bio <span className="text-red-500">*</span></label>
                        <textarea 
                            value={editedPromoter.bio} 
                            onChange={e => setEditedPromoter({...editedPromoter, bio: e.target.value})} 
                            rows={3} 
                            className={`w-full bg-gray-800 border ${errors.bio ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 resize-none`} 
                        />
                        {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">City <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={editedPromoter.city} 
                                onChange={e => setEditedPromoter({...editedPromoter, city: e.target.value})} 
                                className={`w-full bg-gray-800 border ${errors.city ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400`} 
                            />
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone <span className="text-red-500">*</span></label>
                            <input 
                                type="tel" 
                                value={editedUser.phoneNumber || ''} 
                                onChange={e => setEditedUser({...editedUser, phoneNumber: e.target.value})} 
                                className={`w-full bg-gray-800 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400`} 
                            />
                            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email <span className="text-red-500">*</span></label>
                            <input 
                                type="email" 
                                value={editedUser.email} 
                                onChange={e => setEditedUser({...editedUser, email: e.target.value})} 
                                className={`w-full bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400`} 
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">@</span>
                                <input 
                                    type="text" 
                                    value={editedUser.instagramHandle || ''} 
                                    onChange={e => setEditedUser({...editedUser, instagramHandle: e.target.value})} 
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-7 focus:ring-amber-400 focus:border-amber-400" 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Account Status</label>
                        <select
                            value={editedUser.status}
                            onChange={(e) => setEditedUser({ ...editedUser, status: e.target.value as User['status'] })}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                        >
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Performance Stats */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2">Performance Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Total Earnings ($)</label>
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input 
                                    type="number" 
                                    value={editedPromoter.earnings || 0} 
                                    onChange={e => setEditedPromoter({...editedPromoter, earnings: parseFloat(e.target.value)})}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-amber-400 focus:border-amber-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Rating (0-5)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <StarIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={editedPromoter.rating} 
                                    onChange={e => setEditedPromoter({...editedPromoter, rating: parseFloat(e.target.value)})}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-amber-400 focus:border-amber-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assigned Venues */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2">
                        Assigned Venues <span className="text-red-500">*</span>
                    </h3>
                    {errors.assignedVenueIds && <p className="text-red-500 text-xs">{errors.assignedVenueIds}</p>}
                    <div className={`space-y-2 max-h-48 overflow-y-auto pr-2 bg-gray-900/50 rounded-lg p-2 border ${errors.assignedVenueIds ? 'border-red-500' : 'border-gray-800'}`}>
                        {venues.map(venue => (
                            <label key={venue.id} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={editedPromoter.assignedVenueIds.includes(venue.id)}
                                    onChange={() => handleVenueToggle(venue.id)}
                                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                                />
                                <span className="text-white font-medium">{venue.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50 rounded-b-xl">
                <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                <button onClick={handleSaveChanges} className="bg-amber-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-amber-300 transition-colors">Save Changes</button>
            </div>
        </div>
    </div>
  );
};
