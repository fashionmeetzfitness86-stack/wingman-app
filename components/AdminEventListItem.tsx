
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
    onToggleHide?: (event: Event) => void;
}

// Eye-slash icon (hide)
const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export const AdminEventListItem: React.FC<AdminEventListItemProps> = ({
    event, venueName, onEdit, onDelete, onPreview,
    isSelected, onToggleSelect, onToggleHide
}) => {
    return (
        <div className={`border rounded-md p-4 flex items-center gap-4 transition-all ${
            event.isHidden
                ? 'border-[#2A1A00] bg-[#090909] opacity-60'
                : isSelected
                    ? 'border-white bg-[#15161A]'
                    : 'border-[#1C1D22] bg-[#0F1014]'
        }`}>
            {onToggleSelect && (
                <div className="flex-shrink-0">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(event.id)}
                        className="w-5 h-5 rounded border-[#5D616B] bg-[#1C1D22] text-white focus:ring-white cursor-pointer"
                    />
                </div>
            )}
            <div className="relative flex-shrink-0">
                <img className="w-20 h-20 rounded-lg object-cover" src={event.image} alt={event.title} />
                {event.isHidden && (
                    <div className="absolute inset-0 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>Hidden</span>
                    </div>
                )}
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold truncate ${event.isHidden ? 'text-gray-500' : 'text-white'}`}>{event.title}</p>
                        {event.isHidden && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                                Hidden
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400">{event.date}</p>
                </div>
                <div>
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded ${event.type === 'EXCLUSIVE' ? 'bg-[#051A10] text-[#4DB87C] border border-[#0A3A20]' : 'bg-[#0F141A] text-[#738596] border border-[#1C2229]'}`}>
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
                <button
                    onClick={(e) => { e.stopPropagation(); onPreview(event); }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    aria-label={`Preview event ${event.title}`}
                >
                    <EyeIcon className="w-5 h-5" />
                </button>
                {onToggleHide && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleHide(event); }}
                        className={`p-2 rounded-md transition-all ${event.isHidden ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-400/10'}`}
                        aria-label={event.isHidden ? `Unhide event ${event.title}` : `Hide event ${event.title}`}
                        title={event.isHidden ? 'Unhide event' : 'Hide event'}
                    >
                        {event.isHidden ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    aria-label={`Edit event ${event.title}`}
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white/5 rounded-md transition-colors"
                    aria-label={`Delete event ${event.title}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
