import React, { useState } from 'react';
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

// Inline confirmation dialog — appears below the row when hide is requested
const HideConfirmBanner: React.FC<{ venueName: string; onConfirm: () => void; onCancel: () => void }> = ({ venueName, onConfirm, onCancel }) => (
    <div
        className="mt-2 rounded-xl p-4 animate-fade-in"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
    >
        <p className="text-sm font-semibold text-amber-400 mb-1">Hide "{venueName}" from users?</p>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            This venue will be hidden from all user-facing views. Existing bookings, receipts, and data are preserved. You can unhide it at any time.
        </p>
        <div className="flex gap-2">
            <button
                onClick={onCancel}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-colors border border-white/[0.08] hover:border-white/[0.16]"
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold text-amber-300 transition-colors"
                style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
                Yes, Hide Venue
            </button>
        </div>
    </div>
);

export const AdminVenueListItem: React.FC<AdminVenueListItemProps> = ({ venue, onEdit, onDelete, onPreview, onToggleHide }) => {
    const [awaitingHideConfirm, setAwaitingHideConfirm] = useState(false);

    const handleToggleHideClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (venue.isHidden) {
            // Unhide immediately — no confirmation needed
            onToggleHide?.(venue);
        } else {
            // Hide — ask for confirmation first
            setAwaitingHideConfirm(true);
        }
    };

    const handleConfirmHide = () => {
        setAwaitingHideConfirm(false);
        onToggleHide?.(venue);
    };

    const handleCancelHide = () => {
        setAwaitingHideConfirm(false);
    };

    return (
        <div>
            <div className={`border rounded-xl p-4 flex items-center gap-4 transition-all ${venue.isHidden ? 'border-amber-500/20 bg-amber-500/[0.03] opacity-70 hover:opacity-100' : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                    <img className="w-24 h-16 rounded-lg object-cover" src={venue.coverImage} alt={venue.name} />
                    {venue.isHidden && (
                        <div className="absolute inset-0 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>Hidden</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center min-w-0">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-bold truncate ${venue.isHidden ? 'text-gray-500' : 'text-white'}`}>{venue.name}</p>
                            {venue.isHidden ? (
                                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                                    Hidden
                                </span>
                            ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.15)' }}>
                                    Visible
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{venue.location}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">{venue.musicType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">{venue.vibe}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Preview */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onPreview(venue); }}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                        aria-label={`Preview venue ${venue.name}`}
                        title="Preview venue"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>

                    {/* Hide / Unhide */}
                    {onToggleHide && (
                        <button
                            onClick={handleToggleHideClick}
                            className={`p-2 rounded-lg transition-all ${
                                venue.isHidden
                                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 bg-amber-400/[0.06]'
                                    : 'text-gray-500 hover:text-amber-400 hover:bg-amber-400/10'
                            }`}
                            aria-label={venue.isHidden ? `Unhide venue ${venue.name}` : `Hide venue ${venue.name}`}
                            title={venue.isHidden ? 'Unhide venue — restore to public' : 'Hide venue from users'}
                        >
                            {venue.isHidden ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                        </button>
                    )}

                    {/* Edit */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(venue); }}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                        aria-label={`Edit venue ${venue.name}`}
                        title="Edit venue"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(venue); }}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label={`Delete venue ${venue.name}`}
                        title="Delete venue permanently"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Inline hide confirmation */}
            {awaitingHideConfirm && (
                <HideConfirmBanner
                    venueName={venue.name}
                    onConfirm={handleConfirmHide}
                    onCancel={handleCancelHide}
                />
            )}
        </div>
    );
};
