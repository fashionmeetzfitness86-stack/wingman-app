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

// Per-category accent colours for the pill badge.
const CATEGORY_STYLES: Record<StoreItem['category'], React.CSSProperties> = {
    Merchandise: { background: 'rgba(123,97,255,0.14)', color: '#B49CFF', border: '1px solid rgba(123,97,255,0.3)' },
    NFT:         { background: 'rgba(6,182,212,0.14)',  color: '#22D3EE', border: '1px solid rgba(6,182,212,0.3)' },
    Perk:        { background: 'rgba(34,197,94,0.14)',  color: '#4ADE80', border: '1px solid rgba(34,197,94,0.3)' },
};

export const AdminStoreItemListItem: React.FC<AdminStoreItemListItemProps> = ({ item, onEdit, onDelete, onPreview }) => {
    return (
        <div className="group bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex items-center gap-4 transition-colors">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                />
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center min-w-0">
                <div className="min-w-0">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <span
                        className="inline-flex items-center mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider"
                        style={CATEGORY_STYLES[item.category]}
                    >
                        {item.category}
                    </span>
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">${item.priceUSD.toFixed(2)}</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full"
                        style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                    >
                        {item.price.toLocaleString()} TMKC
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => onPreview(item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`Preview item ${item.title}`}>
                    <EyeIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`Edit item ${item.title}`}>
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(item)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-md transition-colors" aria-label={`Delete item ${item.title}`}>
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
