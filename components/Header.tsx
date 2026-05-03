
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

/**
 * Wingman wordmark — gradient W + "INGMAN" in white
 * Rendered as an inline SVG so it looks crisp at any DPI.
 */
const WingmanLogo: React.FC = () => (
  <div className="flex items-center gap-2.5 select-none">
    {/* Icon: official wing + pin mark */}
    <svg width="30" height="36" viewBox="0 0 64 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="hdr-grad-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#C724B1" />
          <stop offset="45%"  stopColor="#6A4FE8" />
          <stop offset="100%" stopColor="#00C8FF" />
        </linearGradient>
        <linearGradient id="hdr-grad-d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#C724B1" />
          <stop offset="50%"  stopColor="#6A4FE8" />
          <stop offset="100%" stopColor="#00C8FF" />
        </linearGradient>
      </defs>
      {/* Pin body */}
      <path d="M32 8C21.5 8 13 16.5 13 27c0 15 19 41 19 41S51 42 51 27C51 16.5 42.5 8 32 8z"
        stroke="url(#hdr-grad-v)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="27" r="6.5" fill="url(#hdr-grad-v)" />
      {/* Wing sweep */}
      <path d="M22 18 C14 8, 2 10, 4 22 C6 30, 16 31, 22 26"
        stroke="url(#hdr-grad-d)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 22 C13 15, 6 17, 8 24"
        stroke="url(#hdr-grad-d)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
    {/* Wordmark */}
    <span
      className="text-xl font-black tracking-wide hidden sm:block"
      style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em' }}
    >
      <span style={{
        background: 'linear-gradient(90deg, #C724B1 0%, #6A4FE8 55%, #00C8FF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>WINGMAN</span>
    </span>
  </div>
);

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
  tokenBalance,
  balanceJustUpdated,
  currentUser,
  onOpenCart,
  cartItemCount,
  showMenu = true,
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
      <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none max-w-[calc(100%-9rem)]">
        {isHome ? (
          <WingmanLogo />
        ) : subtitle ? (
          <>
            <p className="text-[11px] text-gray-500 truncate leading-none mb-0.5">{subtitle}</p>
            <p className="text-white font-bold text-base truncate leading-tight">{title}</p>
          </>
        ) : (
          <h1 className="text-white font-bold text-base truncate tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {title}
          </h1>
        )}
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-0.5">
        {tokenBalance !== undefined && (
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full mr-1 ${balanceJustUpdated ? 'animate-flash-blue' : ''}`}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(106,79,232,0.3)' }}
          >
            <TokenIcon className="w-4 h-4" style={{ color: '#6A4FE8' } as React.CSSProperties} />
            <span className="text-white font-bold text-xs">{tokenBalance.toLocaleString()}</span>
          </div>
        )}

        <button
          onClick={onOpenCart}
          className="p-2 rounded-full hover:bg-white/5 transition-colors relative"
          aria-label="Open cart"
        >
          <CartIcon className="w-5 h-5 text-white" />
          {cartItemCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 w-4 h-4 text-[#8A8E99] text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[#0F1014]"
              style={{ background: 'linear-gradient(135deg, #C724B1, #6A4FE8)', border: '2px solid var(--color-background)' }}
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
              style={{ background: 'linear-gradient(135deg, #6A4FE8, #00C8FF)' }}
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
