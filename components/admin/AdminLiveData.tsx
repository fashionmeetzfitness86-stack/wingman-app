import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// ── Shapes returned by /.netlify/functions/admin-data ──────────────────────
interface CartContextItem { id: string; inst: string; q: number; }
interface ConfirmedBooking {
  id: string;
  stripe_session_id: string;
  user_id: string | null;
  customer_email: string | null;
  amount_total_cents: number;
  currency: string;
  cart_context: CartContextItem[] | null;
  confirmed_at: string;
}
interface PasscodeLead {
  id: string;
  email: string;
  full_name: string | null;
  captured_at: string;
}

const fmtMoney = (cents: number, currency: string) => {
  try {
    return (cents / 100).toLocaleString(undefined, {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
    });
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
};

const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
};

const summariseItems = (items: CartContextItem[] | null) => {
  if (!items || items.length === 0) return '—';
  return items.map(i => `${i.inst}${i.q > 1 ? ` ×${i.q}` : ''}`).join(', ');
};

export const AdminLiveData: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
  const [leads, setLeads] = useState<PasscodeLead[]>([]);
  const [view, setView] = useState<'bookings' | 'leads'>('bookings');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError('You must be signed in with an admin account to view live data.');
        return;
      }
      const res = await fetch('/.netlify/functions/admin-data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403) setError('This account is not on the admin allowlist.');
        else if (res.status === 401) setError('Your session expired. Sign in again.');
        else setError(data.error || `Failed to load (${res.status}).`);
        return;
      }
      setBookings(data.bookings || []);
      setLeads(data.leads || []);
    } catch (e: any) {
      setError(e?.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const revenueCents = bookings.reduce((s, b) => s + (b.amount_total_cents || 0), 0);

  return (
    <div className="space-y-4">
      {/* ── Header: KPIs + refresh ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-xl px-4 py-3 bg-gray-900 border border-[#1C1D22]">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Confirmed bookings</p>
            <p className="text-xl font-bold text-white">{bookings.length}</p>
          </div>
          <div className="rounded-xl px-4 py-3 bg-gray-900 border border-[#1C1D22]">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Revenue</p>
            <p className="text-xl font-bold text-[#4DB87C]">{fmtMoney(revenueCents, bookings[0]?.currency || 'usd')}</p>
          </div>
          <div className="rounded-xl px-4 py-3 bg-gray-900 border border-[#1C1D22]">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Leads</p>
            <p className="text-xl font-bold text-white">{leads.length}</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-sm font-semibold py-2 px-4 rounded-md bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* ── Sub-view toggle ────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-[#1C1D22]">
        {(['bookings', 'leads'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              view === v ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(212,80,80,0.08)', border: '1px solid rgba(212,80,80,0.25)', color: '#F0A0A0' }}>
          {error}
        </div>
      )}

      {loading && !error && <p className="text-center text-gray-500 py-8">Loading live data…</p>}

      {/* ── Bookings table ─────────────────────────────────────── */}
      {!loading && !error && view === 'bookings' && (
        bookings.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No confirmed bookings yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#1C1D22]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 bg-gray-900/50">
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Stripe session</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-t border-[#1C1D22] text-gray-300">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{fmtDate(b.confirmed_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">{b.customer_email || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{summariseItems(b.cart_context)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white whitespace-nowrap">{fmtMoney(b.amount_total_cents, b.currency)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{b.stripe_session_id.slice(0, 18)}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Leads table ────────────────────────────────────────── */}
      {!loading && !error && view === 'leads' && (
        leads.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No passcode leads captured yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#1C1D22]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 bg-gray-900/50">
                  <th className="px-4 py-3">Captured</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id} className="border-t border-[#1C1D22] text-gray-300">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{fmtDate(l.captured_at)}</td>
                    <td className="px-4 py-3 text-white">{l.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{l.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};
