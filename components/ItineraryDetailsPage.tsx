
import React, { useState } from 'react';
import { Itinerary, User, Page } from '../types';
import { venues, events, experiences } from '../data/mockData';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { FriendsIcon } from './icons/FriendsIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface ItineraryDetailsPageProps {
    itinerary: Itinerary;
    currentUser: User;
    onEdit: (itinerary: Itinerary) => void;
    onClone?: (itinerary: Itinerary) => void;
    onNavigate?: (page: Page) => void;
}

const itemIcons: Record<string, React.ReactNode> = {
    venue:      <LocationMarkerIcon className="w-4 h-4" />,
    event:      <CalendarIcon className="w-4 h-4" />,
    experience: <SparkleIcon className="w-4 h-4" />,
    note:       <PencilIcon className="w-4 h-4" />,
};

const itemAccents: Record<string, string> = {
    venue:      '#6366f1',
    event:      '#fb923c',
    experience: '#34d399',
    note:       '#9ca3af',
};

export const ItineraryDetailsPage: React.FC<ItineraryDetailsPageProps> = ({
    itinerary, currentUser, onEdit, onClone, onNavigate,
}) => {
    const [isCopied,         setIsCopied]         = useState(false);
    const [isSharedToFriends,setIsSharedToFriends] = useState(false);

    const getItemDetails = (type: string, id?: number) => {
        if (!id) return null;
        switch (type) {
            case 'venue':      return venues.find(i => i.id === id);
            case 'event':      return events.find(i => i.id === id);
            case 'experience': return experiences.find(i => i.id === id);
            default:           return null;
        }
    };

    const isOwner = itinerary.creatorId === currentUser.id;

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}?itinerary=${itinerary.id}`;
        if (navigator.share) {
            try { await navigator.share({ title: `Check out my itinerary: ${itinerary.title}`, text: itinerary.description, url: shareUrl }); }
            catch {}
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch { (window as any).showAppToast?.('Could not share itinerary.'); }
        }
    };

    const handleShareToFriendsZone = () => {
        setIsSharedToFriends(true);
        setTimeout(() => setIsSharedToFriends(false), 2000);
    };

    const formattedDate = new Date(itinerary.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
    });

    // ── Design tokens
    const CARD: React.CSSProperties = {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
    };

    return (
        <div className="min-h-screen pb-36 animate-fade-in" style={{ background: '#08080A' }}>

            {/* ── Sticky header */}
            <div
                className="sticky top-0 z-30 px-5 pt-5 pb-4"
                style={{ background: 'rgba(8,8,10,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
                {/* Back row */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => onNavigate?.('back' as Page)}
                        className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ color: '#9ca3af' }}
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Back
                    </button>

                    {/* Edit / Clone action */}
                    {isOwner ? (
                        <button
                            onClick={() => onEdit(itinerary)}
                            className="flex items-center gap-1.5 text-sm font-bold rounded-xl px-4 py-2 transition-all active:scale-95"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb' }}
                        >
                            <PencilIcon className="w-3.5 h-3.5" />
                            Edit
                        </button>
                    ) : (
                        onClone && (
                            <button
                                onClick={() => onClone(itinerary)}
                                className="flex items-center gap-1.5 text-sm font-bold rounded-xl px-4 py-2 transition-all active:scale-95"
                                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8' }}
                            >
                                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                                Clone
                            </button>
                        )
                    )}
                </div>

                {/* Title block */}
                <h1
                    className="text-2xl font-black text-white leading-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    {itinerary.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <CalendarIcon className="w-3.5 h-3.5" style={{ color: '#6366f1' } as any} />
                    <p className="text-xs font-semibold" style={{ color: '#6366f1' }}>{formattedDate}</p>
                </div>
            </div>

            <div className="px-5 pt-5 space-y-5">

                {/* Description */}
                {itinerary.description && (
                    <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                        {itinerary.description}
                    </p>
                )}

                {/* Share buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 font-bold text-sm rounded-2xl py-3.5 transition-all active:scale-[0.97]"
                        style={{
                            background: isCopied
                                ? 'rgba(52,211,153,0.15)'
                                : 'linear-gradient(135deg,#f59e0b,#d97706)',
                            color: isCopied ? '#34d399' : '#000',
                            border: isCopied ? '1px solid rgba(52,211,153,0.3)' : 'none',
                            boxShadow: isCopied ? 'none' : '0 4px 20px rgba(245,158,11,0.35)',
                        }}
                    >
                        {isCopied ? <CheckIcon className="w-4 h-4" /> : <ShareIcon className="w-4 h-4" />}
                        {isCopied ? 'Link Copied!' : 'Share Link'}
                    </button>
                    <button
                        onClick={handleShareToFriendsZone}
                        className="flex items-center justify-center gap-2 font-bold text-sm rounded-2xl py-3.5 transition-all active:scale-[0.97]"
                        style={{
                            background: isSharedToFriends
                                ? 'rgba(52,211,153,0.12)'
                                : 'rgba(255,255,255,0.06)',
                            color: isSharedToFriends ? '#34d399' : '#e5e7eb',
                            border: isSharedToFriends
                                ? '1px solid rgba(52,211,153,0.3)'
                                : '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        {isSharedToFriends ? <CheckIcon className="w-4 h-4" /> : <FriendsIcon className="w-4 h-4" />}
                        {isSharedToFriends ? 'Shared!' : 'Friends Zone'}
                    </button>
                </div>

                {/* Timeline */}
                <div style={CARD} className="overflow-hidden">
                    <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#4b5563' }}>
                            {itinerary.items.length} Stop{itinerary.items.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {itinerary.items.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <p className="text-sm" style={{ color: '#4b5563' }}>No stops yet.</p>
                        </div>
                    ) : (
                        <div className="px-5 py-4 space-y-0">
                            {itinerary.items.map((item, index) => {
                                const details = getItemDetails(item.type, item.itemId);
                                const title   = item.customTitle
                                    || (details && 'name'  in details ? details.name  : null)
                                    || (details && 'title' in details ? details.title : null)
                                    || 'Custom Note';
                                const isLast  = index === itinerary.items.length - 1;
                                const accent  = itemAccents[item.type] || '#9ca3af';

                                return (
                                    <div key={item.id} className="flex gap-4">
                                        {/* Timeline spine */}
                                        <div className="flex flex-col items-center pt-1">
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
                                            >
                                                {itemIcons[item.type]}
                                            </div>
                                            {!isLast && (
                                                <div
                                                    className="w-px flex-grow my-2"
                                                    style={{ background: 'rgba(255,255,255,0.06)' }}
                                                />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-grow ${!isLast ? 'pb-6' : 'pb-2'}`}>
                                            {item.startTime && (
                                                <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>
                                                    {item.startTime}
                                                    {item.endTime && ` – ${item.endTime}`}
                                                </p>
                                            )}
                                            <p className="font-black text-white text-base leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                                {title}
                                            </p>
                                            {details && 'location' in details && (
                                                <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{details.location}</p>
                                            )}
                                            {item.notes && (
                                                <p
                                                    className="text-xs mt-2 px-3 py-2 rounded-xl leading-relaxed"
                                                    style={{ background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.06)' }}
                                                >
                                                    {item.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Stats footer */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Stops',   value: itinerary.items.length, accent: '#6366f1' },
                        { label: 'Shared',  value: (itinerary.sharedWithUserIds?.length ?? 0), accent: '#34d399' },
                        { label: 'Public',  value: itinerary.isPublic ? 'Yes' : 'No', accent: itinerary.isPublic ? '#fb923c' : '#374151' },
                    ].map(s => (
                        <div
                            key={s.label}
                            className="rounded-2xl px-3 py-3 flex flex-col items-center"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <span className="text-xl font-black" style={{ color: s.accent }}>{s.value}</span>
                            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#4b5563' }}>{s.label}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
