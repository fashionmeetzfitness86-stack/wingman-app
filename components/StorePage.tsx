
import React, { useState } from 'react';
import { storeItems } from '../data/mockData';
import { User, StoreItem } from '../types';
import { StoreItemCard } from './StoreItemCard';
import { PurchaseConfirmationModal } from './PurchaseConfirmationModal';

interface StorePageProps {
  currentUser: User;
  onPurchase: (item: StoreItem) => boolean;
  userTokenBalance?: number; // kept for backward-compat, no longer displayed
  showToast: (message: string, type: 'success' | 'error') => void;
  onAddToCart: (item: StoreItem) => void;
}

const CATEGORIES = ['All', 'Merchandise', 'NFT', 'Perk'] as const;

const CAT_ICONS: Record<string, string> = {
  All: '✦', Merchandise: '👕', NFT: '💎', Perk: '⚡',
};

export const StorePage: React.FC<StorePageProps> = ({ currentUser, onPurchase, showToast, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [itemToConfirm, setItemToConfirm] = useState<StoreItem | null>(null);

  const filteredItems = activeCategory === 'All'
    ? storeItems
    : storeItems.filter(item => item.category === activeCategory);

  const handleConfirmPurchase = () => {
    if (!itemToConfirm) return;
    showToast(`${itemToConfirm.title} purchased! 🎉`, 'success');
    setItemToConfirm(null);
  };

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'transparent' }}>

      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-30 px-4 pt-5 pb-4"
        style={{
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Title */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-black leading-tight text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span style={{
                background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF, #374151)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Wingman</span> Store
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Exclusive merch, perks &amp; digital collectibles
            </p>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 text-xs font-bold rounded-full px-3 py-1.5 transition-all"
              style={activeCategory === cat
                ? { background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Items grid ── */}
      <div className="px-4 pt-5 pb-28">
        {/* Count */}
        <p className="text-xs text-gray-600 mb-4">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          {activeCategory !== 'All' ? ` · ${activeCategory}` : ''}
        </p>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <StoreItemCard
                key={item.id}
                item={item}
                onPurchase={setItemToConfirm}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🛍</span>
            <p className="font-semibold text-gray-500">No items in this category yet.</p>
            <button
              onClick={() => setActiveCategory('All')}
              className="mt-4 text-sm font-semibold hover:underline"
              style={{ color: '#FFFFFF' }}
            >
              View all items
            </button>
          </div>
        )}


      </div>

      {/* ── Purchase modal ── */}
      {itemToConfirm && (
        <PurchaseConfirmationModal
          isOpen={!!itemToConfirm}
          onClose={() => setItemToConfirm(null)}
          onConfirm={handleConfirmPurchase}
          item={itemToConfirm}
          userTokenBalance={0}
        />
      )}
    </div>
  );
};
