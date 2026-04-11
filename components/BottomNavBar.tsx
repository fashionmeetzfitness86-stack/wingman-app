
import React from 'react';
import { Page, User, UserAccessLevel, UserRole } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { ClockIcon } from './icons/ClockIcon';
import { BookIcon } from './icons/BookIcon';
import { CartIcon } from './icons/CartIcon';
import { MenuIcon } from './icons/MenuIcon';
import { ChatIcon } from './icons/ChatIcon';
import { ProfileIcon } from './icons/ProfileIcon';


interface BottomNavBarProps {
  currentUser: User;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  cartItemCount: number;
  onOpenMenu: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ icon, label, isActive, onClick, badgeCount }) => {
  const activeClass = 'text-[#EC4899]';
  const inactiveClass = 'text-gray-400';
  
  return (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center gap-1 w-full pt-2 ${isActive ? activeClass : inactiveClass} hover:text-white transition-colors`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className={`absolute top-1 right-4 w-5 h-5 bg-[#EC4899] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-black`}>
            {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </button>
  );
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentUser, currentPage, onNavigate, cartItemCount, onOpenMenu }) => {
  
  const isPrivileged = 
    currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL ||
    currentUser.accessLevel === UserAccessLevel.ACCESS_MALE ||
    currentUser.role === UserRole.ADMIN ||
    currentUser.role === UserRole.PROMOTER;

  if (isPrivileged) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-lg border-t border-gray-800 z-40" aria-label="Main Navigation">
        <div className="container mx-auto h-full grid grid-cols-5 items-center justify-around px-2 relative">
            <NavItem
                icon={<HomeIcon className="w-6 h-6" />}
                label="Home"
                isActive={currentPage === 'home'}
                onClick={() => onNavigate('home')}
            />
            <NavItem
                icon={<ClockIcon className="w-6 h-6" />}
                label="Timeline"
                isActive={currentPage === 'eventTimeline'}
                onClick={() => onNavigate('eventTimeline')}
            />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <button 
                    onClick={() => onNavigate('bookATable')} 
                    className="w-16 h-16 bg-[#EC4899] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#EC4899]/30 border-4 border-black transition-transform hover:scale-110" 
                    aria-label="Book a Table"
                >
                    <BookIcon className="w-8 h-8"/>
                </button>
            </div>
            <div /> 
            <NavItem
                icon={<CartIcon className="w-6 h-6" />}
                label="My Plans"
                isActive={currentPage === 'checkout'}
                onClick={() => onNavigate('checkout')}
                badgeCount={cartItemCount}
            />
            <NavItem
                icon={<ChatIcon className="w-6 h-6" />}
                label="Chats"
                isActive={currentPage === 'guestlistChats' || currentPage === 'eventChatsList'}
                onClick={() => onNavigate('eventChatsList')}
            />
        </div>
      </nav>
    );
  }

  // General Access view
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-lg border-t border-gray-800 z-40" aria-label="Main Navigation">
        <div className="container mx-auto h-full grid grid-cols-5 items-center justify-around px-2 relative">
            <NavItem
                icon={<HomeIcon className="w-6 h-6" />}
                label="Home"
                isActive={currentPage === 'home'}
                onClick={() => onNavigate('home')}
            />
            <NavItem
                icon={<ClockIcon className="w-6 h-6" />}
                label="Timeline"
                isActive={currentPage === 'eventTimeline'}
                onClick={() => onNavigate('eventTimeline')}
            />
             <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <button 
                    onClick={() => onNavigate('bookATable')} 
                    className="w-16 h-16 bg-[#EC4899] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#EC4899]/30 border-4 border-black transition-transform hover:scale-110" 
                    aria-label="Book a Table"
                >
                    <BookIcon className="w-8 h-8"/>
                </button>
            </div>
            <div />
            <NavItem
                icon={<CartIcon className="w-6 h-6" />}
                label="My Plans"
                isActive={currentPage === 'checkout'}
                onClick={() => onNavigate('checkout')}
                badgeCount={cartItemCount}
            />
            <NavItem
                icon={<ProfileIcon className="w-6 h-6" />}
                label="Profile"
                isActive={currentPage === 'userProfile'}
                onClick={() => onNavigate('userProfile')}
            />
        </div>
    </nav>
  );
};
