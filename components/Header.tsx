
import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { BellIcon } from './icons/BellIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { QrIcon } from './icons/QrIcon';
import { UsersIcon } from './icons/UsersIcon';
import { User, UserRole } from '../types';
import { CartIcon } from './icons/CartIcon';
import loginLogo from '../assets/login-logo-white.png';

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
  currentUser: User;
  onOpenCart: () => void;
  cartItemCount: number;
  showMenu?: boolean;
  onLogoClick?: () => void;
}


export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton,
  onBack,
  onOpenMenu,
  onOpenNotifications,
  onOpenGroupChat,
  showQrScanner,
  onOpenScanner,
  hasNotifications,
  currentUser,
  onOpenCart,
  cartItemCount,
  showMenu = true,
  onLogoClick,
}) => {
  const isHome = title.toLowerCase() === 'home';

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-[60px]"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Left ── */}
      <div className="flex items-center gap-1 min-w-[44px]">
        {showQrScanner && onOpenScanner && (
          <button
            onClick={onOpenScanner}
            className="p-2 rounded-full hover:bg-white/05 transition-colors"
            aria-label="Scan QR Code"
          >
            <QrIcon className="w-5 h-5 text-white" />
          </button>
        )}

        {showBackButton ? (
          <button
            onClick={onBack}
            className="p-2 -ml-1 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
        ) : (
          (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.WINGMAN) ? (
            <button
              onClick={onOpenGroupChat}
              className="p-2 -ml-1 rounded-full hover:bg-white/5 transition-colors"
              aria-label="Group Chat"
            >
              <UsersIcon className="w-5 h-5 text-white" />
            </button>
          ) : <div className="w-9 h-9" />
        )}
      </div>

      {/* ── Centre: Logo on Home, title on other pages ── */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center max-w-[calc(100%-9rem)]">
        {isHome ? (
          onLogoClick ? (
            <button onClick={onLogoClick} aria-label="Home" className="cursor-pointer">
              <img src={loginLogo} alt="Wingman" className="h-7 w-auto object-contain" />
            </button>
          ) : (
            <img src={loginLogo} alt="Wingman" className="h-7 w-auto object-contain" />
          )
        ) : subtitle ? (
          <button
            onClick={onLogoClick}
            disabled={!onLogoClick}
            className={onLogoClick ? 'cursor-pointer' : 'pointer-events-none'}
          >
            <p className="text-[11px] text-gray-500 truncate leading-none mb-0.5">{subtitle}</p>
            <p className="text-white font-bold text-base truncate leading-tight">{title}</p>
          </button>
        ) : (
          <button
            onClick={onLogoClick}
            disabled={!onLogoClick}
            className={onLogoClick ? 'cursor-pointer' : 'pointer-events-none'}
            aria-label="Home"
          >
            <h1 className="text-white font-bold text-base truncate tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {title}
            </h1>
          </button>
        )}
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-0.5">

        <button
          onClick={onOpenCart}
          className="p-2 rounded-full hover:bg-white/5 transition-colors relative"
          aria-label="Open cart"
        >
          <CartIcon className="w-5 h-5 text-white" />
          {cartItemCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 w-4 h-4 text-[#8A8E99] text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[#0F1014]"
              style={{ background: '#1C1D22' }}
            >
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenNotifications}
          className="p-2 rounded-full hover:bg-white/5 transition-colors relative"
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5 text-white" />
          {hasNotifications && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-black"
              style={{ background: '#FFFFFF' }}
            />
          )}
        </button>

        {showMenu && (
          <button
            onClick={onOpenMenu}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </header>
  );
};
