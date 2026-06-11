/**
 * admin-data.ts
 * ─────────────────────────────────────────────────────────────
 * Returns live customer data (confirmed bookings + passcode leads)
 * for the admin dashboard.
 *
 * Security: the caller MUST send a valid Supabase access token in
 * `Authorization: Bearer <token>`. The token is verified against
 * Supabase, and the user's email must be in the ADMIN_EMAILS
 * allowlist. The service-role key (which bypasses RLS) is only ever
 * used AFTER that check passes — the browser never sees it.
 *
 * Env:
 *   ADMIN_EMAILS          — comma-separated allowlist, e.g. "you@x.com,ops@x.com"
 *   SUPABASE_URL + SUPABASE_SERVICE_KEY  (see _shared/supabaseAdmin)
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'GET') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonResponse(req, { error: 'Server not configured' }, 503);

  // ── Authenticate the caller ───────────────────────────────────
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  const email = userData?.user?.email?.toLowerCase();
  if (userErr || !email) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  // ── Authorize against the allowlist ───────────────────────────
  const allow = adminEmails();
  if (allow.length === 0) {
    return jsonResponse(req, { error: 'ADMIN_EMAILS not configured on the server' }, 503);
  }
  if (!allow.includes(email)) {
    return jsonResponse(req, { error: 'Forbidden' }, 403);
  }

  // ── Fetch the data (service role) ─────────────────────────────
  const [bookingsRes, leadsRes] = await Promise.all([
    supabase
      .from('confirmed_bookings')
      .select('*')
      .order('confirmed_at', { ascending: false })
      .limit(500),
    supabase
      .from('passcode_leads')
      .select('*')
      .order('captured_at', { ascending: false })
      .limit(1000),
  ]);

  if (bookingsRes.error || leadsRes.error) {
    return jsonResponse(
      req,
      { error: bookingsRes.error?.message || leadsRes.error?.message || 'Query failed' },
      500
    );
  }

  return jsonResponse(req, {
    admin: email,
    bookings: bookingsRes.data || [],
    leads: leadsRes.data || [],
  });
};
