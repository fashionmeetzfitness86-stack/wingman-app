
/**
 * EventChatsListPage.tsx — Chats Hub
 * ─────────────────────────────────────────────────────────────
 * Three tabs:
 *   1. Venues   → Browse all venues + direct booking CTA
 *   2. Events   → Event group chats the user is in
 *   3. Wingman  → 1:1 AI concierge chats
 */

import React, { useMemo, useState } from 'react';
import { Page, User, EventChat, Event, GuestlistChat, Venue, Wingman, UserRole, WingmanChat } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { SparkleIcon } from './icons/SparkleIcon';

// ─── ICONS ────────────────────────────────────────────────────
const IcoBuilding = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IcoCalendar = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IcoChevron = () => (
  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// ─── CATEGORY META ─────────────────────────────────────────────
const CAT_META: Record<string, { icon: string; color: string }> = {
  Nightclub:    { icon: '🌙', color: '#9CA3AF' },
  Restaurant:   { icon: '🍽️', color: '#F59E0B' },
  Lounge:       { icon: '🥂', color: '#06B6D4' },
  'Beach Club': { icon: '🌊', color: '#22C55E' },
  'Pool Party': { icon: '☀️', color: '#E040FB' },
};

// ─── PROPS ────────────────────────────────────────────────────
interface EventChatsListPageProps {
  currentUser: User;
  onNavigate: (page: Page, params?: Record<string, any>) => void;
  eventChats: EventChat[];
  guestlistChats: GuestlistChat[];
  wingmanChats?: WingmanChat[];
  allEvents: Event[];
  venues: Venue[];
  wingmen: Wingman[];
  allUsers: User[];
}

// ─── MAIN ─────────────────────────────────────────────────────
export const EventChatsListPage: React.FC<EventChatsListPageProps> = ({
  currentUser, onNavigate, eventChats, guestlistChats = [], wingmanChats = [],
  allEvents, venues, wingmen, allUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'venues' | 'events' | 'wingman'>('venues');
  const [venueSearch, setVenueSearch] = useState('');

  const myEventChats = useMemo(() =>
    eventChats.filter(c => c.memberIds.includes(currentUser.id)),
    [eventChats, currentUser.id]
  );

  const myWingmanChats = useMemo(() =>
    wingmanChats.filter(c => c.userId === currentUser.id),
    [wingmanChats, currentUser.id]
  );

  const filteredVenues = useMemo(() => {
    const q = venueSearch.toLowerCase().trim();
    if (!q) return venues;
    return venues.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.vibe.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q)
    );
  }, [venues, venueSearch]);

  const TABS = [
    { key: 'venues'  as const, label: 'Venues',  icon: <IcoBuilding />,  count: venues.length },
    { key: 'events'  as const, label: 'Events',  icon: <IcoCalendar />,  count: myEventChats.length },
    { key: 'wingman' as const, label: 'Wingman', icon: <SparkleIcon className="w-5 h-5" />, count: myWingmanChats.length },
  ];

  // ── VENUES TAB ──────────────────────────────────────────────
  const VenuesTab = () => (
    <div className="flex flex-col gap-5">

      {/* Hero CTA */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="text-3xl">🏛</div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-sm leading-tight">Browse All Featured Venues</p>
          <p className="text-xs text-gray-500 mt-0.5">Reserve a spot, join guestlists, explore Miami's best</p>
        </div>
        <button
          onClick={() => onNavigate('featuredVenues')}
          className="flex-shrink-0 text-xs font-black text-white px-3 py-2 rounded-xl transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)' }}
        >
          View All
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={venueSearch}
          onChange={e => setVenueSearch(e.target.value)}
          placeholder="Search venues, vibe, category..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
        />
        {venueSearch && (
          <button onClick={() => setVenueSearch('')} className="text-gray-500 hover:text-white text-xs">✕</button>
        )}
      </div>

      {/* Venue list */}
      <div className="flex flex-col gap-3">
        {filteredVenues.length === 0 ? (
          <div className="text-center py-14 text-gray-600">
            <p className="text-3xl mb-3">🏛</p>
            <p className="font-semibold">No venues found</p>
            <button onClick={() => setVenueSearch('')} className="mt-3 text-xs text-white/60 underline">Clear search</button>
          </div>
        ) : filteredVenues.map(venue => {
          const meta = CAT_META[venue.category] ?? { icon: '✦', color: '#9CA3AF' };
          return (
            <button
              key={venue.id}
              onClick={() => onNavigate('featuredVenues')}
              className="group w-full flex items-center gap-4 rounded-2xl p-3 text-left transition-all hover:bg-white/[0.04] active:scale-[0.99]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Cover */}
              <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden">
                <img src={venue.coverImage} alt={venue.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm truncate">{venue.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs" style={{ color: meta.color }}>{meta.icon} {venue.category}</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">{venue.location}</span>
                </div>
                {/* Operating days pills */}
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {venue.operatingDays.slice(0, 3).map(day => (
                    <span
                      key={day}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.07)', color: '#9CA3AF' }}
                    >
                      {day.slice(0, 3)}
                    </span>
                  ))}
                  {venue.operatingDays.length > 3 && (
                    <span className="text-[10px] text-gray-600">+{venue.operatingDays.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Reserve CTA */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div
                  className="text-[10px] font-black text-white px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)' }}
                >
                  Reserve
                </div>
                <IcoChevron />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <button
        onClick={() => onNavigate('featuredVenues')}
        className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        Open Full Venue Directory →
      </button>
    </div>
  );

  // ── EVENTS TAB ──────────────────────────────────────────────
  const EventsTab = () => (
    <div className="flex flex-col gap-3">
      {myEventChats.length > 0 ? myEventChats.map(chat => {
        const event = allEvents.find(e => e.id === chat.eventId);
        if (!event) return null;
        const otherMembers = chat.memberIds
          .filter(id => id !== currentUser.id)
          .map(id => allUsers.find(u => u.id === id))
          .filter(Boolean);
        return (
          <button
            key={chat.id}
            onClick={() => onNavigate('eventChat', { chatId: chat.id })}
            className="w-full flex items-center gap-4 rounded-2xl p-3 text-left transition-all hover:bg-white/[0.04]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <img src={event.image} alt={event.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm truncate">{event.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
              </p>
              <p className="text-xs text-gray-600 mt-1">{chat.memberIds.length} members in chat</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex -space-x-2">
                {otherMembers.slice(0, 3).map(member => member && (
                  <img key={member.id} src={member.profilePhoto} alt={member.name} className="w-7 h-7 rounded-full object-cover border-2 border-black" />
                ))}
              </div>
              <IcoChevron />
            </div>
          </button>
        );
      }) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl mb-4">💬</span>
          <h3 className="text-lg font-bold text-white mb-2">No Event Chats</h3>
          <p className="text-sm text-gray-500 max-w-xs">RSVP to an event to join its group chat and meet other guests.</p>
          <button
            onClick={() => onNavigate('eventTimeline')}
            className="mt-6 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)' }}
          >
            Browse Events
          </button>
        </div>
      )}
    </div>
  );

  // ── WINGMAN TAB ─────────────────────────────────────────────
  const WingmanTab = () => (
    <div className="flex flex-col gap-3">
      {myWingmanChats.length > 0 ? myWingmanChats.map(chat => (
        <button
          key={chat.id}
          onClick={() => onNavigate('chatbot', { chatId: chat.id })}
          className="w-full flex items-center gap-4 rounded-2xl p-3 text-left transition-all hover:bg-white/[0.04]"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FFFFFF, #738596, #1A252C)' }}
          >
            <SparkleIcon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-sm truncate">{chat.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{new Date(chat.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                chat.status === 'open'
                  ? 'text-green-400 bg-green-900/30'
                  : 'text-gray-500 bg-white/5'
              }`}
            >
              {chat.status}
            </span>
            <IcoChevron />
          </div>
        </button>
      )) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #FFFFFF, #738596, #1A252C)' }}
          >
            <SparkleIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Wingman Chats</h3>
          <p className="text-sm text-gray-500 max-w-xs">Chat with Wingman AI to plan your night, book a table, or ask anything.</p>
          <button
            onClick={() => onNavigate('chatbot')}
            className="mt-6 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)' }}
          >
            Start a Chat
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'transparent' }}>

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-30 px-4 pt-5 pb-4"
        style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Back row */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => onNavigate('back' as Page)}
            className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#9ca3af' }}
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>
        <h1 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Chats
        </h1>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={activeTab === tab.key
                ? { background: 'rgba(255,255,255,0.12)', color: '#fff' }
                : { color: '#6B7280' }
              }
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 6)}</span>
              {tab.count > 0 && (
                <span
                  className="text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                    color: activeTab === tab.key ? '#fff' : '#6B7280',
                  }}
                >
                  {tab.count > 9 ? '9+' : tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pt-5 pb-28">
        {activeTab === 'venues'  && <VenuesTab />}
        {activeTab === 'events'  && <EventsTab />}
        {activeTab === 'wingman' && <WingmanTab />}
      </div>
    </div>
  );
};
