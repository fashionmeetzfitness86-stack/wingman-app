
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
  <div className="flex items-center gap-2 select-none">
    {/* Icon: wing + pin (simplified) */}
    <svg width="28" height="28" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E040FB" />
          <stop offset="50%" stopColor="#7B61FF" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      {/* Pin shape */}
      <path d="M24 2C15.163 2 8 9.163 8 18c0 12.444 16 34 16 34s16-21.556 16-34C40 9.163 32.837 2 24 2z"
        stroke="url(#wg)" strokeWidth="3" fill="none"/>
      {/* Pin dot */}
      <circle cx="24" cy="18" r="5" fill="url(#wg)" />
      {/* Wing (top-left arc) */}
      <path d="M14 10 C8 4, 2 6, 4 14 C6 18, 12 18, 14 14"
        stroke="url(#wg)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
    {/* Wordmark */}
    <span
      className="text-xl font-black tracking-wide hidden sm:block"
      style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.05em' }}
    >
      <span style={{
        background: 'linear-gradient(90deg, #E040FB, #7B61FF, #00D4FF)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>W</span>
      <span className="text-white">INGMAN</span>
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
            className="p-2 -ml-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
        ) : (
          (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PROMOTER) ? (
            <button
              onClick={onOpenGroupChat}
              className="p-2 -ml-1 rounded-full hover:bg-white/10 transition-colors"
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
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <TokenIcon className="w-4 h-4" style={{ color: '#E040FB' } as React.CSSProperties} />
            <span className="text-white font-bold text-xs">{tokenBalance.toLocaleString()}</span>
          </div>
        )}

        <button
          onClick={onOpenCart}
          className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
          aria-label="Open cart"
        >
          <CartIcon className="w-5 h-5 text-white" />
          {cartItemCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 w-4 h-4 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-black"
              style={{ background: 'linear-gradient(135deg, #E040FB, #00D4FF)' }}
            >
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenNotifications}
          className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5 text-white" />
          {hasNotifications && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-black"
              style={{ background: '#E040FB' }}
            />
          )}
        </button>

        {showMenu && (
          <button
            onClick={onOpenMenu}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </header>
  );
};
