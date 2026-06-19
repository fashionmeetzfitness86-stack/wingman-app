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

const ALL_CATEGORIES = ['All', 'Merchandise', 'NFT', 'Perk'] as const;
type CategoryFilter = typeof ALL_CATEGORIES[number];

const CAT_ICONS: Record<string, string> = {
    All: '✦', Merchandise: '👕', NFT: '🎨', Perk: '⚡',
};

export const StoreTab: React.FC<StoreTabProps> = ({ storeItems, onAddItem, onEditItem, onDeleteItem, onPreviewItem }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

    const filteredItems = useMemo(() => {
        return storeItems.filter(item => {
            const searchMatch = searchTerm === '' ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter === 'All' || item.category === categoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [storeItems, searchTerm, categoryFilter]);

    return (
        <div className="space-y-5 pb-8">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Store Items</h3>
                    <p className="text-[11px] text-gray-600 mt-0.5">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} · Merchandise, NFTs &amp; Perks</p>
                </div>
                <button
                    onClick={onAddItem}
                    className="flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl text-sm transition-all active:scale-95 flex-shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)',
                        boxShadow: '0 4px 16px rgba(224,64,251,0.25)',
                        color: '#fff',
                    }}
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            {/* ── Search bar ── */}
            <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                    type="search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search store items…"
                    className="w-full text-white placeholder-gray-600 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
            </div>

            {/* ── Category pills ── */}
            <div className="flex gap-2 flex-wrap">
                {ALL_CATEGORIES.map(cat => {
                    const active = categoryFilter === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className="flex-shrink-0 text-xs font-bold rounded-full px-3.5 py-1.5 transition-all"
                            style={active
                                ? { background: 'linear-gradient(135deg, #E040FB, #7B61FF)', color: '#fff', boxShadow: '0 4px 12px rgba(224,64,251,0.2)' }
                                : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            {CAT_ICONS[cat]} {cat}
                        </button>
                    );
                })}
            </div>

            {/* ── Items list ── */}
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
                    <div
                        className="rounded-2xl p-12 text-center"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="text-4xl mb-3">🛍</div>
                        <p className="text-gray-600 text-sm font-medium">No store items found.</p>
                        <button
                            onClick={onAddItem}
                            className="mt-4 text-xs font-bold rounded-full px-4 py-2 transition-all"
                            style={{ background: 'rgba(224,64,251,0.1)', color: '#E040FB', border: '1px solid rgba(224,64,251,0.2)' }}
                        >
                            + Add your first item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

