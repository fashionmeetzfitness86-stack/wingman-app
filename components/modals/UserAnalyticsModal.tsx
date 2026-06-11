
import React, { useMemo } from 'react';
import { User, CartItem, Venue, UserRole } from '../../types';
import { Modal } from '../ui/Modal';

interface UserAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  bookedItems: CartItem[];
  venues: Venue[];
}

// ── Mini icons ────────────────────────────────────────────────────────────────
const IcoDollar = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IcoCalendar = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
const IcoStar = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);
const IcoShield = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const IcoUser = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const IcoMusic = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
  </svg>
);

// ── KPI card ──────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  sub?: string;
}> = ({ icon, label, value, accent, sub }) => (
  <div
    className="relative rounded-2xl p-5 overflow-hidden flex flex-col gap-3"
    style={{ background: '#111114', border: `1px solid ${accent}25` }}
  >
    {/* Ambient glow */}
    <div
      className="absolute top-0 right-0 w-24 h-24 opacity-[0.08] pointer-events-none"
      style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)`, transform: 'translate(30%, -30%)' }}
    />
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
      style={{ background: `${accent}18`, border: `1px solid ${accent}30`, color: accent }}
    >
      {icon}
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </p>
      <p className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: accent }}>{sub}</p>}
    </div>
  </div>
);

// ── Tag pill ──────────────────────────────────────────────────────────────────
const Tag: React.FC<{ children: string; accent?: string }> = ({ children, accent = '#7B61FF' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
    style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
  >
    {children}
  </span>
);

// ── Main modal ────────────────────────────────────────────────────────────────
export const UserAnalyticsModal: React.FC<UserAnalyticsModalProps> = ({
  isOpen, onClose, user, bookedItems, venues,
}) => {
  const stats = useMemo(() => {
    if (!user) return null;
    const userBookings = bookedItems
      .filter(item => {
        const gd = item.tableDetails?.guestDetails || item.eventDetails?.guestDetails;
        return gd?.email === user.email || gd?.name === user.name;
      })
      .sort((a, b) => (b.bookedTimestamp || 0) - (a.bookedTimestamp || 0));

    const totalSpend = userBookings.reduce((acc, item) => {
      const price = item.paymentOption === 'full' ? item.fullPrice : item.depositPrice;
      return acc + (price || 0);
    }, 0);

    const favoriteVenues = venues.filter(v => user.favoriteVenueIds?.includes(v.id));
    return { totalSpend, bookingCount: userBookings.length, bookings: userBookings, favoriteVenues };
  }, [user, bookedItems, venues]);

  if (!isOpen || !user || !stats) return null;

  const roleAccent = user.role === UserRole.ADMIN ? '#a78bfa'
    : user.role === UserRole.WINGMAN ? '#fb923c'
    : '#6366f1';

  const roleName = user.role === UserRole.ADMIN ? 'Admin'
    : user.role === UserRole.WINGMAN ? 'Wingman'
    : 'Member';

  const daysSinceJoin = user.joinDate
    ? Math.floor((Date.now() - new Date(user.joinDate).getTime()) / 86_400_000)
    : null;

  const typeColor = (type: string) => {
    if (type === 'table') return '#60a5fa';
    if (type === 'event') return '#34d399';
    if (type === 'experience') return '#a78bfa';
    if (type === 'guestlist') return '#f472b6';
    return '#9ca3af';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" className="max-w-2xl">
      <div className="space-y-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* ── User identity card ─────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#141418 0%,#1a1a22 100%)', border: `1px solid ${roleAccent}30` }}
        >
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ background: `radial-gradient(circle at 90% 50%, ${roleAccent}, transparent 60%)` }}
          />
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover"
                style={{ border: `2px solid ${roleAccent}50` }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${roleAccent}20`, border: `2px solid ${roleAccent}40`, color: roleAccent }}
              >
                <IcoUser />
              </div>
            )}
            {/* Role dot */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: roleAccent, border: '2px solid #141418' }}
            >
              <IcoShield />
            </div>
          </div>

          {/* Info */}
          <div className="relative z-10 flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: roleAccent }}>
              {roleName}
            </p>
            <h2 className="text-xl font-black text-white truncate">{user.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
          </div>

          {/* Right meta */}
          <div className="relative z-10 flex-shrink-0 text-right space-y-1">
            {daysSinceJoin !== null && (
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Day {daysSinceJoin}
              </div>
            )}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: `${roleAccent}15`, color: roleAccent, border: `1px solid ${roleAccent}30` }}
            >
              {user.accessLevel || 'General'}
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user.approvalStatus === 'approved'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : user.approvalStatus === 'rejected'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}
              >
                {user.approvalStatus ?? 'pending'}
              </span>
            </div>
          </div>
        </div>

        {/* ── KPI strip ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <KpiCard
            icon={<IcoDollar />}
            label="Lifetime Spend"
            value={`$${stats.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
            accent="#34d399"
            sub={stats.totalSpend > 0 ? '↑ All-time' : 'No bookings yet'}
          />
          <KpiCard
            icon={<IcoCalendar />}
            label="Bookings"
            value={stats.bookingCount.toString()}
            accent="#60a5fa"
            sub={stats.bookingCount > 0 ? `${stats.bookingCount} confirmed` : 'None yet'}
          />
          <KpiCard
            icon={<IcoStar />}
            label="Saved Venues"
            value={stats.favoriteVenues.length.toString()}
            accent="#fbbf24"
            sub={stats.favoriteVenues.length > 0 ? 'Venues saved' : 'None saved'}
          />
        </div>

        {/* ── Booking history ────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
            Booking History
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            {stats.bookings.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-600" style={{ background: '#0c0c0e' }}>
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.bookings.map((b, i) => {
                    const price = (b.paymentOption === 'full' ? b.fullPrice : b.depositPrice) || 0;
                    const tc = typeColor(b.type);
                    return (
                      <tr
                        key={b.id}
                        style={{ background: i % 2 === 0 ? '#111114' : '#0e0e11', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td className="px-4 py-3 font-semibold text-white max-w-[160px] truncate">{b.name}</td>
                        <td className="px-4 py-3 text-gray-500 text-[12px]">{b.sortableDate || b.date || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                            style={{ background: `${tc}15`, color: tc, border: `1px solid ${tc}30` }}
                          >
                            {b.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-black" style={{ color: '#34d399' }}>
                          ${price.toFixed(0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 flex flex-col items-center gap-2">
                <IcoCalendar />
                <p className="text-sm text-gray-600">No booking history found for this user.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Venues + Preferences ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Favorite venues */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
              Favorite Venues
            </p>
            {stats.favoriteVenues.length > 0 ? (
              <div className="space-y-2">
                {stats.favoriteVenues.map(venue => (
                  <div
                    key={venue.id}
                    className="flex items-center gap-3 rounded-xl p-2.5"
                    style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <img
                      src={venue.coverImage}
                      alt={venue.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{venue.name}</p>
                      <p className="text-[11px] text-gray-600 truncate">{venue.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl py-8 flex items-center justify-center"
                style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-xs text-gray-700">No venues saved</p>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
              Preferences
            </p>
            <div
              className="rounded-xl p-4 space-y-4 h-full"
              style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Music */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <IcoMusic />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Music</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.preferences?.music?.length
                    ? user.preferences.music.map(m => <Tag key={m} accent="#7B61FF">{m}</Tag>)
                    : <span className="text-xs text-gray-700">Not specified</span>}
                </div>
              </div>

              {/* Activities */}
              {user.preferences?.activities?.length ? (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 block mb-2">Activities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.preferences.activities.map(a => <Tag key={a} accent="#34d399">{a}</Tag>)}
                  </div>
                </div>
              ) : null}

              {/* Vibe */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 block mb-2">Vibe</span>
                {user.preferences?.personality
                  ? <Tag accent="#f472b6">{user.preferences.personality}</Tag>
                  : <span className="text-xs text-gray-700">Not specified</span>}
              </div>

              {/* Time of day */}
              {user.preferences?.timeOfDay && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 block mb-2">Time</span>
                  <Tag accent="#fbbf24">{user.preferences.timeOfDay}</Tag>
                </div>
              )}

              {/* City */}
              {user.city && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 block mb-2">Location</span>
                  <Tag accent="#60a5fa">{`📍 ${user.city}`}</Tag>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};
