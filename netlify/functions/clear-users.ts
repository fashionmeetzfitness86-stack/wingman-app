/**
 * clear-users.ts
 * ─────────────────────────────────────────────────────────────
 * Wipes all rows from user_profiles and passcode_leads so the
 * admin can start fresh. Protected by Bearer token verified
 * against ADMIN_EMAILS env var OR the hardcoded FALLBACK_ADMINS
 * list — consistent with all other admin-protected functions.
 *
 * Env: ADMIN_EMAILS (optional), SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

// Primary source: ADMIN_EMAILS env var (comma-separated).
// Fallback ensures admin access even if env var is missing at runtime.
const FALLBACK_ADMINS = ['themainkeys@gmail.com', 'anderson.correavaz@gmail.com'];

function adminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : FALLBACK_ADMINS;
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'DELETE') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonResponse(req, { error: 'Server not configured' }, 503);
  }

  // ── Authenticate the caller ───────────────────────────────────
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  const email = userData?.user?.email?.toLowerCase();
  if (userErr || !email) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  // ── Validate caller is an admin ───────────────────────────────
  const allowed = adminEmails();
  if (!allowed.includes(email)) {
    return jsonResponse(req, { error: 'Forbidden' }, 403);
  }

  // Delete ALL rows from both tables
  const [profilesRes, leadsRes] = await Promise.all([
    supabase.from('user_profiles').delete().neq('id', '__never__'),
    supabase.from('passcode_leads').delete().neq('email', '__never__'),
  ]);

  if (profilesRes.error || leadsRes.error) {
    console.error('[Wingman] clear-users error:',
      profilesRes.error?.message, leadsRes.error?.message);
    return jsonResponse(req, { ok: false, reason: 'db_error' }, 200);
  }

  return jsonResponse(req, { ok: true });
};
