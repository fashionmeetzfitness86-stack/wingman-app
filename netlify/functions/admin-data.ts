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
 *                           Must be set in Netlify UI → Environment Variables (not
 *                           only in netlify.toml [build.environment], which is
 *                           build-time only and unavailable to functions at runtime).
 *   SUPABASE_URL + SUPABASE_SERVICE_KEY  (see _shared/supabaseAdmin)
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

// Hardcoded fallback — mirrors get-leads.ts / set-approval.ts / set-user-role.ts /
// delete-profile.ts so the admin email always works even when ADMIN_EMAILS is not
// available at function runtime (e.g. only set in netlify.toml [build.environment]).
const FALLBACK_ADMINS = ['themainkeys@gmail.com', 'anderson.correavaz@gmail.com'];

function adminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  // Use the env-var list when present; fall back to the hardcoded list so the
  // function never becomes inaccessible due to a missing runtime variable.
  return fromEnv.length > 0 ? fromEnv : FALLBACK_ADMINS;
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
  // adminEmails() always returns at least FALLBACK_ADMINS, so allow.length
  // will never be 0. The 503 branch is intentionally removed.
  const allow = adminEmails();
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
