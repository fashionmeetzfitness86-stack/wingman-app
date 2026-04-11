
import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { BellIcon } from './icons/BellIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { QrIcon } from './icons/QrIcon';
import { TokenIcon } from './icons/TokenIcon';
import { UsersIcon } from './icons/UsersIcon';
import { User, UserRole } from '../types';
import { CartIcon } from './icons/CartIcon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenGroupChat: () => void;
  showQrScanner?: boolean;
  onOpenScanner?: () => void;
  hasNotifications?: boolean;
  tokenBalance?: number;
  balanceJustUpdated?: boolean;
  currentUser: User;
  onOpenCart: () => void;
  cartItemCount: number;
  showMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showBackButton, onBack, onOpenMenu, onOpenNotifications, onOpenGroupChat, showQrScanner, onOpenScanner, hasNotifications, tokenBalance, balanceJustUpdated, currentUser, onOpenCart, cartItemCount, showMenu = true }) => {
  return (
    <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-lg border-b border-gray-800 p-4 md:px-8 h-20 flex items-center justify-between relative">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {showQrScanner && onOpenScanner && (
          <button onClick={onOpenScanner} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Scan QR Code">
            <QrIcon className="w-6 h-6 text-white" />
          </button>
        )}

        {showBackButton ? (
          <button onClick={onBack} className={`p-2 rounded-full hover:bg-gray-800 transition-colors ${!showQrScanner ? '-ml-2' : ''}`} aria-label="Go back">
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
        ) : (
          (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PROMOTER) ? (
            <button onClick={onOpenGroupChat} className={`p-2 rounded-full hover:bg-gray-800 transition-colors ${!showQrScanner ? '-ml-2' : ''}`} aria-label="Group Chat">
              <UsersIcon className="w-6 h-6 text-white" />
            </button>
          ) : (!showQrScanner && <div className="w-10 h-10" />) // Placeholder for alignment
        )}
      </div>

      {/* Centered Title Section */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none max-w-[calc(100%-10rem)]">
          {subtitle ? (
            <>
              <p className="text-gray-400 text-sm truncate">{subtitle}</p>
              <p className="text-white font-bold text-lg truncate">{title}</p>
            </>
          ) : (
            <h1 className="text-white font-bold text-xl truncate">{title}</h1>
          )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {tokenBalance !== undefined && (
            <div className={`hidden sm:flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full ${balanceJustUpdated ? 'animate-flash-blue' : ''}`}>
                <TokenIcon className="w-5 h-5 text-[#EC4899]" />
                <span className="text-white font-bold text-sm">{tokenBalance.toLocaleString()}</span>
            </div>
        )}
        <button onClick={onOpenCart} className="p-2 rounded-full hover:bg-gray-800 transition-colors relative" aria-label="Open cart">
            <CartIcon className="w-6 h-6 text-white" />
            {cartItemCount > 0 && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black text-white text-xs flex items-center justify-center font-bold">{cartItemCount > 9 ? '9+' : cartItemCount}</div>
            )}
        </button>
        <button onClick={onOpenNotifications} className="p-2 rounded-full hover:bg-gray-800 transition-colors relative" aria-label="Notifications">
          <BellIcon className="w-6 h-6 text-white" />
          {hasNotifications && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></div>}
        </button>
        {showMenu && (
            <button onClick={onOpenMenu} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Open menu">
            <MenuIcon className="w-6 h-6 text-white" />
            </button>
        )}
      </div>
    </header>
  );
};
