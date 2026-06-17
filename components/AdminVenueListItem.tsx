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
    onToggleHide?: (venue: Venue) => void;
}

// Eye-slash icon (hide)
const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export const AdminVenueListItem: React.FC<AdminVenueListItemProps> = ({ venue, onEdit, onDelete, onPreview, onToggleHide }) => {
    return (
        <div className={`border rounded-md p-4 flex items-center gap-4 transition-all ${venue.isHidden ? 'border-[#2A1A00] bg-[#0A0A0A] opacity-60' : 'border-[#1C1D22] bg-[#0F1014]'}`}>
            <div className="relative flex-shrink-0">
                <img className="w-24 h-16 rounded-lg object-cover" src={venue.coverImage} alt={venue.name} />
                {venue.isHidden && (
                    <div className="absolute inset-0 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>Hidden</span>
                    </div>
                )}
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <p className={`font-bold truncate ${venue.isHidden ? 'text-gray-500' : 'text-white'}`}>{venue.name}</p>
                        {venue.isHidden && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                                Hidden
                            </span>
                        )}
                    </div>
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
                <button
                    onClick={(e) => { e.stopPropagation(); onPreview(venue); }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    aria-label={`Preview venue ${venue.name}`}
                >
                    <EyeIcon className="w-5 h-5" />
                </button>
                {onToggleHide && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleHide(venue); }}
                        className={`p-2 rounded-md transition-all ${venue.isHidden ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-400/10'}`}
                        aria-label={venue.isHidden ? `Unhide venue ${venue.name}` : `Hide venue ${venue.name}`}
                        title={venue.isHidden ? 'Unhide venue' : 'Hide venue'}
                    >
                        {venue.isHidden ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(venue); }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    aria-label={`Edit venue ${venue.name}`}
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(venue); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white/5 rounded-md transition-colors"
                    aria-label={`Delete venue ${venue.name}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
