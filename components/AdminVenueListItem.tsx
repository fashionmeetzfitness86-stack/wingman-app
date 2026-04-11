import React from 'react';
import { Venue } from '../types';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/FeatureIcons';

interface AdminVenueListItemProps {
    venue: Venue;
    onEdit: (venue: Venue) => void;
    onDelete: (venue: Venue) => void;
    onPreview: (venue: Venue) => void;
}

export const AdminVenueListItem: React.FC<AdminVenueListItemProps> = ({ venue, onEdit, onDelete, onPreview }) => {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
            <img className="w-24 h-16 rounded-lg object-cover" src={venue.coverImage} alt={venue.name} />
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                    <p className="font-bold text-white truncate">{venue.name}</p>
                    <p className="text-sm text-gray-400">{venue.location}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-300">{venue.musicType}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-300">{venue.vibe}</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                 <button onClick={(e) => { e.stopPropagation(); onPreview(venue); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`Preview venue ${venue.name}`}>
                    <EyeIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onEdit(venue); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" aria-label={`Edit venue ${venue.name}`}>
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(venue); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-md transition-colors" aria-label={`Delete venue ${venue.name}`}>
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
