
import React, { useMemo, useState, useEffect } from 'react';
import { CartItem, Venue, User, Page } from '../types';
import { CartItemCard } from './CartItemCard';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { TokenIcon } from './icons/TokenIcon';
import { CartIcon } from './icons/CartIcon';
import { BookingsIcon } from './icons/BookingsIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';

interface CheckoutPageProps {
  currentUser: User;
  watchlist: CartItem[];
  cartItems?: CartItem[];
  bookedItems: CartItem[];
  venues: Venue[];
  onRemoveItem: (itemId: string) => void;
  onUpdatePaymentOption: (itemId: string, option: 'deposit' | 'full') => void;
  onConfirmCheckout: (paymentMethod: 'tokens' | 'usd' | 'cashapp', itemIds: string[]) => void;
  onMoveToCart: (item: CartItem) => void;
  onViewReceipt: (item: CartItem) => void;
  userTokenBalance: number;
  onStartChat: (item: CartItem) => void;
  onCancelRsvp: (item: CartItem) => void;
  initialTab?: 'cart' | 'watchlist' | 'purchased';
  onNavigate: (page: Page) => void;
}

const USD_TO_TMKC_RATE = 100;

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs">{subtitle}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  currentUser, watchlist, cartItems = [], bookedItems, venues,
  onRemoveItem, onUpdatePaymentOption, onConfirmCheckout, onMoveToCart,
  onViewReceipt, userTokenBalance, onStartChat, onCancelRsvp,
  initialTab = 'cart', onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'watchlist' | 'purchased'>(initialTab);
  const [paymentMethod, setPaymentMethod] = useState<'tokens' | 'usd' | 'cashapp'>('usd');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'cart') {
      setSelectedItemIds(cartItems.map(item => item.id));
    } else {
      setSelectedItemIds([]);
    }
  }, [activeTab, cartItems]);

  const watchlistItems = useMemo(() =>
    [...watchlist].sort((a, b) => new Date(a.sortableDate || 0).getTime() - new Date(b.sortableDate || 0).getTime()),
  [watchlist]);

  const sortedBookedItems = useMemo(() =>
    [...bookedItems].sort((a, b) => (b.bookedTimestamp || 0) - (a.bookedTimestamp || 0)),
  [bookedItems]);

  const selectedItems = useMemo(() => cartItems.filter(item => selectedItemIds.includes(item.id)), [cartItems, selectedItemIds]);

  const totalCostUSD = useMemo(() =>
    selectedItems.reduce((total, item) => {
      const price = item.paymentOption === 'full' ? item.fullPrice ?? 0 : item.depositPrice ?? 0;
      return total + price;
    }, 0),
  [selectedItems]);

  const totalTokensCost = useMemo(() =>
    selectedItems.reduce((total, item) => {
      if (item.type === 'storeItem' && item.storeItemDetails) return total + item.storeItemDetails.item.price;
      const price = item.paymentOption === 'full' ? item.fullPrice ?? 0 : item.depositPrice ?? 0;
      return total + (price * USD_TO_TMKC_RATE);
    }, 0),
  [selectedItems]);

  const hasEnoughTokens = userTokenBalance >= totalTokensCost;

  useEffect(() => {
    if (!hasEnoughTokens && paymentMethod === 'tokens') setPaymentMethod('usd');
  }, [hasEnoughTokens, paymentMethod]);

  const handleToggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const TABS = [
    { key: 'cart' as const, label: 'Cart', count: cartItems.length, color: '#E040FB' },
    { key: 'watchlist' as const, label: 'Watchlist', count: watchlistItems.length, color: '#7B61FF' },
    { key: 'purchased' as const, label: 'Purchased', count: sortedBookedItems.length, color: '#22C55E' },
  ];

  return (
    <div className="animate-fade-in text-white min-h-screen">
      {/* Page Header */}
      <div className="px-4 md:px-8 pt-6 pb-0 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">My Plans</h1>
        <p className="text-sm text-gray-500 mb-5">Manage your reservations and purchases</p>

        {/* Tab Bar */}
        <div
          className="flex gap-1 rounded-2xl p-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-200"
              style={
                activeTab === tab.key
                  ? { background: 'rgba(255,255,255,0.10)', color: '#fff' }
                  : { color: '#6B7280' }
              }
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className="text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.08)',
                    color: activeTab === tab.key ? '#fff' : '#6B7280',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 pt-6 pb-36 max-w-7xl mx-auto">

        {/* ── CART TAB ── */}
        {activeTab === 'cart' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left: Items List */}
            <div className="flex-1 min-w-0">
              {cartItems.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-400">
                      <span className="text-white font-bold">{cartItems.length}</span> item{cartItems.length !== 1 ? 's' : ''} in your cart
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedItemIds(cartItems.map(i => i.id))} className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">Select All</button>
                      <button onClick={() => setSelectedItemIds([])} className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">Deselect All</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {cartItems.map(item => (
                      <CartItemCard
                        key={item.id}
                        item={item}
                        venues={venues}
                        onRemove={onRemoveItem}
                        onUpdatePaymentOption={onUpdatePaymentOption}
                        onMoveToCart={onMoveToCart}
                        isSelected={selectedItemIds.includes(item.id)}
                        onToggleSelection={handleToggleItemSelection}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<CartIcon className="w-9 h-9 text-gray-600" />}
                  title="Your Cart is Empty"
                  subtitle="Reserve an event or experience to get started. They'll appear here ready for checkout."
                  action={
                    <button
                      onClick={() => onNavigate('eventTimeline')}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF)' }}
                    >
                      Browse Events
                    </button>
                  }
                />
              )}
            </div>

            {/* Right: Sticky Order Summary (only on desktop when items exist) */}
            {cartItems.length > 0 && (
              <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-6 space-y-4">

                {/* Payment Method */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <h2 className="text-base font-bold text-white mb-4">Payment Method</h2>
                  <div className="space-y-2">
                    {/* Tokens */}
                    <button
                      onClick={() => setPaymentMethod('tokens')}
                      disabled={!hasEnoughTokens}
                      className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={paymentMethod === 'tokens'
                        ? { background: 'rgba(224,64,251,0.1)', borderColor: '#E040FB' }
                        : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                    >
                      <TokenIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#E040FB' } as React.CSSProperties} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">Tokens</p>
                        <p className={`text-xs ${hasEnoughTokens ? 'text-gray-500' : 'text-red-400'}`}>Balance: {userTokenBalance.toLocaleString()} TMKC</p>
                      </div>
                      <span className="text-sm font-bold text-white">{totalTokensCost.toLocaleString()}</span>
                    </button>

                    {/* Card */}
                    <button
                      onClick={() => setPaymentMethod('usd')}
                      className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3"
                      style={paymentMethod === 'usd'
                        ? { background: 'rgba(224,64,251,0.1)', borderColor: '#E040FB' }
                        : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                    >
                      <CreditCardIcon className="w-5 h-5 flex-shrink-0 text-gray-300" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">Card</p>
                        <p className="text-xs text-gray-500">Visa ···· 4567</p>
                      </div>
                      <span className="text-sm font-bold text-white">${totalCostUSD.toFixed(2)}</span>
                    </button>

                    {/* Cash App */}
                    <button
                      onClick={() => setPaymentMethod('cashapp')}
                      className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3"
                      style={paymentMethod === 'cashapp'
                        ? { background: 'rgba(224,64,251,0.1)', borderColor: '#E040FB' }
                        : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <CurrencyDollarIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">Cash App</p>
                        <p className="text-xs text-gray-500">Pay with balance</p>
                      </div>
                      <span className="text-sm font-bold text-white">${totalCostUSD.toFixed(2)}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigate('paymentMethods')}
                    className="w-full mt-3 text-center text-xs font-semibold hover:underline transition-colors"
                    style={{ color: '#00D4FF' }}
                  >
                    + Add a new card
                  </button>
                </div>

                {/* Order Summary */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <h2 className="text-base font-bold text-white mb-4">Order Summary</h2>
                  <div className="space-y-2 text-sm mb-4">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <p className="text-gray-400 truncate pr-3 flex-1">{item.name}</p>
                        <p className="text-white font-semibold flex-shrink-0">
                          ${(item.paymentOption === 'full' ? item.fullPrice : item.depositPrice)?.toLocaleString() ?? '0'}
                        </p>
                      </div>
                    ))}
                    {selectedItems.length === 0 && (
                      <p className="text-gray-600 text-xs">No items selected.</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                    <p className="font-bold text-white">Total</p>
                    <p className="text-xl font-black text-white">${totalCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>

                  <p className="text-[10px] text-gray-500 text-center mt-4 mb-3 px-2 leading-tight">
                    By confirming, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms</a>, <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>, <a href="#" className="underline hover:text-white transition-colors">Liability Waiver</a>, and <a href="#" className="underline hover:text-white transition-colors">Refund Policy</a>.
                  </p>

                  <button
                    onClick={() => onConfirmCheckout(paymentMethod, selectedItemIds)}
                    disabled={selectedItemIds.length === 0}
                    className="mt-4 w-full text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: '0 8px 24px rgba(224,64,251,0.25)' }}
                  >
                    <CreditCardIcon className="w-5 h-5" />
                    Confirm &amp; Pay ({selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WATCHLIST TAB ── */}
        {activeTab === 'watchlist' && (
          watchlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {watchlistItems.map(item => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  venues={venues}
                  onRemove={onRemoveItem}
                  onUpdatePaymentOption={onUpdatePaymentOption}
                  onMoveToCart={onMoveToCart}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CartIcon className="w-9 h-9 text-gray-600" />}
              title="Watchlist is Empty"
              subtitle="Bookmark events you're interested in — they'll appear here so you can decide later."
              action={
                <button
                  onClick={() => onNavigate('eventTimeline')}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #7B61FF, #00D4FF)' }}
                >
                  Browse Events
                </button>
              }
            />
          )
        )}

        {/* ── PURCHASED TAB ── */}
        {activeTab === 'purchased' && (
          sortedBookedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedBookedItems.map(item => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  venues={venues}
                  onRemove={onRemoveItem}
                  onUpdatePaymentOption={onUpdatePaymentOption}
                  isBooked={true}
                  onViewReceipt={onViewReceipt}
                  onStartChat={onStartChat}
                  currentUser={currentUser}
                  onCancelRsvp={onCancelRsvp}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookingsIcon className="w-9 h-9 text-gray-600" />}
              title="No Purchases Yet"
              subtitle="Your confirmed bookings and receipts will appear here after you complete checkout."
            />
          )
        )}
      </div>

      {/* Mobile sticky checkout bar (only on small screens — desktop uses sidebar) */}
      {activeTab === 'cart' && cartItems.length > 0 && (
        <div
          className="fixed bottom-16 left-0 right-0 z-20 lg:hidden"
          style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="px-4 py-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400">{selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''} selected</p>
              <p className="text-xl font-black text-white">${totalCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <p className="text-[10px] text-gray-500 text-center mb-3 leading-tight">
              By confirming, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms</a>, <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>, <a href="#" className="underline hover:text-white transition-colors">Liability Waiver</a>, and <a href="#" className="underline hover:text-white transition-colors">Refund Policy</a>.
            </p>
            <button
              onClick={() => onConfirmCheckout(paymentMethod, selectedItemIds)}
              disabled={selectedItemIds.length === 0}
              className="w-full text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)', boxShadow: '0 8px 24px rgba(224,64,251,0.25)' }}
            >
              <CreditCardIcon className="w-5 h-5" />
              Confirm &amp; Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
