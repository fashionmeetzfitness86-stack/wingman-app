/**
 * delete-profile.ts
 * ─────────────────────────────────────────────────────────────
 * Removes a user from both user_profiles and passcode_leads so
 * they don't re-appear in the admin dashboard after deletion.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

// Hardcoded fallback — mirrors get-leads.ts so the admin email always works
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

  let body: Record<string, string>;
  try { body = await req.json(); } catch { return jsonResponse(req, { error: 'Invalid body' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  if (!email) return jsonResponse(req, { error: 'email required' }, 400);

  // ── Authenticate the caller ───────────────────────────────────
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  const callerEmail = userData?.user?.email?.toLowerCase();
  if (userErr || !callerEmail) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  // ── Validate caller is either an admin or the profile owner ───
  const allowedAdmins = adminEmails();
  const isAdmin = allowedAdmins.includes(callerEmail);
  const isOwner = callerEmail === email;

  if (!isAdmin && !isOwner) {
    return jsonResponse(req, { error: 'Forbidden' }, 403);
  }

  // Remove from both tables — ignore errors if row doesn't exist
  await Promise.all([
    supabase.from('user_profiles').delete().eq('email', email),
    supabase.from('passcode_leads').delete().eq('email', email),
  ]);

  return jsonResponse(req, { ok: true });
};
