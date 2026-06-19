import React, { useMemo, useState } from 'react';
import { StoreItem } from '../../types';
import { AdminStoreItemListItem } from '../AdminStoreItemListItem';
import { PlusIcon } from '../icons/PlusIcon';

interface StoreTabProps {
    storeItems: StoreItem[];
    onAddItem: () => void;
    onEditItem: (item: StoreItem) => void;
    onDeleteItem: (item: StoreItem) => void;
    onPreviewItem: (item: StoreItem) => void;
}

const CATEGORIES: StoreItem['category'][] = ['Merchandise', 'NFT', 'Perk'];
const CATEGORY_FILTERS: { value: string; label: string }[] = [
    { value: 'all', label: 'All' },
    ...CATEGORIES.map(c => ({ value: c, label: c })),
];

export const StoreTab: React.FC<StoreTabProps> = ({ storeItems, onAddItem, onEditItem, onDeleteItem, onPreviewItem }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredItems = useMemo(() => {
        return storeItems.filter(item => {
            const searchMatch = searchTerm === '' ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [storeItems, searchTerm, categoryFilter]);

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-grow">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search store items…"
                        className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#7B61FF]/60 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none transition-all"
                    />
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>

                {/* Add button — platform gradient */}
                <button
                    onClick={onAddItem}
                    className="flex items-center justify-center gap-2 font-bold py-2.5 px-5 rounded-xl text-sm transition-all active:scale-95 flex-shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, #E040FB, #7B61FF)',
                        boxShadow: '0 4px 16px rgba(123,97,255,0.3)',
                        color: '#fff',
                    }}
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            {/* Category filter — pill buttons */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORY_FILTERS.map(cat => {
                    const active = categoryFilter === cat.value;
                    return (
                        <button
                            key={cat.value}
                            onClick={() => setCategoryFilter(cat.value)}
                            className="flex-shrink-0 text-xs font-bold rounded-full px-4 py-1.5 transition-all active:scale-95"
                            style={active
                                ? { background: 'linear-gradient(135deg, #E040FB, #7B61FF)', color: '#fff', boxShadow: '0 2px 10px rgba(123,97,255,0.3)' }
                                : { background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Items list */}
            <div className="space-y-3">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <AdminStoreItemListItem
                            key={item.id}
                            item={item}
                            onEdit={onEditItem}
                            onDelete={onDeleteItem}
                            onPreview={onPreviewItem}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 flex flex-col items-center gap-3">
                        <span className="text-4xl opacity-20">🛍</span>
                        <p className="text-gray-600 text-sm italic">No store items found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
