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

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'DELETE') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  // Validate caller is an admin
  const callerEmail = (req.headers.get('x-admin-email') || '').trim().toLowerCase();
  const allowed = adminEmails();
  if (allowed.length > 0 && (!callerEmail || !allowed.includes(callerEmail))) {
    return jsonResponse(req, { error: 'Forbidden' }, 403);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonResponse(req, { ok: true, skipped: true });
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
