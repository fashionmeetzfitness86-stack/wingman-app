import React from 'react';
import { ShareIcon } from './icons/ShareIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { PlusIcon } from './icons/PlusIcon';
import { HeartIcon } from './icons/HeartIcon';
import { KeyIcon } from './icons/KeyIcon';
import { Event } from '../types';

interface EventPlayerBarProps {
    activeEvent: Event | null;
    isLiked: boolean;
    // FIX: Update eventId to accept string for recurring events
    onToggleLike: (eventId: number | string) => void;
    isRsvped: boolean;
    // FIX: Update eventId to accept string for recurring events
    onRsvp: (eventId: number | string) => void;
    isBookmarked: boolean;
    // FIX: Update eventId to accept string for recurring events
    onToggleBookmark: (eventId: number | string) => void;
    onShare: (event: Event) => void;
    onBook: (event: Event) => void;
}


export const EventPlayerBar: React.FC<EventPlayerBarProps> = ({
    activeEvent,
    isLiked,
    onToggleLike,
    isRsvped,
    onRsvp,
    isBookmarked,
    onToggleBookmark,
    onShare,
    onBook
}) => {
    if (!activeEvent) return null;


    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div className="fixed bottom-24 inset-x-4 z-30 pointer-events-none">
            <div className="max-w-5xl mx-auto flex justify-center">
                <div className="flex items-end gap-2 pointer-events-auto">
                    {/* Main bar */}
                    <div className="bg-[#1C1C1E]/95 backdrop-blur-lg border border-gray-700 rounded-xl p-3 flex items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                           <img src={activeEvent.image} alt={activeEvent.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                           <p className="text-white font-semibold truncate">{activeEvent.title}</p>
                        </div>
                        <div className="flex items-center gap-0 sm:gap-1">
                            <button onClick={(e) => handleAction(e, () => onShare(activeEvent))} className="p-2 text-gray-400 hover:text-white" aria-label="Share current event"><ShareIcon className="w-5 h-5"/></button>
                            <button onClick={(e) => handleAction(e, () => onToggleBookmark(activeEvent.id))} className={`p-2 transition-colors ${isBookmarked ? 'text-white' : 'text-gray-400 hover:text-white'}`} aria-label="Bookmark current event">
                                <BookmarkIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={(e) => handleAction(e, () => onRsvp(activeEvent.id))} className={`p-2 transition-colors ${isRsvped ? 'text-white' : 'text-gray-400 hover:text-white'}`} aria-label="Add current event to collection">
                                <PlusIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={(e) => handleAction(e, () => onToggleLike(activeEvent.id))} className="hidden sm:flex items-center gap-1.5 bg-gray-800 text-white pl-3 pr-4 py-2 rounded-full" aria-label="Like current event">
                                <HeartIcon className="w-5 h-5" isFilled={isLiked} />
                                <span className="font-semibold text-sm">{isLiked ? 'Liked' : 'Like'}</span>
                            </button>
                        </div>
                    </div>
                     {/* FAB */}
                    <button onClick={(e) => handleAction(e, () => onBook(activeEvent))} className="flex-shrink-0 w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg shadow-white/30 transition-transform hover:scale-110" aria-label="Book current event">
                        <KeyIcon className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </div>
    );
};
