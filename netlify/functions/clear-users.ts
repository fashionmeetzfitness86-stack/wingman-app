/**
 * clear-users.ts
 * ─────────────────────────────────────────────────────────────
 * Wipes all rows from user_profiles and passcode_leads so the
 * admin can start fresh. Protected by x-admin-email header
 * validated against ADMIN_EMAILS env var.
 *
 * Env: ADMIN_EMAILS, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

// Hardcoded fallback — mirrors get-leads.ts so both admin emails always work
// even when ADMIN_EMAILS env var isn't available at function runtime.
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
  if (allowed.length === 0) {
    return jsonResponse(req, { error: 'ADMIN_EMAILS not configured on the server' }, 503);
  }
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
