import React, { useState, useEffect } from 'react';
import { Venue, TableOption } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface AdminEditVenueModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (venue: Venue) => void;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CATEGORIES: Venue['category'][] = ['Nightclub', 'Restaurant', 'Lounge', 'Beach Club', 'Pool Party'];

export const AdminEditVenueModal: React.FC<AdminEditVenueModalProps> = ({ venue, isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<Venue['category']>('Nightclub');
    const [location, setLocation] = useState('');
    const [musicType, setMusicType] = useState('');
    const [vibe, setVibe] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [videoTourUrl, setVideoTourUrl] = useState('');
    const [operatingDays, setOperatingDays] = useState<string[]>([]);
    const [capacity, setCapacity] = useState<number | ''>('');
    const [amenities, setAmenities] = useState('');
    const [isGuestlistAvailable, setIsGuestlistAvailable] = useState(false);
    const [guestlistCapacity, setGuestlistCapacity] = useState<number | ''>('');
    const [tableOptions, setTableOptions] = useState<TableOption[]>([]);

    useEffect(() => {
        setName(venue?.name || '');
        setCategory(venue?.category || 'Nightclub');
        setLocation(venue?.location || '');
        setMusicType(venue?.musicType || '');
        setVibe(venue?.vibe || '');
        setCoverImage(venue?.coverImage || '');
        setVideoTourUrl(venue?.videoTourUrl || '');
        setOperatingDays(venue?.operatingDays || []);
        setCapacity(venue?.capacity || '');
        setAmenities(venue?.amenities?.join(', ') || '');
        setIsGuestlistAvailable(venue?.isGuestlistAvailable || false);
        setGuestlistCapacity(venue?.guestlistCapacity || '');
        setTableOptions(venue?.tableOptions ? JSON.parse(JSON.stringify(venue.tableOptions)) : []);
    }, [venue]);
    
    const handleDayToggle = (day: string) => {
        setOperatingDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Clean up old object URL to prevent memory leaks
            if (videoTourUrl.startsWith('blob:')) {
                URL.revokeObjectURL(videoTourUrl);
            }
            const objectUrl = URL.createObjectURL(file);
            setVideoTourUrl(objectUrl);
        }
    };
    
    const handleTableChange = (index: number, field: keyof TableOption, value: any) => {
        const newOptions = [...tableOptions];
        const updatedTable = { ...newOptions[index] };
    
        if (field === 'minSpend' || field === 'totalAvailable') {
            (updatedTable as any)[field] = value === '' ? undefined : parseInt(value, 10);
        } else {
            (updatedTable as any)[field] = value;
        }
        
        newOptions[index] = updatedTable;
        setTableOptions(newOptions);
    };

    const handleAddTable = () => {
        setTableOptions([...tableOptions, {
            id: `new-table-${Date.now()}`,
            name: '',
            area: '',
            minSpend: 0,
            description: '',
            capacityHint: 'Small Groups'
        }]);
    };

    const handleRemoveTable = (index: number) => {
        setTableOptions(tableOptions.filter((_, i) => i !== index));
    };


    const handleSaveChanges = () => {
        const venueData: Venue = {
            id: venue?.id || 0,
            name,
            category,
            location,
            musicType,
            vibe,
            coverImage,
            videoTourUrl: videoTourUrl || undefined,
            operatingDays,
            capacity: Number(capacity) || undefined,
            amenities: amenities.split(',').map(a => a.trim()).filter(Boolean),
            tableOptions: tableOptions,
            isGuestlistAvailable,
            guestlistCapacity: Number(guestlistCapacity) || undefined,
        };
        onSave(venueData);
    };
  
    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
        <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">{venue ? `Edit Venue: ${venue.name}` : 'Add New Venue'}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Name" value={name} onChange={e => setName(e.target.value)} required />
                    <SelectField label="Category" value={category} onChange={e => setCategory(e.target.value as Venue['category'])} options={CATEGORIES} />
                </div>
                <InputField label="Location" value={location} onChange={e => setLocation(e.target.value)} required />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Music Type" value={musicType} onChange={e => setMusicType(e.target.value)} />
                    <InputField label="Vibe" value={vibe} onChange={e => setVibe(e.target.value)} />
                </div>
                <InputField label="Capacity" type="number" value={String(capacity)} onChange={e => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value, 10))} />

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image</label>
                    {coverImage ? (
                        <div className="relative">
                            <img src={coverImage} alt="Cover preview" className="w-full h-48 object-cover rounded-lg" />
                            <button type="button" onClick={() => setCoverImage('')} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-600" aria-label="Remove image">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="image-upload" className="cursor-pointer bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-amber-400">
                            <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="text-amber-400 font-semibold">Click to upload image</span>
                            <span className="text-xs text-gray-500 mt-1">PNG or JPG</span>
                            <input id="image-upload" type="file" className="sr-only" onChange={handleImageFileChange} accept="image/png, image/jpeg" />
                        </label>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Video Tour</label>
                    {videoTourUrl ? (
                        <div className="relative">
                            <video src={videoTourUrl} controls className="w-full h-48 rounded-lg bg-black" />
                            <button type="button" onClick={() => setVideoTourUrl('')} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-600" aria-label="Remove video">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="video-upload" className="cursor-pointer bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-amber-400">
                            <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="text-amber-400 font-semibold">Click to upload video</span>
                            <span className="text-xs text-gray-500 mt-1">MP4, MOV, etc.</span>
                            <input id="video-upload" type="file" className="sr-only" onChange={handleVideoFileChange} accept="video/*" />
                        </label>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Operating Days</label>
                    <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map(day => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => handleDayToggle(day)}
                                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${operatingDays.includes(day) ? 'bg-amber-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amenities (comma-separated)</label>
                    <textarea value={amenities} onChange={e => setAmenities(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 resize-none" />
                </div>
                <div className="border-t border-gray-700 pt-4 mt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={isGuestlistAvailable}
                            onChange={(e) => setIsGuestlistAvailable(e.target.checked)}
                            className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="font-semibold text-white">Enable Guestlist</span>
                    </label>

                    {isGuestlistAvailable && (
                        <div className="mt-4 pl-8 animate-fade-in">
                            <InputField 
                                label="Guestlist Spots Available"
                                type="number"
                                value={String(guestlistCapacity)}
                                onChange={e => setGuestlistCapacity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            />
                        </div>
                    )}
                </div>
                
                 <div className="border-t border-gray-700 pt-4 mt-4">
                    <h3 className="text-lg font-bold text-white mb-4">Manage Table Options</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {tableOptions.map((table, index) => (
                             <div key={index} className="bg-gray-800 p-4 rounded-lg space-y-3 relative">
                                <button type="button" onClick={() => handleRemoveTable(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <InputField label="Table Name" value={table.name} onChange={e => handleTableChange(index, 'name', e.target.value)} />
                                    <InputField label="Area" value={table.area} onChange={e => handleTableChange(index, 'area', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <InputField label="Min Spend ($)" type="number" value={String(table.minSpend)} onChange={e => handleTableChange(index, 'minSpend', e.target.value)} />
                                    <SelectField label="Capacity Hint" value={table.capacityHint} onChange={e => handleTableChange(index, 'capacityHint', e.target.value)} options={['Small Groups', 'Large Groups']} />
                                </div>
                                 <InputField label="Total Available" type="number" value={String(table.totalAvailable ?? '')} onChange={e => handleTableChange(index, 'totalAvailable', e.target.value)} placeholder="Optional"/>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                    <textarea value={table.description} onChange={e => handleTableChange(index, 'description', e.target.value)} rows={2} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
                                    <input type="text" value={table.notes || ''} onChange={e => handleTableChange(index, 'notes', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm" />
                                </div>
                             </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddTable} className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-700/50 border border-dashed border-gray-600 text-gray-300 font-semibold py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        <PlusIcon className="w-5 h-5"/>
                        Add Table Option
                    </button>
                 </div>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
                <button onClick={onClose} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={handleSaveChanges} className="bg-amber-400 text-black font-bold py-2 px-4 rounded-lg">Save Changes</button>
            </div>
        </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; value: string; onChange: (e: any) => void; type?: string; required?: boolean; placeholder?: string; }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <input className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm" {...props} />
    </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (e: any) => void; options: string[]; required?: boolean; }> = ({ label, value, onChange, options, required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <select value={value} onChange={onChange} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
