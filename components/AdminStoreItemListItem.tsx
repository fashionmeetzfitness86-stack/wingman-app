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

export const AdminStoreItemListItem: React.FC<AdminStoreItemListItemProps> = ({ item, onEdit, onDelete, onPreview }) => {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
            <img className="w-20 h-20 rounded-lg object-cover" src={item.image} alt={item.title} />
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.category}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">${item.priceUSD.toFixed(2)}</p>
                    <p className="text-xs text-amber-400">{item.price.toLocaleString()} TMKC</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
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
