
import React from 'react';
import { StoreItem } from '../types';
import { TokenIcon } from './icons/TokenIcon';

interface StoreItemCardProps {
  item: StoreItem;
  onPurchase: (item: StoreItem) => void;
  onAddToCart: (item: StoreItem) => void;
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Merchandise: { color: '#A855F7', bg: 'rgba(168,85,247,0.12)', label: 'Merch'       },
  NFT:         { color: '#00D4FF', bg: 'rgba(0,212,255,0.12)',   label: 'NFT'         },
  Perk:        { color: '#E040FB', bg: 'rgba(224,64,251,0.12)',  label: 'Perk'        },
  VIP:         { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  label: 'VIP'         },
};

export const StoreItemCard: React.FC<StoreItemCardProps> = ({ item, onPurchase, onAddToCart }) => {
  const cfg = CATEGORY_CONFIG[item.category] ?? { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', label: item.category };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      style={{
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Cover image */}
      <div className="relative h-52 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={item.image}
          alt={item.title}
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%)' }} />

        {/* Category badge */}
        <div
          className="absolute top-3 left-3 text-xs font-bold rounded-full px-2.5 py-1"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
        >
          {cfg.label}
        </div>

        {/* USD price top right */}
        <div
          className="absolute top-3 right-3 text-xs font-semibold rounded-full px-2.5 py-1"
          style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.6)' }}
        >
          ${item.priceUSD.toFixed(0)} USD
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base leading-tight mb-1 truncate">{item.title}</h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>

        {/* Price row */}
        <div className="flex items-center gap-2 mb-4">
          <TokenIcon className="w-4 h-4" style={{ color: '#E040FB' } as React.CSSProperties} />
          <span className="text-white font-black text-lg">{item.price.toLocaleString()}</span>
          <span className="text-gray-600 text-xs ml-auto">${item.priceUSD.toFixed(0)} USD</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(item)}
            className="flex-1 font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            aria-label={`Add ${item.title} to cart`}
          >
            Add to Cart
          </button>
          <button
            onClick={() => onPurchase(item)}
            className="flex-1 font-bold py-2.5 rounded-xl text-sm text-white transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)',
              boxShadow: '0 4px 14px rgba(224,64,251,0.25)',
            }}
            aria-label={`Buy ${item.title} now`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};