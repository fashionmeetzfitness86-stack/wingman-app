import React, { useState, useEffect } from 'react';
import { User, UserRole, UserAccessLevel } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface AdminEditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState<User>(user);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleSave = () => {
    onSave(editedUser);
  };
  
  const handleChange = (field: keyof User, value: any) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
        <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Edit User: {user.name}</h2>
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
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
                <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="bg-amber-400 text-black font-bold py-2 px-4 rounded-lg">Save Changes</button>
            </div>
        </div>
    </div>
  );
};