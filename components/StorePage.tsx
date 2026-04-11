
import React, { useState } from 'react';
import { storeItems } from '../data/mockData';
import { User, StoreItem } from '../types';
import { StoreItemCard } from './StoreItemCard';
import { PurchaseConfirmationModal } from './PurchaseConfirmationModal';

interface StorePageProps {
  currentUser: User;
  onPurchase: (item: StoreItem) => boolean;
  userTokenBalance: number;
  showToast: (message: string, type: 'success' | 'error') => void;
  onAddToCart: (item: StoreItem) => void;
}

const CATEGORIES = ['All', 'Merchandise', 'NFT', 'Perk'];

export const StorePage: React.FC<StorePageProps> = ({ currentUser, onPurchase, userTokenBalance, showToast, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [itemToConfirm, setItemToConfirm] = useState<StoreItem | null>(null);

  const filteredItems = activeCategory === 'All'
    ? storeItems
    : storeItems.filter(item => item.category === activeCategory);

  const handlePurchaseAttempt = (item: StoreItem) => {
    setItemToConfirm(item);
  };

  const handleConfirmPurchase = (method: 'tokens' | 'usd') => {
    if (!itemToConfirm) return;

    if (method === 'tokens') {
        const success = onPurchase(itemToConfirm);
        if (success) {
            showToast('Purchase successful!', 'success');
        } else {
            showToast('Insufficient funds.', 'error');
        }
    } else {
        // Simulate a successful USD purchase
        showToast('Purchase successful!', 'success');
    }

    setItemToConfirm(null);
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          WINGMAN <span className="text-white">Store</span>
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
          Spend your TMKC Tokens on exclusive merchandise, digital collectibles, and unique perks.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === category
                ? 'bg-amber-400 text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <StoreItemCard key={item.id} item={item} onPurchase={handlePurchaseAttempt} onAddToCart={onAddToCart} />
        ))}
      </div>
      
      {itemToConfirm && (
        <PurchaseConfirmationModal 
            isOpen={!!itemToConfirm}
            onClose={() => setItemToConfirm(null)}
            onConfirm={handleConfirmPurchase}
            item={itemToConfirm}
            userTokenBalance={userTokenBalance}
        />
      )}
    </div>
  );
};
