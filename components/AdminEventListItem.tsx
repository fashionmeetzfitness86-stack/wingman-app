
import React from 'react';
import { Event } from '../types';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/FeatureIcons';

interface AdminEventListItemProps {
    event: Event;
    venueName: string;
    onEdit: (event: Event) => void;
    onDelete: (event: Event) => void;
    onPreview: (event: Event) => void;
    isSelected?: boolean;
    onToggleSelect?: (eventId: number | string) => void;
}

export const AdminEventListItem: React.FC<AdminEventListItemProps> = ({ event, venueName, onEdit, onDelete, onPreview, isSelected, onToggleSelect }) => {
    return (
        <div className={`bg-gray-900 border ${isSelected ? 'border-[#EC4899] bg-gray-800/50' : 'border-gray-800'} rounded-lg p-4 flex items-center gap-4 transition-colors`}>
            {onToggleSelect && (
                <div className="flex-shrink-0">
                    <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => onToggleSelect(event.id)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-[#EC4899] focus:ring-[#EC4899] cursor-pointer"
                    />
                </div>
            )}
            <img className="w-20 h-20 rounded-lg object-cover" src={event.image} alt={event.title} />
            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                    <p className="font-bold text-white truncate">{event.title}</p>
                    <p className="text-sm text-gray-400">{event.date}</p>
                </div>
                <div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${event.type === 'EXCLUSIVE' ? 'bg-green-900/50 text-green-300' : 'bg-purple-900/50 text-purple-300'}`}>
                        {event.type}
                    </span>
                </div>
                <div>
                    <p className="text-sm text-gray-300">{venueName}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-300">
                        F: ${event.priceFemale} / M: ${event.priceMale}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); onPreview(event); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`Preview event ${event.title}`}>
                    <EyeIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`Edit event ${event.title}`}>
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(event); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-md transition-colors" aria-label={`Delete event ${event.title}`}>
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
