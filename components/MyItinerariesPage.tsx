
import React, { useState } from 'react';
import { Itinerary, User, Page } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface MyItinerariesPageProps {
  currentUser: User;
  itineraries: Itinerary[];
  onNavigate: (page: Page) => void;
  onViewItinerary: (itineraryId: number) => void;
}

// ── Inline icons ──────────────────────────────────────────────
const IcoRoute = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const IcoPlus = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const IcoBookmark = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

// ── Card ─────────────────────────────────────────────────────
const ItineraryCard: React.FC<{ itinerary: Itinerary; onSelect: () => void }> = ({ itinerary, onSelect }) => {
  const dateLabel = new Date(itinerary.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl p-5 transition-all active:scale-[0.98] group"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3
            className="font-black text-white text-base leading-tight mb-1 group-hover:text-gray-200 transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {itinerary.title}
          </h3>
          {itinerary.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{itinerary.description}</p>
          )}
        </div>
        {/* Arrow */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Meta row */}
      <div
        className="flex items-center gap-4 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{dateLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <IcoRoute />
          <span>{itinerary.items.length} {itinerary.items.length === 1 ? 'stop' : 'stops'}</span>
        </div>
        {itinerary.isPublic && (
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(224,64,251,0.12)', color: '#E040FB', border: '1px solid rgba(224,64,251,0.2)' }}
          >
            PUBLIC
          </span>
        )}
      </div>
    </button>
  );
};

// ── Empty state ───────────────────────────────────────────────
const EmptyState: React.FC<{ label: string; onAdd?: () => void }> = ({ label, onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-8">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <IcoBookmark />
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
    {onAdd && (
      <p className="text-xs text-gray-700 mt-1">
        Tap <span className="text-white">+</span> to plan your first night out.
      </p>
    )}
  </div>
);

// ── Main ─────────────────────────────────────────────────────
export const MyItinerariesPage: React.FC<MyItinerariesPageProps> = ({
  currentUser,
  itineraries,
  onNavigate,
  onViewItinerary,
}) => {
  const [activeTab, setActiveTab] = useState<'mine' | 'shared'>('mine');

  const myItineraries    = itineraries.filter(i => i.creatorId === currentUser.id);
  const sharedItineraries = itineraries.filter(i => i.sharedWithUserIds.includes(currentUser.id));

  const tabs: { key: 'mine' | 'shared'; label: string; count: number }[] = [
    { key: 'mine',   label: 'My Itineraries', count: myItineraries.length },
    { key: 'shared', label: 'Shared With Me',  count: sharedItineraries.length },
  ];

  const displayed = activeTab === 'mine' ? myItineraries : sharedItineraries;

  return (
    <div className="min-h-screen pb-36 animate-fade-in" style={{ background: '#080808' }}>

      {/* ── Sticky Header ───────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-5 pt-5 pb-4"
        style={{ background: 'rgba(8,8,8,0.94)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => onNavigate('back' as Page)}
            className="flex items-center gap-1 text-sm font-semibold transition-colors"
            style={{ color: '#9ca3af' }}
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Planning</p>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Itineraries</h1>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-1 px-5 mt-4 mb-6">
        {tabs.map(tab => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={
                active
                  ? {
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid transparent',
                      color: '#4B5563',
                    }
              }
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                    color: active ? '#fff' : '#6B7280',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── List ───────────────────────────────────────────── */}
      <div className="px-5 space-y-3">
        {displayed.length > 0
          ? displayed.map(it => (
              <ItineraryCard key={it.id} itinerary={it} onSelect={() => onViewItinerary(it.id)} />
            ))
          : <EmptyState
              label={activeTab === 'mine' ? "You haven't created any itineraries yet." : "No itineraries have been shared with you."}
              onAdd={activeTab === 'mine' ? () => onNavigate('itineraryBuilder') : undefined}
            />
        }
      </div>

      {/* ── Floating + button ──────────────────────────────── */}
      <button
        onClick={() => onNavigate('itineraryBuilder')}
        id="create-itinerary-btn"
        aria-label="Create new itinerary"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl flex items-center justify-center text-white z-40 transition-all active:scale-95 hover:opacity-90"
        style={{
          background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)',
          boxShadow: '0 8px 24px rgba(224,64,251,0.35)',
        }}
      >
        <IcoPlus />
      </button>
    </div>
  );
};
