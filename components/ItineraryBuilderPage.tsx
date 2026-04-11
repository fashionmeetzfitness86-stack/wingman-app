
import React, { useState, useRef } from 'react';
import { Itinerary, ItineraryItem, Venue, Event, Experience, User } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { CheckIcon } from './icons/CheckIcon';

interface ItineraryBuilderPageProps {
  onSave: (itinerary: Itinerary) => void;
  onCancel: () => void;
  itinerary?: Itinerary;
  venues: Venue[];
  events: Event[];
  experiences: Experience[];
  users: User[];
  currentUser: User;
}

const itemTypeOptions: ItineraryItem['type'][] = ['venue', 'event', 'experience', 'note'];

export const ItineraryBuilderPage: React.FC<ItineraryBuilderPageProps> = ({ onSave, onCancel, itinerary, venues, events, experiences, users, currentUser }) => {
    const [title, setTitle] = useState(itinerary?.title || '');
    const [description, setDescription] = useState(itinerary?.description || '');
    const [date, setDate] = useState(itinerary?.date || new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<ItineraryItem[]>(itinerary?.items || []);
    
    // Sharing state
    const [isPublic, setIsPublic] = useState(itinerary?.isPublic || false);
    const [sharedWith, setSharedWith] = useState<number[]>(itinerary?.sharedWithUserIds || []);
    const [userSearch, setUserSearch] = useState('');

    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [newItemType, setNewItemType] = useState<ItineraryItem['type']>('venue');
    const [newItemId, setNewItemId] = useState<string>('');
    const [newItemCustomTitle, setNewItemCustomTitle] = useState('');
    const [newItemStartTime, setNewItemStartTime] = useState('');
    const [newItemEndTime, setNewItemEndTime] = useState('');
    const [newItemNotes, setNewItemNotes] = useState('');

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleSave = () => {
        if (!title.trim()) {
            alert("Please enter a title for your itinerary.");
            return;
        }

        const newItinerary: Itinerary = {
            id: itinerary?.id || 0,
            creatorId: itinerary?.creatorId || currentUser.id,
            title,
            description,
            date,
            items,
            sharedWithUserIds: sharedWith,
            isPublic: isPublic,
        };
        onSave(newItinerary);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: ItineraryItem = {
            id: `item-${Date.now()}`,
            type: newItemType,
            startTime: newItemStartTime,
            endTime: newItemEndTime || undefined,
            notes: newItemNotes || undefined,
        };

        if (newItemType === 'note') {
            newItem.customTitle = newItemCustomTitle;
        } else {
            newItem.itemId = parseInt(newItemId, 10);
        }

        setItems([...items, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime)));
        resetAddItemForm();
    };

    const handleRemoveItem = (idToRemove: string) => {
        setItems(items.filter(item => item.id !== idToRemove));
    };
    
    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) return;

        const newItems = [...items];
        const draggedItemContent = newItems.splice(dragItem.current, 1)[0];
        newItems.splice(dragOverItem.current, 0, draggedItemContent);
        
        dragItem.current = null;
        dragOverItem.current = null;
        
        setItems(newItems);
    };

    const resetAddItemForm = () => {
        setShowAddItemForm(false);
        setNewItemType('venue');
        setNewItemId('');
        setNewItemCustomTitle('');
        setNewItemStartTime('');
        setNewItemEndTime('');
        setNewItemNotes('');
    };

    const getItemName = (item: ItineraryItem) => {
        if (item.type === 'note') return item.customTitle;
        if (!item.itemId) return 'Unknown Item';
        
        let source: (Venue | Event | Experience)[] = [];
        if (item.type === 'venue') source = venues;
        if (item.type === 'event') source = events;
        if (item.type === 'experience') source = experiences;
        
        const found = source.find(i => i.id === item.itemId);
        
        if (!found) {
            return 'Item not found';
        }
        
        return 'title' in found ? found.title : found.name;
    };

    const getSelectorOptions = () => {
        switch (newItemType) {
            case 'venue':
                return venues.map(v => ({ id: v.id, name: v.name }));
            case 'event':
                return events.map(e => ({ id: e.id, name: e.title }));
            case 'experience':
                return experiences.map(e => ({ id: e.id, name: e.title }));
            default:
                return [];
        }
    };

    const toggleUserShare = (userId: number) => {
        setSharedWith(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const filteredUsers = users.filter(u => 
        u.id !== currentUser.id && 
        (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white space-y-8 pb-24">
            <div>
                <h1 className="text-2xl font-bold mb-6">{itinerary?.id ? 'Edit Itinerary' : 'Create New Itinerary'}</h1>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">Itinerary Title</label>
                        <input 
                            type="text" 
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Miami Birthday Weekend"
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                        <input 
                            type="date" 
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="A brief description of your planned itinerary."
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Sharing Section */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Sharing & Visibility</h2>
                
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="font-semibold text-white">Make Public</p>
                        <p className="text-sm text-gray-400">Allow anyone with the link to view this itinerary.</p>
                    </div>
                    <ToggleSwitch checked={isPublic} onChange={() => setIsPublic(!isPublic)} label="Make Public" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Share with Friends</label>
                    <input 
                        type="text" 
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search friends by name..."
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 mb-3 focus:ring-amber-400 focus:border-amber-400"
                    />
                    
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {filteredUsers.map(user => (
                            <button 
                                key={user.id}
                                onClick={() => toggleUserShare(user.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${sharedWith.includes(user.id) ? 'bg-blue-900/30 border border-blue-500/50' : 'bg-gray-800 border border-transparent hover:bg-gray-700'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <img src={user.profilePhoto} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                    <span className="text-sm font-medium text-white">{user.name}</span>
                                </div>
                                {sharedWith.includes(user.id) && <CheckIcon className="w-5 h-5 text-blue-400" />}
                            </button>
                        ))}
                        {filteredUsers.length === 0 && (
                            <p className="text-gray-500 text-center text-sm py-2">No users found.</p>
                        )}
                    </div>
                    {sharedWith.length > 0 && (
                        <p className="text-sm text-gray-400 mt-2">Shared with {sharedWith.length} friend(s).</p>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
                <h2 className="text-xl font-bold text-white mb-4">Itinerary Stops</h2>
                <div className="space-y-3">
                    {items.length > 0 ? items.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="bg-gray-900 p-4 rounded-lg flex items-start gap-4 cursor-grab active:cursor-grabbing border border-gray-800 hover:border-gray-600 transition-colors"
                            draggable
                            onDragStart={() => dragItem.current = index}
                            onDragEnter={() => dragOverItem.current = index}
                            onDragEnd={handleSort}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <div className="flex-grow">
                                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{item.type}</p>
                                <p className="font-bold text-white mt-1">{getItemName(item)}</p>
                                <p className="text-sm text-gray-400">{item.startTime}{item.endTime && ` - ${item.endTime}`}</p>
                                {item.notes && <p className="text-sm text-gray-300 mt-2 italic bg-gray-800/50 p-2 rounded">"{item.notes}"</p>}
                            </div>
                            <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" aria-label={`Remove ${getItemName(item)}`}>
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )) : (
                        <div className="text-center py-8 bg-gray-900 rounded-lg border border-dashed border-gray-700">
                            <p className="text-gray-500">No stops added yet. Start building your night!</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
                {!showAddItemForm ? (
                    <button onClick={() => setShowAddItemForm(true)} className="w-full flex items-center justify-center gap-2 bg-gray-800 font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors text-gray-200">
                        <PlusIcon className="w-5 h-5"/>
                        Add Stop
                    </button>
                ) : (
                    <div className="bg-gray-900 p-6 rounded-xl space-y-4 border border-gray-700 shadow-lg">
                        <h3 className="text-lg font-semibold text-white">Add New Stop</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                            <select value={newItemType} onChange={e => setNewItemType(e.target.value as ItineraryItem['type'])} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400">
                                {itemTypeOptions.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                            </select>
                        </div>
                        
                        {newItemType === 'note' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                <input type="text" value={newItemCustomTitle} onChange={e => setNewItemCustomTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400" required placeholder="e.g., Meet at lobby" />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select {newItemType}</label>
                                <select value={newItemId} onChange={e => setNewItemId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400" required>
                                    <option value="" disabled>-- Select an option --</option>
                                    {getSelectorOptions().map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Start Time</label>
                                <input type="time" value={newItemStartTime} onChange={e => setNewItemStartTime(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400" required />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">End Time <span className="text-gray-500">(Opt.)</span></label>
                                <input type="time" value={newItemEndTime} onChange={e => setNewItemEndTime(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Notes <span className="text-gray-500">(Opt.)</span></label>
                            <textarea value={newItemNotes} onChange={e => setNewItemNotes(e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 resize-none" />
                        </div>
                        
                        <div className="flex gap-4 pt-2">
                            <button type="button" onClick={resetAddItemForm} className="flex-1 bg-gray-700 font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                            <button onClick={handleAddItem} type="button" className="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-300 transition-colors">Add Stop</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-4">
                <button onClick={onCancel} className="w-full bg-gray-800 font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors text-gray-300">Cancel</button>
                <button onClick={handleSave} className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-400 transition-transform hover:scale-105 shadow-lg shadow-green-500/20">Save Itinerary</button>
            </div>
        </div>
    );
};
