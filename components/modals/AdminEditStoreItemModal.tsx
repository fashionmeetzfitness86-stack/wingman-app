import React, { useState, useEffect } from 'react';
import { StoreItem } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface AdminEditStoreItemModalProps {
  item: StoreItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: StoreItem) => void;
}

const CATEGORIES: StoreItem['category'][] = ['Merchandise', 'NFT', 'Perk'];

export const AdminEditStoreItemModal: React.FC<AdminEditStoreItemModalProps> = ({ item, isOpen, onClose, onSave }) => {
    const [editedItem, setEditedItem] = useState<Partial<StoreItem>>(item || {});

    useEffect(() => {
        setEditedItem(item || {
            category: 'Merchandise',
            price: 0,
            priceUSD: 0
        });
    }, [item, isOpen]);

    const handleSave = () => {
        if (!editedItem.title || !editedItem.image) {
            alert('Please fill out title and add an image.');
            return;
        }
        onSave(editedItem as StoreItem);
    };

    const handleChange = (field: keyof StoreItem, value: any) => {
        setEditedItem(prev => ({ ...prev, [field]: value }));
    };
    
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (editedItem.video?.startsWith('blob:')) {
                URL.revokeObjectURL(editedItem.video);
            }
            const objectUrl = URL.createObjectURL(file);
            handleChange('video', objectUrl);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">{item ? 'Edit Store Item' : 'Add New Store Item'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <InputField label="Title" value={editedItem.title || ''} onChange={e => handleChange('title', e.target.value)} required />
                    <SelectField label="Category" value={editedItem.category || 'Merchandise'} onChange={e => handleChange('category', e.target.value as StoreItem['category'])} options={CATEGORIES} required />
                    <TextAreaField label="Description" value={editedItem.description || ''} onChange={e => handleChange('description', e.target.value)} />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image <span className="text-red-500">*</span></label>
                        {editedItem.image ? (
                            <div className="relative">
                                <img src={editedItem.image} alt="Item preview" className="w-full h-48 object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => handleChange('image', '')}
                                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-600"
                                    aria-label="Remove image"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="image-upload" className="cursor-pointer bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-[#EC4899]">
                                <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mb-2" />
                                <span className="text-[#EC4899] font-semibold">Click to upload image</span>
                                <span className="text-xs text-gray-500 mt-1">PNG or JPG</span>
                                <input id="image-upload" type="file" className="sr-only" onChange={handleImageFileChange} accept="image/png, image/jpeg" />
                            </label>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Item Video (Optional)</label>
                        {editedItem.video ? (
                            <div className="relative">
                                <video src={editedItem.video} controls className="w-full h-48 rounded-lg bg-black" />
                                <button
                                    type="button"
                                    onClick={() => handleChange('video', '')}
                                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-600"
                                    aria-label="Remove video"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="video-upload" className="cursor-pointer bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-[#EC4899]">
                                <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mb-2" />
                                <span className="text-[#EC4899] font-semibold">Click to upload video</span>
                                <span className="text-xs text-gray-500 mt-1">MP4, MOV, etc.</span>
                                <input id="video-upload" type="file" className="sr-only" onChange={handleVideoFileChange} accept="video/*" />
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Token Price (TMKC)" type="number" value={String(editedItem.price ?? 0)} onChange={e => handleChange('price', parseFloat(e.target.value))} />
                        <InputField label="USD Price ($)" type="number" value={String(editedItem.priceUSD ?? 0)} onChange={e => handleChange('priceUSD', parseFloat(e.target.value))} />
                    </div>
                </div>
                <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg">Save Item</button>
                </div>
            </div>
        </div>
    );
};


const InputField: React.FC<{ label: string; value: string; onChange: (e: any) => void; type?: string; required?: boolean; placeholder?: string; }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <input className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]" {...props} />
    </div>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (e: any) => void; }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <textarea rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899] resize-none" {...props} />
    </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (e: any) => void; options: string[]; required?: boolean; }> = ({ label, value, onChange, options, required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
        <select value={value} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);