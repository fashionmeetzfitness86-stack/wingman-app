
import React, { useState } from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { BookTableIcon } from './icons/BookTableIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ChallengesIcon } from './icons/ChallengesIcon';
import { StoreIcon } from './icons/StoreIcon';
import { ProfileIcon } from './icons/ProfileIcon';
import { AskGabyIcon } from './icons/AskGabyIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { CloseIcon } from './icons/CloseIcon';
import { Page, User, UserRole } from '../types';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { ChatIcon } from './icons/ChatIcon';
import { FriendsIcon } from './icons/FriendsIcon';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  currentPage: Page;
  currentUser: User;
  onLogout?: () => void;
}

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; isActive?: boolean; isLogout?: boolean; onClick: () => void; className?: string }> = ({ icon, label, isActive = false, isLogout = false, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
      isActive ? 'bg-gray-700 text-white' : isLogout ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    } ${className}`}
    aria-current={isActive ? 'page' : undefined}
  >
    <div className={isLogout ? 'text-red-500' : 'text-[#50B6FF]'}>
      {icon}
    </div>
    <span className="font-semibold">{label}</span>
  </button>
);


export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate, currentPage, currentUser, onLogout }) => {
  
  const handleNavigation = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    onClose();
  }
  
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} tabIndex={-1}></div>

      {/* Menu Panel */}
      <div className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-[#121212] border-l border-gray-800 shadow-2xl shadow-black transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close menu">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Menu Items */}
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
            <MenuItem icon={<HomeIcon className="w-5 h-5" />} label="Home" isActive={currentPage === 'home'} onClick={() => handleNavigation('home')} />
            {currentUser.role === UserRole.PROMOTER && (
                <MenuItem icon={<ChartPieIcon className="w-5 h-5" />} label="Promoter Dashboard" isActive={currentPage === 'promoterDashboard'} onClick={() => handleNavigation('promoterDashboard')} />
            )}
            <MenuItem icon={<BookTableIcon className="w-5 h-5" />} label="Book a Table" isActive={currentPage === 'bookATable'} onClick={() => handleNavigation('bookATable')} />
            <MenuItem icon={<SparkleIcon className="w-5 h-5" />} label="Exclusive Experiences" isActive={currentPage === 'exclusiveExperiences'} onClick={() => handleNavigation('exclusiveExperiences')} />
            <MenuItem icon={<ClockIcon className="w-5 h-5" />} label="Event Timeline" isActive={currentPage === 'eventTimeline'} onClick={() => handleNavigation('eventTimeline')} />
            <MenuItem icon={<ChallengesIcon className="w-5 h-5" />} label="Challenges" isActive={currentPage === 'challenges'} onClick={() => handleNavigation('challenges')} />
            <MenuItem icon={<FriendsIcon className="w-5 h-5" />} label="Friends Zone" isActive={currentPage === 'friendsZone'} onClick={() => handleNavigation('friendsZone')} />
            <MenuItem icon={<StoreIcon className="w-5 h-5" />} label="Store" isActive={currentPage === 'store'} onClick={() => handleNavigation('store')} />
            <MenuItem icon={<ChatIcon className="w-5 h-5" />} label="Chats" isActive={currentPage === 'eventChatsList' || currentPage === 'guestlistChats'} onClick={() => handleNavigation('eventChatsList')} />
            <MenuItem icon={<ProfileIcon className="w-5 h-5" />} label="Profile" isActive={currentPage === 'userProfile'} onClick={() => handleNavigation('userProfile')} />
            {currentUser.role === UserRole.ADMIN && (
                <MenuItem icon={<ChartPieIcon className="w-5 h-5" />} label="Admin Dashboard" isActive={currentPage === 'adminDashboard'} onClick={() => handleNavigation('adminDashboard')} />
            )}
            
            <MenuItem icon={<AskGabyIcon className="w-5 h-5" />} label="Ask Gaby" isActive={currentPage === 'chatbot' || currentPage === 'liveChat'} onClick={() => handleNavigation('chatbot')} />
          </nav>

          {/* Logout */}
          <div className="p-4 mt-auto border-t border-gray-800">
             <MenuItem icon={<LogoutIcon className="w-5 h-5" />} label="Logout" isLogout onClick={handleLogoutClick} />
          </div>
        </div>
      </div>
    </div>
  );
};
