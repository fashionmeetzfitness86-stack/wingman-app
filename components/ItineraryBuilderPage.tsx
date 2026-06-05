
import React, { useState, useRef } from 'react';
import { Itinerary, ItineraryItem, Venue, Event, Experience, User, Page } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface ItineraryBuilderPageProps {
  onSave:    (itinerary: Itinerary) => void;
  onCancel:  () => void;
  itinerary?: Itinerary;
  venues:    Venue[];
  events:    Event[];
  experiences: Experience[];
  users:     User[];
  currentUser: User;
}

const itemTypeOptions: ItineraryItem['type'][] = ['venue', 'event', 'experience', 'note'];

const typeAccents: Record<string, string> = {
    venue:      '#6366f1',
    event:      '#fb923c',
    experience: '#34d399',
    note:       '#9ca3af',
};

// ── Shared style tokens
const CARD: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 20,
};

const INPUT: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 14,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    colorScheme: 'dark' as any,
};

const FieldLabel: React.FC<{ label: string; hint?: string }> = ({ label, hint }) => (
    <div className="mb-2">
        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6b7280' }}>{label}</label>
        {hint && <p className="text-[10px] mt-0.5" style={{ color: '#374151' }}>{hint}</p>}
    </div>
);

const SectionCard: React.FC<{ title: string; accent?: string; children: React.ReactNode }> = ({ title, accent = '#6366f1', children }) => (
    <div style={CARD}>
        <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
            <h2 className="text-base font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
        </div>
        {children}
    </div>
);

export const ItineraryBuilderPage: React.FC<ItineraryBuilderPageProps> = ({
    onSave, onCancel, itinerary, venues, events, experiences, users, currentUser,
}) => {
    const [title,       setTitle]       = useState(itinerary?.title || '');
    const [description, setDescription] = useState(itinerary?.description || '');
    const [date,        setDate]        = useState(itinerary?.date || new Date().toISOString().split('T')[0]);
    const [items,       setItems]       = useState<ItineraryItem[]>(itinerary?.items || []);

    // Sharing
    const [isPublic,  setIsPublic]  = useState(itinerary?.isPublic || false);
    const [sharedWith,setSharedWith]= useState<number[]>(itinerary?.sharedWithUserIds || []);
    const [userSearch,setUserSearch]= useState('');

    // Add-item form
    const [showAddItemForm,    setShowAddItemForm]    = useState(false);
    const [newItemType,        setNewItemType]        = useState<ItineraryItem['type']>('venue');
    const [newItemId,          setNewItemId]          = useState<string>('');
    const [newItemCustomTitle, setNewItemCustomTitle] = useState('');
    const [newItemStartTime,   setNewItemStartTime]   = useState('');
    const [newItemEndTime,     setNewItemEndTime]     = useState('');
    const [newItemNotes,       setNewItemNotes]       = useState('');

    const dragItem     = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleSave = () => {
        if (!title.trim()) {
            (window as any).showAppToast?.('Please enter a title for your itinerary.');
            return;
        }
        const newItinerary: Itinerary = {
            id:                 itinerary?.id || 0,
            creatorId:          itinerary?.creatorId || currentUser.id,
            title, description, date, items,
            sharedWithUserIds:  sharedWith,
            isPublic,
        };
        onSave(newItinerary);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: ItineraryItem = {
            id:        `item-${Date.now()}`,
            type:      newItemType,
            startTime: newItemStartTime,
            endTime:   newItemEndTime || undefined,
            notes:     newItemNotes   || undefined,
        };
        if (newItemType === 'note') {
            newItem.customTitle = newItemCustomTitle;
        } else {
            newItem.itemId = parseInt(newItemId, 10);
        }
        setItems([...items, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime)));
        resetAddItemForm();
    };

    const handleRemoveItem = (id: string) => setItems(items.filter(item => item.id !== id));

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) return;
        const newItems = [...items];
        const dragged  = newItems.splice(dragItem.current, 1)[0];
        newItems.splice(dragOverItem.current, 0, dragged);
        dragItem.current = null; dragOverItem.current = null;
        setItems(newItems);
    };

    const resetAddItemForm = () => {
        setShowAddItemForm(false);
        setNewItemType('venue'); setNewItemId(''); setNewItemCustomTitle('');
        setNewItemStartTime(''); setNewItemEndTime(''); setNewItemNotes('');
    };

    const getItemName = (item: ItineraryItem): string => {
        if (item.type === 'note') return item.customTitle || 'Note';
        if (!item.itemId) return 'Unknown';
        const src: (Venue | Event | Experience)[] =
            item.type === 'venue' ? venues : item.type === 'event' ? events : experiences;
        const found = src.find(i => i.id === item.itemId);
        if (!found) return 'Item not found';
        return 'title' in found ? found.title : found.name;
    };

    const getSelectorOptions = () => {
        switch (newItemType) {
            case 'venue':      return venues.map(v => ({ id: v.id, name: v.name }));
            case 'event':      return events.map(e => ({ id: e.id, name: e.title }));
            case 'experience': return experiences.map(e => ({ id: e.id, name: e.title }));
            default:           return [];
        }
    };

    const toggleUserShare = (userId: number) =>
        setSharedWith(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);

    const filteredUsers = users.filter(u =>
        u.id !== currentUser.id &&
        (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
         u.email.toLowerCase().includes(userSearch.toLowerCase()))
    );

    const isEditing = !!itinerary?.id;

    return (
        <div className="min-h-screen pb-36 animate-fade-in" style={{ background: '#08080A' }}>

            {/* ── Sticky header */}
            <div
                className="sticky top-0 z-30 px-5 pt-5 pb-4"
                style={{ background: 'rgba(8,8,10,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
                <div className="flex items-center justify-between">
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ color: '#9ca3af' }}
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Back
                    </button>

                    {/* Save shortcut in header */}
                    <button
                        onClick={handleSave}
                        className="text-sm font-black rounded-xl px-5 py-2 transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}
                    >
                        Save
                    </button>
                </div>

                <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#6366f1' }}>
                        Itinerary Builder
                    </p>
                    <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {isEditing ? 'Edit Itinerary' : 'New Itinerary'}
                    </h1>
                </div>
            </div>

            <div className="px-5 pt-5 space-y-5">

                {/* ── Details card */}
                <SectionCard title="Trip Details" accent="#6366f1">
                    <div className="space-y-4">
                        <div>
                            <FieldLabel label="Title" />
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., Miami Birthday Weekend"
                                style={INPUT}
                                className="placeholder-gray-700"
                            />
                        </div>
                        <div>
                            <FieldLabel label="Date" />
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                style={INPUT}
                            />
                        </div>
                        <div>
                            <FieldLabel label="Description" hint="Optional — what's the vibe?" />
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                placeholder="A brief description of your planned itinerary."
                                style={{ ...INPUT, resize: 'none' }}
                                className="placeholder-gray-700"
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* ── Sharing card */}
                <SectionCard title="Sharing & Visibility" accent="#fb923c">
                    {/* Public toggle */}
                    <div
                        className="flex items-center justify-between p-4 rounded-2xl mb-4"
                        style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.15)' }}
                    >
                        <div>
                            <p className="text-sm font-bold text-white">Make Public</p>
                            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Anyone with the link can view</p>
                        </div>
                        <ToggleSwitch checked={isPublic} onChange={() => setIsPublic(!isPublic)} label="Make Public" />
                    </div>

                    {/* Friend search */}
                    <div>
                        <FieldLabel label="Share with Friends" />
                        <input
                            type="text"
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            placeholder="Search by name…"
                            style={INPUT}
                            className="placeholder-gray-700 mb-3"
                        />

                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                            {filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => toggleUserShare(user.id)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all active:scale-[0.98]"
                                    style={sharedWith.includes(user.id)
                                        ? { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }
                                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={user.profilePhoto} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                        <span className="text-sm font-semibold text-white">{user.name}</span>
                                    </div>
                                    {sharedWith.includes(user.id) && <CheckIcon className="w-4 h-4" style={{ color: '#818cf8' } as any} />}
                                </button>
                            ))}
                            {filteredUsers.length === 0 && (
                                <p className="text-xs text-center py-3" style={{ color: '#374151' }}>No friends found.</p>
                            )}
                        </div>
                        {sharedWith.length > 0 && (
                            <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                                Shared with <span className="text-white font-bold">{sharedWith.length}</span> friend{sharedWith.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </SectionCard>

                {/* ── Stops card */}
                <SectionCard title="Itinerary Stops" accent="#34d399">
                    <div className="space-y-3">
                        {items.length > 0 ? items.map((item, index) => {
                            const accent = typeAccents[item.type] || '#9ca3af';
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                                    draggable
                                    onDragStart={() => dragItem.current = index}
                                    onDragEnter={() => dragOverItem.current = index}
                                    onDragEnd={handleSort}
                                    onDragOver={e => e.preventDefault()}
                                >
                                    {/* Type dot */}
                                    <div
                                        className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                                        style={{ background: accent }}
                                    />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: accent }}>
                                            {item.type} {item.startTime && `· ${item.startTime}`}
                                        </p>
                                        <p className="font-bold text-white text-sm leading-tight truncate">{getItemName(item)}</p>
                                        {item.notes && (
                                            <p className="text-xs mt-1.5 italic" style={{ color: '#6b7280' }}>"{item.notes}"</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="p-1.5 rounded-xl transition-all flex-shrink-0"
                                        style={{ color: '#4b5563' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4b5563'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        }) : (
                            <div
                                className="text-center py-10 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
                            >
                                <p className="text-sm" style={{ color: '#374151' }}>No stops yet. Add your first stop below.</p>
                            </div>
                        )}
                    </div>

                    {/* Add stop */}
                    <div className="mt-4">
                        {!showAddItemForm ? (
                            <button
                                onClick={() => setShowAddItemForm(true)}
                                className="w-full flex items-center justify-center gap-2 font-bold text-sm rounded-2xl py-3.5 transition-all active:scale-[0.98]"
                                style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px dashed rgba(52,211,153,0.3)' }}
                            >
                                <PlusIcon className="w-4 h-4" />
                                Add Stop
                            </button>
                        ) : (
                            <div
                                className="p-5 rounded-2xl space-y-4 mt-2"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}
                            >
                                <p className="text-sm font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Add New Stop</p>

                                {/* Type tabs */}
                                <div>
                                    <FieldLabel label="Type" />
                                    <div className="flex gap-2 flex-wrap">
                                        {itemTypeOptions.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewItemType(type)}
                                                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                                                style={newItemType === type
                                                    ? { background: `${typeAccents[type]}18`, color: typeAccents[type], border: `1px solid ${typeAccents[type]}40` }
                                                    : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.07)' }}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {newItemType === 'note' ? (
                                    <div>
                                        <FieldLabel label="Note Title" />
                                        <input
                                            type="text"
                                            value={newItemCustomTitle}
                                            onChange={e => setNewItemCustomTitle(e.target.value)}
                                            placeholder="e.g., Meet at lobby"
                                            style={INPUT}
                                            className="placeholder-gray-700"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <FieldLabel label={`Select ${newItemType}`} />
                                        <select
                                            value={newItemId}
                                            onChange={e => setNewItemId(e.target.value)}
                                            style={{ ...INPUT, cursor: 'pointer' }}
                                        >
                                            <option value="" disabled>— Choose —</option>
                                            {getSelectorOptions().map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel label="Start Time" />
                                        <input type="time" value={newItemStartTime} onChange={e => setNewItemStartTime(e.target.value)} style={INPUT} required />
                                    </div>
                                    <div>
                                        <FieldLabel label="End Time" hint="Optional" />
                                        <input type="time" value={newItemEndTime} onChange={e => setNewItemEndTime(e.target.value)} style={INPUT} />
                                    </div>
                                </div>

                                <div>
                                    <FieldLabel label="Notes" hint="Optional" />
                                    <textarea
                                        value={newItemNotes}
                                        onChange={e => setNewItemNotes(e.target.value)}
                                        rows={2}
                                        style={{ ...INPUT, resize: 'none' }}
                                        className="placeholder-gray-700"
                                    />
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={resetAddItemForm}
                                        className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all"
                                        style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddItem}
                                        type="button"
                                        className="flex-[2] py-3 rounded-2xl text-sm font-black text-black transition-all active:scale-[0.98]"
                                        style={{ background: 'linear-gradient(135deg,#34d399,#10b981)', boxShadow: '0 4px 16px rgba(52,211,153,0.3)' }}
                                    >
                                        Add Stop
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* ── Bottom action row */}
                <div className="flex gap-3 pb-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 rounded-2xl text-sm font-bold transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-[2] py-4 rounded-2xl text-sm font-black text-white transition-all active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                            boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
                        }}
                    >
                        {isEditing ? 'Save Changes' : 'Create Itinerary'}
                    </button>
                </div>

            </div>
        </div>
    );
};
