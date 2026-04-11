
import React, { useState, useEffect } from 'react';
import { Event, Venue, UserAccessLevel } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface AdminEditEventModalProps {
  event: Event | null;
  venues: Venue[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
}

export const AdminEditEventModal: React.FC<AdminEditEventModalProps> = ({ event, venues, isOpen, onClose, onSave }) => {
    const [editedEvent, setEditedEvent] = useState<Partial<Event>>(event || {});

    useEffect(() => {
        setEditedEvent(event ? {
            ...event,
            accessLevels: event.accessLevels || Object.values(UserAccessLevel)
        } : {
            type: 'EXCLUSIVE',
            priceFemale: 0,
            priceMale: 100,
            accessLevels: Object.values(UserAccessLevel)
        });
    }, [event]);

    const handleSave = () => {
        // Basic validation
        if (!editedEvent.title || !editedEvent.date || !editedEvent.venueId) {
            alert('Please fill out all required fields.');
            return;
        }
        if (editedEvent.recurrence && (!editedEvent.recurrence.frequency || !editedEvent.recurrence.endDate)) {
            alert('Please provide frequency and end date for recurring events.');
            return;
        }
        onSave(editedEvent as Event);
    };

    const handleChange = (field: keyof Event, value: any) => {
        setEditedEvent(prev => ({ ...prev, [field]: value }));
    };

    const handleAccessLevelToggle = (level: UserAccessLevel) => {
        setEditedEvent(prev => {
            const currentLevels = prev.accessLevels || [];
            const newLevels = currentLevels.includes(level)
                ? currentLevels.filter(l => l !== level)
                : [...currentLevels, level];
            return { ...prev, accessLevels: newLevels };
        });
    };

    const handleRecurrenceChange = (isRecurring: boolean) => {
        setEditedEvent(prev => {
            const newEvent = {...prev};
            if (isRecurring) {
                if (!newEvent.recurrence) {
                    newEvent.recurrence = { frequency: 'weekly', endDate: '' };
                }
            } else {
                delete newEvent.recurrence;
            }
            return newEvent;
        });
    };
    
    const handleRecurrenceDetailChange = (field: 'frequency' | 'endDate', value: any) => {
        setEditedEvent(prev => ({
            ...prev,
            recurrence: {
                ...prev.recurrence!,
                [field]: value,
            },
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">{event ? 'Edit Event' : 'Add New Event'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <InputField label="Event Title" value={editedEvent.title || ''} onChange={e => handleChange('title', e.target.value)} required />
                    <TextAreaField label="Description" value={editedEvent.description || ''} onChange={e => handleChange('description', e.target.value)} />
                    <InputField label="Image URL" value={editedEvent.image || ''} onChange={e => handleChange('image', e.target.value)} placeholder="https://picsum.photos/seed/..."/>
                    <InputField label="Start Date" type="date" value={editedEvent.date || ''} onChange={e => handleChange('date', e.target.value)} required />
                    <SelectField label="Event Type" value={editedEvent.type || 'EXCLUSIVE'} onChange={e => handleChange('type', e.target.value as 'EXCLUSIVE' | 'INVITE ONLY')} options={['EXCLUSIVE', 'INVITE ONLY']} required />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Permitted Access Levels</label>
                        <div className="space-y-2">
                            {Object.values(UserAccessLevel).map(level => (
                                <label key={level} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg cursor-pointer hover:bg-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={editedEvent.accessLevels?.includes(level) ?? true}
                                        onChange={() => handleAccessLevelToggle(level)}
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"
                                    />
                                    <span className="text-white">{level}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <SelectField label="Venue" value={String(editedEvent.venueId || '')} onChange={e => handleChange('venueId', parseInt(e.target.value, 10))} options={venues.map(v => ({ label: v.name, value: v.id }))} required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Female Price" type="number" value={String(editedEvent.priceFemale ?? 0)} onChange={e => handleChange('priceFemale', parseFloat(e.target.value))} />
                        <InputField label="Male Price" type="number" value={String(editedEvent.priceMale ?? 0)} onChange={e => handleChange('priceMale', parseFloat(e.target.value))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="General Price" type="number" value={String(editedEvent.priceGeneral ?? '')} onChange={e => handleChange('priceGeneral', e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="Optional"/>
                        <InputField label="Capacity" type="number" value={String(editedEvent.capacity ?? '')} onChange={e => handleChange('capacity', e.target.value ? parseInt(e.target.value, 10) : undefined)} placeholder="Optional"/>
                    </div>

                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={!!editedEvent.recurrence}
                                onChange={(e) => handleRecurrenceChange(e.target.checked)}
                                className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"
                            />
                            <span className="font-semibold text-white">Make this a recurring event</span>
                        </label>

                        {editedEvent.recurrence && (
                            <div className="grid grid-cols-2 gap-4 mt-4 pl-8 animate-fade-in">
                                <SelectField 
                                    label="Frequency"
                                    value={editedEvent.recurrence.frequency}
                                    onChange={e => handleRecurrenceDetailChange('frequency', e.target.value)}
                                    options={['daily', 'weekly', 'monthly']}
                                    required
                                />
                                <InputField 
                                    label="End Date"
                                    type="date"
                                    value={editedEvent.recurrence.endDate}
                                    onChange={e => handleRecurrenceDetailChange('endDate', e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-amber-400 text-black font-bold py-2 px-4 rounded-lg">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string; value: string; onChange: (e: any) => void; type?: string; required?: boolean; placeholder?: string; }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <input className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400" {...props} />
    </div>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (e: any) => void; }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <textarea rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 resize-none" {...props} />
    </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (e: any) => void; options: (string | { label: string, value: any })[]; required?: boolean; }> = ({ label, value, onChange, options, required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
        <select value={value} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400">
            <option value="" disabled>-- Select --</option>
            {options.map(opt => (
                typeof opt === 'string' ? <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option> : <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);
