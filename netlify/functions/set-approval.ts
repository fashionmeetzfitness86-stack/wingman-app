/**
 * set-approval.ts
 * ─────────────────────────────────────────────────────────────
 * Persists an admin approve/reject decision to user_profiles so it
 * survives the background sync (which otherwise pulls the server's
 * 'pending' status back and reverts a local approval).
 *
 * Auth: requires a Supabase access token whose email is in ADMIN_EMAILS.
 * Body: { email: string, status: 'approved' | 'rejected' | 'pending' }
 * Env:  ADMIN_EMAILS, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

// Hardcoded fallback — mirrors get-leads.ts so the admin email always works
// even when ADMIN_EMAILS env var isn't available at function runtime.
const FALLBACK_ADMINS = ['themainkeys@gmail.com'];

function adminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : FALLBACK_ADMINS;
}

const ALLOWED = ['approved', 'rejected', 'pending'];

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonResponse(req, { error: 'Server not configured' }, 503);

  // ── Authenticate + authorize the caller as an admin ───────────
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  const callerEmail = userData?.user?.email?.toLowerCase();
  if (userErr || !callerEmail) return jsonResponse(req, { error: 'Unauthorized' }, 401);
  if (!adminEmails().includes(callerEmail)) return jsonResponse(req, { error: 'Forbidden' }, 403);

  // ── Parse + validate body ─────────────────────────────────────
  let body: Record<string, string>;
  try { body = await req.json(); }
  catch { return jsonResponse(req, { error: 'Invalid request body' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  const status = (body.status || '').trim().toLowerCase();
  if (!email) return jsonResponse(req, { error: 'email required' }, 400);
  if (!ALLOWED.includes(status)) return jsonResponse(req, { error: 'invalid status' }, 400);

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ approval_status: status, updated_at: new Date().toISOString() })
    .eq('email', email)
    .select('email');

  if (error) {
    console.error('[Wingman] set-approval failed:', error.message);
    return jsonResponse(req, { error: 'Update failed' }, 500);
  }

  // data.length === 0 means no profile row yet (e.g. seed/local-only user);
  // local state still updates, so report ok with a flag.
  return jsonResponse(req, { ok: true, updated: (data?.length ?? 0) > 0 });
};
