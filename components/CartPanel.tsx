import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { CartItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onNavigateToCheckout: () => void;
  totalPrice: number;
}

// ── Type badge ────────────────────────────────────────────────────────────────
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, { label: string; style: React.CSSProperties }> = {
    table:      { label: 'Table',      style: { background: 'rgba(80,182,255,0.08)', color: '#50B6FF', border: '1px solid rgba(80,182,255,0.2)' } },
    event:      { label: 'Event',      style: { background: 'rgba(150,115,133,0.12)', color: '#967385', border: '1px solid rgba(150,115,133,0.25)' } },
    experience: { label: 'Experience', style: { background: 'rgba(180,155,77,0.1)', color: '#B89B4D', border: '1px solid rgba(180,155,77,0.2)' } },
    guestlist:  { label: 'Guestlist',  style: { background: 'rgba(77,184,124,0.08)', color: '#4DB87C', border: '1px solid rgba(77,184,124,0.2)' } },
    storeItem:  { label: 'Store',      style: { background: 'rgba(255,255,255,0.05)', color: '#8A8E99', border: '1px solid rgba(255,255,255,0.1)' } },
  };
  const config = map[type] ?? { label: type, style: { background: 'rgba(255,255,255,0.05)', color: '#8A8E99', border: '1px solid rgba(255,255,255,0.1)' } };
  return (
    <span
      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
      style={config.style}
    >
      {config.label}
    </span>
  );
};

// ── Detail row ────────────────────────────────────────────────────────────────
const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
    <span className="text-[11px] font-semibold text-[#8A8E99]">{value}</span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const CartPanel: React.FC<CartPanelProps> = ({
  isOpen, onClose, cartItems, onRemoveItem, onNavigateToCheckout, totalPrice,
}) => {
  if (!isOpen) return null;

  const itemCount = cartItems.length;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose} role="dialog" aria-modal="true" aria-label="My Plans">
      {/* Backdrop blur */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Panel */}
      <div
        className="absolute top-0 right-0 h-full w-96 max-w-[92vw] flex flex-col animate-slide-in-right"
        style={{ background: '#0A0B0D', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Calendar / plan icon */}
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide">My Plans</h3>
              <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {itemCount === 0 ? 'No items' : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <CloseIcon className="w-4 h-4 text-[#8A8E99]" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        {itemCount > 0 ? (
          <>
            <div className="flex-grow overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
              {cartItems.map(item => {
                const price = item.paymentOption === 'full'
                  ? item.fullPrice
                  : item.depositPrice;
                const isDeposit = item.paymentOption === 'deposit';
                const isWatchlist = item.isWatchlistPlaceholder;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {/* Card top row */}
                    <div className="flex gap-3 p-3">
                      {/* Thumbnail */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover"
                          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                        />
                        {isWatchlist && (
                          <div
                            className="absolute inset-0 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.55)' }}
                          >
                            <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-bold text-white leading-tight truncate">{item.name}</p>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="p-1.5 rounded-lg flex-shrink-0 transition-all hover:opacity-70"
                            style={{ background: 'rgba(212,80,80,0.08)', border: '1px solid rgba(212,80,80,0.15)' }}
                          >
                            <TrashIcon className="w-3.5 h-3.5 text-[#D45050]" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <TypeBadge type={item.type} />
                          {isWatchlist && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(180,155,77,0.1)', color: '#B89B4D', border: '1px solid rgba(180,155,77,0.2)' }}>
                              Watchlist
                            </span>
                          )}
                        </div>

                        {item.date && (
                          <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {item.date}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Details strip */}
                    {(item.tableDetails || item.guestlistDetails || item.eventDetails) && (
                      <div
                        className="px-3 py-2.5 space-y-1.5 mx-3 mb-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        {item.tableDetails?.tableOption && (
                          <Detail label="Table" value={item.tableDetails.tableOption.name} />
                        )}
                        {item.tableDetails?.numberOfGuests && (
                          <Detail label="Guests" value={`${item.tableDetails.numberOfGuests} guests`} />
                        )}
                        {item.tableDetails?.selectedBottles && item.tableDetails.selectedBottles.length > 0 && (
                          <Detail label="Bottles" value={item.tableDetails.selectedBottles.map(b => `${b.quantity}× ${b.name}`).join(', ')} />
                        )}
                        {item.tableDetails?.wingman && (
                          <Detail label="Wingman" value={item.tableDetails.wingman.name} />
                        )}
                        {item.guestlistDetails?.wingman && (
                          <Detail label="Wingman" value={item.guestlistDetails.wingman.name} />
                        )}
                        {item.eventDetails?.guestDetails?.name && (
                          <Detail label="Guest" value={item.eventDetails.guestDetails.name} />
                        )}
                      </div>
                    )}

                    {/* Price footer */}
                    <div
                      className="flex items-center justify-between px-3 py-2.5"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {isDeposit ? 'Deposit' : 'Total'}
                      </span>
                      <div className="flex items-baseline gap-1">
                        {item.paymentMethod === 'tokens' ? (
                          <span className="text-sm font-black text-[#B89B4D]">{item.fullPrice?.toLocaleString()} TMKC</span>
                        ) : (
                          <span className="text-sm font-black text-white">${price?.toFixed(2)}</span>
                        )}
                        {isDeposit && (
                          <span className="text-[10px] text-[#8A8E99]">/ ${item.fullPrice?.toFixed(2)} full</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Footer ─────────────────────────────────────────── */}
            <div
              className="flex-shrink-0 px-5 py-5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Total */}
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Order Total
                  </p>
                  <p className="text-[11px] text-[#5D616B]">{itemCount} item{itemCount !== 1 ? 's' : ''} selected</p>
                </div>
                <p className="text-3xl font-black text-white">${totalPrice.toFixed(2)}</p>
              </div>

              {/* CTA */}
              <button
                onClick={onNavigateToCheckout}
                className="w-full relative overflow-hidden rounded-2xl py-4 font-black text-sm tracking-widest uppercase transition-all active:scale-[0.98] hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #C0C0C0 100%)',
                  color: '#000',
                  letterSpacing: '0.12em',
                }}
              >
                Proceed to Checkout →
              </button>

              <p className="text-center text-[10px] mt-3 font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Secure checkout · Stripe protected
              </p>
            </div>
          </>
        ) : (
          /* ── Empty state ─────────────────────────────────────── */
          <div className="flex-grow flex flex-col items-center justify-center text-center px-8 gap-5">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg className="w-9 h-9" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-white mb-1.5">No plans yet</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Browse events, reserve tables, or join a guestlist to start building your night.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
