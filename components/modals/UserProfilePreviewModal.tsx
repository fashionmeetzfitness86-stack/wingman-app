import React from 'react';
import { User } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { LocationMarkerIcon } from '../icons/LocationMarkerIcon';
import { FaInstagram } from '../icons/FaInstagram';

interface UserProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserProfilePreviewModal: React.FC<UserProfilePreviewModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-sm m-4 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end p-2">
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-6 pt-0 text-center">
          <img src={user.profilePhoto} alt={user.name} className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-gray-800" />
          <h2 className="text-2xl font-bold text-white mt-4">{user.name}</h2>
          
          {user.city && (
            <div className="mt-2 flex justify-center items-center gap-1.5 text-gray-400">
              <LocationMarkerIcon className="w-4 h-4" />
              <span>{user.city}</span>
            </div>
          )}

          {user.instagramHandle && (
            <a href={`https://instagram.com/${user.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-gray-400 hover:text-white">
              <FaInstagram className="w-4 h-4" />
              <span>{user.instagramHandle}</span>
            </a>
          )}

          {user.bio && (
            <p className="text-gray-300 mt-4 text-sm leading-relaxed">{user.bio}</p>
          )}

        </div>
      </div>
    </div>
  );
};
