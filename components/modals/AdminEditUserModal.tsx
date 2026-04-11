import React, { useState, useEffect } from 'react';
import { User, UserRole, UserAccessLevel } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';

interface AdminEditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

const WAIVER_OPTIONS = {
    none: 'No Waiver',
    '1_month': '1 Month Free',
    '3_months': '3 Months Free',
    '6_months': '6 Months Free',
    '1_year': '1 Year Free',
    forever: 'Forever Free',
};

const getWaiverValue = (waiveUntil?: string): keyof typeof WAIVER_OPTIONS => {
    if (waiveUntil === 'forever') return 'forever';
    if (!waiveUntil) return 'none';

    const today = new Date();
    const untilDate = new Date(waiveUntil);
    if (untilDate < today) return 'none';
    
    const diffTime = untilDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 300) return '1_year';
    if (diffDays > 150) return '6_months';
    if (diffDays > 60) return '3_months';
    if (diffDays > 0) return '1_month';

    return 'none';
};

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState<User | null>(user);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleSave = () => {
    if (editedUser) {
        onSave(editedUser);
    }
  };
  
  const handleChange = (field: keyof User, value: any) => {
    if (editedUser) {
        setEditedUser(prev => ({ ...prev!, [field]: value }));
    }
  };
  
  const handleWaiverChange = (waiverKey: keyof typeof WAIVER_OPTIONS) => {
      if (!editedUser) return;

      if (waiverKey === 'none') {
          const { waiveSubscriptionUntil, ...rest } = editedUser;
          setEditedUser({ ...rest, subscriptionStatus: 'active' });
          return;
      }
      if (waiverKey === 'forever') {
          setEditedUser({ ...editedUser, waiveSubscriptionUntil: 'forever', subscriptionStatus: 'free_tier' });
          return;
      }

      const today = new Date();
      let monthsToAdd = 0;
      if (waiverKey === '1_month') monthsToAdd = 1;
      if (waiverKey === '3_months') monthsToAdd = 3;
      if (waiverKey === '6_months') monthsToAdd = 6;
      if (waiverKey === '1_year') monthsToAdd = 12;
      
      const newDate = new Date(today.setMonth(today.getMonth() + monthsToAdd));
      const newDateString = newDate.toISOString().split('T')[0];

      setEditedUser({ ...editedUser, waiveSubscriptionUntil: newDateString, subscriptionStatus: 'free_tier' });
  };


  if (!isOpen || !editedUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
        <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Edit User: {user?.name}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">User Role</label>
                    <select
                        value={editedUser.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                    >
                        {Object.values(UserRole).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Access Level</label>
                    <select
                        value={editedUser.accessLevel}
                        onChange={(e) => handleChange('accessLevel', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                    >
                        {Object.values(UserAccessLevel).map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                    <select
                        value={editedUser.status}
                        onChange={(e) => handleChange('status', e.target.value as 'active' | 'blocked')}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                    >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
                {editedUser.role === UserRole.PROMOTER && (
                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Subscription Management</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Waive Monthly Fee</label>
                            <select
                                value={getWaiverValue(editedUser.waiveSubscriptionUntil)}
                                onChange={(e) => handleWaiverChange(e.target.value as keyof typeof WAIVER_OPTIONS)}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                            >
                                {Object.entries(WAIVER_OPTIONS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
                <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="bg-amber-400 text-black font-bold py-2 px-4 rounded-lg">Save Changes</button>
            </div>
        </div>
    </div>
  );
};