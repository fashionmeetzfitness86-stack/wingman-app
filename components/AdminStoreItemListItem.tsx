import React from 'react';
import { StoreItem } from '../types';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/FeatureIcons';

interface AdminStoreItemListItemProps {
    item: StoreItem;
    onEdit: (item: StoreItem) => void;
    onDelete: (item: StoreItem) => void;
    onPreview: (item: StoreItem) => void;
}

const CAT_COLORS: Record<string, { color: string; bg: string }> = {
    Merchandise: { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)'  },
    NFT:         { color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
    Perk:        { color: '#34D399', bg: 'rgba(52,211,153,0.1)'  },
};

export const AdminStoreItemListItem: React.FC<AdminStoreItemListItemProps> = ({ item, onEdit, onDelete, onPreview }) => {
    const cat = CAT_COLORS[item.category] ?? { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)' };
    return (
        <div
            className="group flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer"
            style={{
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}
        >
            {/* Thumbnail */}
            <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={item.image}
                    alt={item.title}
                />
            </div>

            {/* Name + category */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{item.title}</p>
                <span
                    className="inline-block mt-1 text-[10px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wider"
                    style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}30` }}
                >
                    {item.category}
                </span>
            </div>

            {/* Price block */}
            <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-sm font-black text-white">${item.priceUSD.toFixed(2)}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: '#F59E0B' }}>
                    {item.price.toLocaleString()} TMKC
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <button
                    onClick={() => onPreview(item)}
                    className="p-2 rounded-xl transition-all"
                    style={{ color: '#6B7280' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)', e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#6B7280')}
                    aria-label={`Preview ${item.title}`}
                >
                    <EyeIcon className="w-4.5 h-4.5" />
                </button>
                <button
                    onClick={() => onEdit(item)}
                    className="p-2 rounded-xl transition-all"
                    style={{ color: '#6B7280' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,165,250,0.1)', e.currentTarget.style.color = '#60A5FA')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#6B7280')}
                    aria-label={`Edit ${item.title}`}
                >
                    <PencilSquareIcon className="w-4.5 h-4.5" />
                </button>
                <button
                    onClick={() => onDelete(item)}
                    className="p-2 rounded-xl transition-all"
                    style={{ color: '#6B7280' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)', e.currentTarget.style.color = '#F87171')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#6B7280')}
                    aria-label={`Delete ${item.title}`}
                >
                    <TrashIcon className="w-4.5 h-4.5" />
                </button>
            </div>
        </div>
    );
};

