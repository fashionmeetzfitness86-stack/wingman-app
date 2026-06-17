/**
 * set-user-role.ts
 * ─────────────────────────────────────────────────────────────
 * Persists an admin edit of user role / access level to platform_settings
 * under 'user_roles_v1' so it survives cross-device syncs.
 *
 * Auth: requires a Supabase access token whose email is in ADMIN_EMAILS.
 * Body: { email: string, role: string, accessLevel: string }
 * Env:  ADMIN_EMAILS, SUPABASE_URL, SUPABASE_SERVICE_KEY
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
  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonResponse(req, { error: 'Server not configured' }, 503);

  // ── Authenticate + authorize caller as admin ─────────────────
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  const callerEmail = userData?.user?.email?.toLowerCase();
  if (userErr || !callerEmail) return jsonResponse(req, { error: 'Unauthorized' }, 401);
  if (!adminEmails().includes(callerEmail)) return jsonResponse(req, { error: 'Forbidden' }, 403);

  // ── Parse body ───────────────────────────────────────────────
  let body: Record<string, string>;
  try { body = await req.json(); }
  catch { return jsonResponse(req, { error: 'Invalid request body' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  const role = (body.role || '').trim();
  const accessLevel = (body.accessLevel || '').trim();

  if (!email) return jsonResponse(req, { error: 'email required' }, 400);
  if (!role || !accessLevel) return jsonResponse(req, { error: 'role and accessLevel required' }, 400);

  // ── Fetch existing role map ──────────────────────────────────
  const { data: setting, error: getErr } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'user_roles_v1')
    .maybeSingle();

  if (getErr) {
    console.error('[Wingman] set-user-role fetch failed:', getErr.message);
    return jsonResponse(req, { error: 'Fetch failed' }, 500);
  }

  const roles = (setting?.value || {}) as Record<string, { role: string; accessLevel: string }>;
  roles[email] = { role, accessLevel };

  // ── Save back ────────────────────────────────────────────────
  const { error: upsertErr } = await supabase
    .from('platform_settings')
    .upsert({
      key: 'user_roles_v1',
      value: roles,
      updated_at: new Date().toISOString(),
    });

  if (upsertErr) {
    console.error('[Wingman] set-user-role upsert failed:', upsertErr.message);
    return jsonResponse(req, { error: 'Save failed' }, 500);
  }

  return jsonResponse(req, { ok: true });
};
