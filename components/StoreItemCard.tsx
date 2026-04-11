import React from 'react';
import { StoreItem } from '../types';
import { TokenIcon } from './icons/TokenIcon';
import { PlayIcon } from './icons/PlayIcon';

interface StoreItemCardProps {
  item: StoreItem;
  onPurchase: (item: StoreItem) => void;
  onAddToCart: (item: StoreItem) => void;
}

export const StoreItemCard: React.FC<StoreItemCardProps> = ({ item, onPurchase, onAddToCart }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 group">
      <div className="relative">
        <img className="w-full h-48 object-cover" src={item.image} alt={item.title} />
        {item.video && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayIcon className="w-12 h-12 text-white" />
            </div>
        )}
        <div className="absolute top-3 right-3 bg-black/60 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">{item.category}</div>
      </div>
      <div className="p-4 flex flex-col h-48">
        <div>
          <h3 className="text-lg font-bold text-white leading-tight h-12">{item.title}</h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2 h-10">{item.description}</p>
        </div>
        <div className="mt-auto">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                <TokenIcon className="w-5 h-5 text-amber-400" />
                <span className="text-white font-bold text-lg">{item.price.toLocaleString()}</span>
                </div>
                <p className="text-gray-400 text-xs font-semibold">${item.priceUSD.toFixed(2)} USD</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onAddToCart(item)}
                    className="w-full text-center bg-amber-400 text-black font-bold py-1.5 px-4 rounded-lg text-sm transition-all duration-300 hover:bg-amber-300"
                    aria-label={`Add ${item.title} to cart`}
                >
                    Add to Cart
                </button>
                <button
                    onClick={() => onPurchase(item)}
                    className="w-full text-center bg-transparent border-2 border-gray-700 text-gray-300 font-bold py-1.5 px-4 rounded-lg text-sm transition-all duration-300 hover:bg-gray-700"
                    aria-label={`Purchase ${item.title} now`}
                >
                    Purchase
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};