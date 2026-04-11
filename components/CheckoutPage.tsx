
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

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ currentUser, watchlist, cartItems = [], bookedItems, venues, onRemoveItem, onUpdatePaymentOption, onConfirmCheckout, onMoveToCart, onViewReceipt, userTokenBalance, onStartChat, onCancelRsvp, initialTab = 'cart', onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'watchlist' | 'purchased'>(initialTab);
  const [paymentMethod, setPaymentMethod] = useState<'tokens' | 'usd' | 'cashapp'>('usd');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const watchlistItems = useMemo(() => {
    return [...watchlist].sort((a, b) => new Date(a.sortableDate || 0).getTime() - new Date(b.sortableDate || 0).getTime());
  }, [watchlist]);

  useEffect(() => {
    if (activeTab === 'cart') {
      setSelectedItemIds(cartItems.map(item => item.id));
    } else {
      setSelectedItemIds([]);
    }
  }, [activeTab, cartItems]);

  const sortedBookedItems = useMemo(() => {
    return [...bookedItems].sort((a, b) => (b.bookedTimestamp || 0) - (a.bookedTimestamp || 0));
  }, [bookedItems]);
  
  const selectedItems = useMemo(() => cartItems.filter(item => selectedItemIds.includes(item.id)), [cartItems, selectedItemIds]);

  const totalCostUSD = useMemo(() => {
    return selectedItems.reduce((total, item) => {
        const price = item.paymentOption === 'full' ? item.fullPrice ?? 0 : item.depositPrice ?? 0;
        return total + price;
    }, 0);
  }, [selectedItems]);

  const totalTokensCost = useMemo(() => {
      return selectedItems.reduce((total, item) => {
        if (item.type === 'storeItem' && item.storeItemDetails) {
            return total + item.storeItemDetails.item.price;
        }
        const price = item.paymentOption === 'full' ? item.fullPrice ?? 0 : item.depositPrice ?? 0;
        return total + (price * USD_TO_TMKC_RATE);
    }, 0);
  }, [selectedItems]);
  
  const hasEnoughTokens = userTokenBalance >= totalTokensCost;
  
  useEffect(() => {
      if (!hasEnoughTokens && paymentMethod === 'tokens') {
          setPaymentMethod('usd');
      }
  }, [hasEnoughTokens, paymentMethod]);
  
  const handleToggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => setSelectedItemIds(cartItems.map(item => item.id));
  const handleDeselectAll = () => setSelectedItemIds([]);


  return (
    <div className="animate-fade-in text-white">
      <div className="p-4 md:p-8">
        
        <div className="flex border-b border-gray-700 mb-6">
            <button 
              onClick={() => setActiveTab('cart')}
              className={`relative px-4 py-3 text-lg font-semibold transition-colors w-1/3 ${activeTab === 'cart' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            >
              Cart
              {cartItems.length > 0 && (
                <span className="absolute top-2 right-2 bg-[#EC4899] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartItems.length}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('watchlist')}
              className={`relative px-4 py-3 text-lg font-semibold transition-colors w-1/3 ${activeTab === 'watchlist' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            >
              Watchlist
              {watchlistItems.length > 0 && (
                <span className="absolute top-2 right-2 bg-[#EC4899] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{watchlistItems.length}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('purchased')}
              className={`relative px-4 py-3 text-lg font-semibold transition-colors w-1/3 ${activeTab === 'purchased' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            >
              Purchased
            </button>
        </div>

        {activeTab === 'cart' && (
          <>
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-end gap-4 mb-2">
                    <button onClick={handleSelectAll} className="text-sm font-semibold text-gray-300 hover:text-white">Select All</button>
                    <button onClick={handleDeselectAll} className="text-sm font-semibold text-gray-300 hover:text-white">Deselect All</button>
                </div>
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
            ) : (
              <div className="text-center py-16 px-4">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full text-gray-500 mb-4">
                    <CartIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-white">Your Cart is Empty</h3>
                <p className="text-gray-400 mt-2">Add bookings or store items to get started.</p>
              </div>
            )}
            
            {cartItems.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
                    <div className="space-y-3">
                        <button 
                            onClick={() => setPaymentMethod('tokens')} 
                            disabled={!hasEnoughTokens}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${paymentMethod === 'tokens' ? 'bg-[#EC4899]/10 border-[#EC4899]' : 'bg-gray-800 border-gray-800 hover:border-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-800`}
                        >
                            <TokenIcon className="w-6 h-6 text-[#EC4899] flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-bold text-white">Pay with Tokens</p>
                                <p className={`text-sm ${hasEnoughTokens ? 'text-gray-400' : 'text-red-400'}`}>Balance: {userTokenBalance.toLocaleString()}</p>
                            </div>
                            <p className="font-semibold text-white">{totalTokensCost.toLocaleString()}</p>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('usd')}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${paymentMethod === 'usd' ? 'bg-[#EC4899]/10 border-[#EC4899]' : 'bg-gray-800 border-gray-800 hover:border-gray-600'}`}
                        >
                            <CreditCardIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-bold text-white">Pay with Card</p>
                                <p className="text-sm text-gray-400">Visa •••• 4567</p>
                            </div>
                            <p className="font-semibold text-white">${totalCostUSD.toFixed(2)}</p>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('cashapp')}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${paymentMethod === 'cashapp' ? 'bg-[#EC4899]/10 border-[#EC4899]' : 'bg-gray-800 border-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center text-white flex-shrink-0">
                                <CurrencyDollarIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-white">Cash App</p>
                                <p className="text-sm text-gray-400">Pay with your Cash App balance</p>
                            </div>
                            <p className="font-semibold text-white">${totalCostUSD.toFixed(2)}</p>
                        </button>
                    </div>
                    <button 
                        onClick={() => onNavigate('paymentMethods')}
                        className="w-full mt-4 text-center text-sm font-semibold text-amber-400 hover:underline"
                    >
                        Add a new card
                    </button>
                    {!hasEnoughTokens && paymentMethod === 'tokens' && <p className="text-red-400 text-sm mt-2">Insufficient token balance.</p>}
                </div>
            )}
          </>
        )}

        {activeTab === 'watchlist' && (
             <>
                {watchlistItems.length > 0 ? (
                    <div className="space-y-4">
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
                    <div className="text-center py-16 px-4">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full text-gray-500 mb-4">
                            <CartIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Your Watchlist is Empty</h3>
                        <p className="text-gray-400 mt-2">Bookmark events to save them for later.</p>
                    </div>
                )}
            </>
        )}

        {activeTab === 'purchased' && (
          <>
            {sortedBookedItems.length > 0 ? (
              <div className="space-y-4">
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
                <div className="text-center py-16 px-4">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full text-gray-500 mb-4">
                        <BookingsIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">No Purchased Items</h3>
                    <p className="text-gray-400 mt-2">Your confirmed bookings and purchases will appear here.</p>
                </div>
            )}
          </>
        )}

      </div>

      {activeTab === 'cart' && cartItems.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-gray-800 p-4 z-10">
            <div className="container mx-auto max-w-5xl">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-300 font-semibold">Total ({selectedItemIds.length} items)</p>
                    <p className="text-2xl font-bold text-white">${totalCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <button 
                    onClick={() => onConfirmCheckout(paymentMethod, selectedItemIds)}
                    disabled={selectedItemIds.length === 0}
                    className="w-full bg-[#EC4899] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-[#d8428a]"
                >
                    <CreditCardIcon className="w-5 h-5"/>
                    Confirm & Pay
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
