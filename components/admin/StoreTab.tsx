import React, { useMemo, useState } from 'react';
import { StoreItem } from '../../types';
import { AdminStoreItemListItem } from '../AdminStoreItemListItem';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface StoreTabProps {
    storeItems: StoreItem[];
    onAddItem: () => void;
    onEditItem: (item: StoreItem) => void;
    onDeleteItem: (item: StoreItem) => void;
    onPreviewItem: (item: StoreItem) => void;
}

const CATEGORIES: StoreItem['category'][] = ['Merchandise', 'NFT', 'Perk'];

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search store items..."
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                    </div>
                </div>
                <div className="relative md:w-48">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 appearance-none focus:ring-[#EC4899] focus:border-[#EC4899] pr-8"
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                </div>
                 <button onClick={onAddItem} className="flex items-center justify-center gap-2 bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg text-sm">
                    <PlusIcon className="w-5 h-5" />
                    Add New Item
                </button>
            </div>
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
                    <p className="text-center text-gray-500 py-8">No store items found.</p>
                )}
            </div>
        </div>
    );
};
