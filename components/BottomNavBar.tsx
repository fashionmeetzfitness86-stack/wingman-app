
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
}> = ({ icon, label, isActive, onClick, badgeCount }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center gap-0.5 w-full pt-2 transition-all ${
      isActive ? 'scale-105' : 'opacity-60 hover:opacity-90'
    }`}
    style={isActive ? { color: '#E040FB' } : { color: '#6B6B6B' }}
  >
    {/* Gradient glow dot under active item */}
    {isActive && (
      <span
        className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
        style={{ background: 'linear-gradient(90deg, #E040FB, #00D4FF)' }}
      />
    )}
    {icon}
    <span
      className="text-[10px] font-semibold"
      style={isActive ? {
        background: 'linear-gradient(90deg, #E040FB, #7B61FF, #00D4FF)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      } : {}}
    >
      {label}
    </span>
    {badgeCount !== undefined && badgeCount > 0 && (
      <span
        className="absolute top-1 right-3 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-black"
        style={{ background: 'linear-gradient(135deg, #E040FB, #00D4FF)' }}
      >
        {badgeCount > 9 ? '9+' : badgeCount}
      </span>
    )}
  </button>
);

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentUser, currentPage, onNavigate, cartItemCount, onOpenMenu }) => {
  
  const isPrivileged = 
    currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL ||
    currentUser.accessLevel === UserAccessLevel.ACCESS_MALE ||
    currentUser.role === UserRole.ADMIN ||
    currentUser.role === UserRole.PROMOTER;

  if (isPrivileged) {
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 h-[68px] z-40"
        style={{
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
        aria-label="Main Navigation"
      >
        <div className="container mx-auto h-full grid grid-cols-5 items-center justify-around px-2 relative">
            <NavItem
                icon={<HomeIcon className="w-5 h-5" />}
                label="Home"
                isActive={currentPage === 'home'}
                onClick={() => onNavigate('home')}
            />
            <NavItem
                icon={<ClockIcon className="w-5 h-5" />}
                label="Timeline"
                isActive={currentPage === 'eventTimeline' || currentPage === 'exclusiveExperiences'}
                onClick={() => onNavigate('eventTimeline')}
            />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <button
                    onClick={() => onNavigate('bookATable')}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white border-[3px] border-black transition-all hover:scale-110 active:scale-95 animate-pulse-glow"
                    style={{ background: 'linear-gradient(135deg, #E040FB 0%, #7B61FF 50%, #00D4FF 100%)' }}
                   aria-label="Featured Venues"
                >
                    <BookIcon className="w-6 h-6"/>
                </button>
            </div>
            <div />
            <NavItem
                icon={<CartIcon className="w-5 h-5" />}
                label="My Plans"
                isActive={currentPage === 'checkout'}
                onClick={() => onNavigate('checkout')}
                badgeCount={cartItemCount}
            />
            <NavItem
                icon={<ChatIcon className="w-5 h-5" />}
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
    <nav
      className="fixed bottom-0 left-0 right-0 h-[68px] z-40"
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
      aria-label="Main Navigation"
    >
      <div className="container mx-auto h-full grid grid-cols-5 items-center justify-around px-2 relative">
          <NavItem
              icon={<HomeIcon className="w-5 h-5" />}
              label="Home"
              isActive={currentPage === 'home'}
              onClick={() => onNavigate('home')}
          />
          <NavItem
              icon={<ClockIcon className="w-5 h-5" />}
              label="Timeline"
              isActive={currentPage === 'eventTimeline' || currentPage === 'exclusiveExperiences'}
              onClick={() => onNavigate('eventTimeline')}
          />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <button
                  onClick={() => onNavigate('bookATable')}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white border-[3px] border-black transition-all hover:scale-110 active:scale-95 animate-pulse-glow"
                  style={{ background: 'linear-gradient(135deg, #E040FB 0%, #7B61FF 50%, #00D4FF 100%)' }}
                  aria-label="Browse Venues"
              >
                  <BookIcon className="w-6 h-6"/>
              </button>
          </div>
          <div />
          <NavItem
              icon={<CartIcon className="w-5 h-5" />}
              label="My Plans"
              isActive={currentPage === 'checkout'}
              onClick={() => onNavigate('checkout')}
              badgeCount={cartItemCount}
          />
          <NavItem
              icon={<ProfileIcon className="w-5 h-5" />}
              label="Profile"
              isActive={currentPage === 'userProfile'}
              onClick={() => onNavigate('userProfile')}
          />
      </div>
    </nav>
  );
};
