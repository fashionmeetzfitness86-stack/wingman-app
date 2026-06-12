import React, { useState, useMemo } from 'react';
import { Page, CartItem, Venue, InstanceBooking, EventInstance } from '../types';

// ── Icons ────────────────────────────────────────────────────────────────────

const IcoChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const IcoCalendar = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IcoUsers = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IcoDollar = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IcoChat = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const IcoTicket = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);
const IcoStar = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return dateStr; }
}

function typeLabel(type: string): { label: string; color: string; bg: string } {
  switch (type) {
    case 'Nightclub': return { label: '🌙 Nightclub',  color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' };
    case 'Dinner':    return { label: '🍽️ Dinner',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  };
    case 'Yacht':     return { label: '⛵ Yacht',       color: '#06B6D4', bg: 'rgba(6,182,212,0.12)'  };
    default:          return { label: '✨ Experience', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' };
  }
}

function statusPill(status: string) {
  switch (status) {
    case 'Confirmed':
      return { label: 'Confirmed', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' };
    case 'Completed':
      return { label: 'Completed', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' };
    case 'Under Review':
      return { label: 'Under Review', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' };
    case 'Restricted':
    case 'Cancelled':
      return { label: status, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' };
    default:
      return { label: status, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' };
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface BookingsPageProps {
  onNavigate: (page: Page, params?: any) => void;
  bookedItems?: CartItem[];
  venues?: Venue[];
  instanceBookings?: InstanceBooking[];
  allInstances?: EventInstance[];
}

type FilterType = 'All' | 'Tables' | 'Events';

// ── Main Component ────────────────────────────────────────────────────────────

export const BookingsPage: React.FC<BookingsPageProps> = ({
  onNavigate,
  bookedItems = [],
  venues = [],
  instanceBookings = [],
  allInstances = [],
}) => {
  const [activeTab, setActiveTab]     = useState<'upcoming' | 'past'>('upcoming');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  // ── Build unified booking list ──────────────────────────────────────────────
  const allBookings = useMemo(() => {
    // CartItem bookings (tables, events, guestlist)
    const fromCart = bookedItems.map(item => {
      let venueName = '';
      let status = 'Confirmed';
      let image = item.image || '';
      let date = item.sortableDate || item.date || '';

      if (item.type === 'table' && item.tableDetails) {
        venueName = item.tableDetails.venue.name;
        image = item.tableDetails.venue.coverImage || image;
      } else if (item.type === 'event' && item.eventDetails) {
        const v = venues.find(v => v.id === item.eventDetails!.event.venueId);
        venueName = v?.name ?? 'Unknown Venue';
      } else if (item.type === 'guestlist' && item.guestlistDetails) {
        venueName = item.guestlistDetails.venue.name;
        image = item.guestlistDetails.venue.coverImage || image;
        const s = item.guestlistDetails.status;
        if (s === 'pending')   status = 'Under Review';
        else if (s === 'rejected') status = 'Restricted';
        else status = s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Under Review';
      }

      return {
        id: String(item.id),
        type: item.type as string,
        name: item.name,
        date,
        status,
        image,
        venueName,
        partySize: 1,
        totalPaid: item.fullPrice ?? item.depositPrice ?? 0,
        experienceType: 'Experience',
        isEvent: item.type === 'event' || item.type === 'guestlist',
        originalData: item,
      };
    });

    // InstanceBookings (event-feed recurring events — the main booking system)
    const fromInstances = instanceBookings.map(b => {
      // Look up the actual event instance to get real title, image, venue, type
      const inst = allInstances.find(i => i.instanceId === b.instanceId);
      const title   = inst?.title   || b.instanceId.replace(/-\d{4}-\d{2}-\d{2}$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const image   = inst?.coverImage || '';
      const venue   = inst?.venue   || '';
      const expType = inst?.experienceType || 'Experience';
      const date    = inst?.date    || b.instanceId.match(/(\d{4}-\d{2}-\d{2})$/)?.[1] || '';

      return {
        id: `instance-${b.id}`,
        type: 'instance',
        name: title,
        date,
        status: 'Confirmed',
        image,
        venueName: venue,
        partySize: b.partySize,
        totalPaid: b.totalPaid,
        experienceType: expType,
        isEvent: true,
        originalData: b,
      };
    });

    return [...fromCart, ...fromInstances];
  }, [bookedItems, venues, instanceBookings, allInstances]);

  // ── Filter / sort ───────────────────────────────────────────────────────────
  const filteredList = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allBookings
      .filter(item => {
        const isPast = item.date < today;
        if (activeTab === 'upcoming' && isPast)  return false;
        if (activeTab === 'past'     && !isPast) return false;
        if (activeFilter === 'Tables' && item.type !== 'table' && item.type !== 'guestlist') return false;
        if (activeFilter === 'Events' && !item.isEvent) return false;
        return true;
      })
      .sort((a, b) =>
        activeTab === 'upcoming'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [allBookings, activeTab, activeFilter]);

  const totalCount = allBookings.length;

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen pb-28 animate-fade-in"
      style={{ background: '#0F0F14', fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-4">
        <button
          onClick={() => onNavigate('back' as Page)}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors mb-6 text-sm font-semibold"
        >
          <IcoChevronLeft />
          Back
        </button>

        <div className="flex items-end justify-between">
          <div>
            <h1
              className="text-3xl font-black text-white"
              style={{ letterSpacing: '-0.03em' }}
            >
              My Bookings
            </h1>
            {totalCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {totalCount} reservation{totalCount !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="px-5 mb-5">
        <div
          className="flex rounded-2xl p-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {(['upcoming', 'past'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all"
              style={
                activeTab === tab
                  ? { background: 'rgba(255,255,255,0.12)', color: '#fff' }
                  : { color: '#6B7280' }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="px-5 mb-6">
        <div className="flex gap-2">
          {(['All', 'Events', 'Tables'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={
                activeFilter === f
                  ? { background: '#fff', color: '#000' }
                  : { background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Booking cards ── */}
      <div className="px-5 space-y-4">
        {filteredList.length > 0 ? (
          filteredList.map(item => {
            const pill    = statusPill(item.status);
            const typeCfg = typeLabel(item.experienceType);
            const b       = item.originalData as InstanceBooking;

            return (
              <div
                key={item.id}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Cover image */}
                {item.image ? (
                  <div className="relative w-full" style={{ height: 160 }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(15,15,20,0.95) 100%)' }}
                    />
                    {/* Status pill overlaid on image */}
                    <div className="absolute top-3 right-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: pill.bg, color: pill.color, border: `1px solid ${pill.border}` }}
                      >
                        {pill.label}
                      </span>
                    </div>
                    {/* Type badge */}
                    <div className="absolute bottom-3 left-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: typeCfg.bg, color: typeCfg.color, border: `1px solid ${typeCfg.color}30` }}
                      >
                        {typeCfg.label}
                      </span>
                    </div>
                  </div>
                ) : (
                  // No image fallback — gradient placeholder
                  <div
                    className="relative w-full flex items-center justify-center"
                    style={{ height: 80, background: 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(99,102,241,0.1))' }}
                  >
                    <span className="text-2xl opacity-30">🎟️</span>
                    <div className="absolute top-3 right-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: pill.bg, color: pill.color, border: `1px solid ${pill.border}` }}
                      >
                        {pill.label}
                      </span>
                    </div>
                  </div>
                )}

                {/* Card body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-black text-white text-base leading-tight">{item.name}</h3>
                    {item.venueName && item.venueName !== item.name && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.venueName}</p>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {item.date && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <IcoCalendar />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    )}
                    {item.type === 'instance' && (
                      <>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <IcoUsers />
                          <span>Party of {b.partySize}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <IcoDollar />
                          <span>{b.totalPaid > 0 ? `$${b.totalPaid.toLocaleString()}` : 'Complimentary'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onNavigate('eventChatsList' as any)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98]"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <IcoChat />
                      Event Chat
                    </button>
                    <button
                      onClick={() => onNavigate('checkout', { initialTab: 'purchased' })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 50%, #374151 100%)',
                        color: '#000',
                      }}
                    >
                      <IcoTicket />
                      View Receipt
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-gray-600">
                <IcoStar />
              </div>
            </div>
            <p className="text-white font-black text-xl mb-2" style={{ letterSpacing: '-0.02em' }}>
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
            <p className="text-xs text-gray-600 max-w-xs leading-relaxed mb-6">
              {activeTab === 'upcoming'
                ? 'Reserve your spot at an exclusive Wingman experience to see it here.'
                : "Your completed experiences will appear here once they've passed."}
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={() => onNavigate('eventTimeline')}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 60%, #374151 100%)',
                  color: '#000',
                }}
              >
                Browse Experiences →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
