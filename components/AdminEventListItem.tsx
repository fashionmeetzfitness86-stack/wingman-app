
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
    const typeIsExclusive = event.type === 'EXCLUSIVE';

    return (
        <div
            className="rounded-2xl flex items-center gap-4 p-4 transition-all duration-200 group"
            style={{
                background: event.isHidden
                    ? 'rgba(10,8,0,0.6)'
                    : isSelected
                        ? 'rgba(255,255,255,0.06)'
                        : '#141414',
                border: event.isHidden
                    ? '1px solid rgba(245,158,11,0.15)'
                    : isSelected
                        ? '1px solid rgba(255,255,255,0.2)'
                        : '1px solid rgba(255,255,255,0.07)',
                opacity: event.isHidden ? 0.65 : 1,
            }}
        >
            {/* Checkbox */}
            {onToggleSelect && (
                <div className="flex-shrink-0">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(event.id)}
                        className="w-4 h-4 rounded cursor-pointer accent-white"
                    />
                </div>
            )}

            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
                <img
                    className="w-16 h-16 rounded-xl object-cover"
                    src={event.image}
                    alt={event.title}
                />
                {event.isHidden && (
                    <div
                        className="absolute inset-0 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.65)' }}
                    >
                        <EyeSlashIcon className="w-5 h-5 text-amber-400/80" />
                    </div>
                )}
            </div>

            {/* Info grid */}
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-4 gap-3 items-center min-w-0">

                {/* Title + date */}
                <div className="min-w-0 sm:col-span-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm truncate ${event.isHidden ? 'text-gray-500' : 'text-white'}`}>
                            {event.title}
                        </p>
                        {event.isHidden && (
                            <span
                                className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
                            >
                                Hidden
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{event.date}</p>
                </div>

                {/* Type badge */}
                <div>
                    <span
                        className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={typeIsExclusive
                            ? { background: 'rgba(77,184,124,0.1)', color: '#4DB87C', border: '1px solid rgba(77,184,124,0.2)' }
                            : { background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }
                        }
                    >
                        {event.type}
                    </span>
                </div>

                {/* Venue */}
                <div>
                    <p className="text-sm text-gray-400 truncate">{venueName}</p>
                </div>

                {/* Pricing */}
                <div>
                    <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        <span className="text-pink-400/70">F</span> ${event.priceFemale}
                        &nbsp;&nbsp;
                        <span className="text-blue-400/70">M</span> ${event.priceMale}
                    </p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {/* Preview */}
                <button
                    onClick={(e) => { e.stopPropagation(); onPreview(event); }}
                    className="p-2 rounded-xl transition-all"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)', e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    aria-label={`Preview ${event.title}`}
                >
                    <EyeIcon className="w-4 h-4" />
                </button>

                {/* Hide / Unhide */}
                {onToggleHide && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleHide(event); }}
                        className="p-2 rounded-xl transition-all"
                        style={{ color: event.isHidden ? '#F59E0B' : 'rgba(255,255,255,0.35)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.1)', e.currentTarget.style.color = '#F59E0B')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = event.isHidden ? '#F59E0B' : 'rgba(255,255,255,0.35)')}
                        aria-label={event.isHidden ? `Unhide ${event.title}` : `Hide ${event.title}`}
                        title={event.isHidden ? 'Unhide event' : 'Hide event'}
                    >
                        {event.isHidden ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                    </button>
                )}

                {/* Edit */}
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                    className="p-2 rounded-xl transition-all"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)', e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    aria-label={`Edit ${event.title}`}
                >
                    <PencilSquareIcon className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                    className="p-2 rounded-xl transition-all"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,80,80,0.1)', e.currentTarget.style.color = '#D45050')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    aria-label={`Delete ${event.title}`}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
