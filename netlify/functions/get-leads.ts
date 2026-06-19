/**
 * get-leads.ts
 * ─────────────────────────────────────────────────────────────
 * Returns all passcode-gate leads AND registered user profiles
 * from Supabase so the admin dashboard sees every user regardless
 * of which device they signed up on.
 *
 * Auth: caller sends their email in `x-admin-email` header.
 *       Server validates against ADMIN_EMAILS env var OR the
 *       hardcoded FALLBACK_ADMINS list so the admin always has
 *       access even when the env var is not set in Netlify UI.
 *
 * Env: ADMIN_EMAILS (optional), SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

// Hardcoded fallback list — covers the case where ADMIN_EMAILS env var
// is not yet set in Netlify UI (e.g. it was only added to netlify.toml
// build.environment which is build-time only, not function runtime).
// Add additional admin emails here if needed.
const FALLBACK_ADMINS = ['themainkeys@gmail.com', 'anderson.correavaz@gmail.com'];

function adminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  // Use env var list if set; otherwise fall back to the hardcoded list.
  return fromEnv.length > 0 ? fromEnv : FALLBACK_ADMINS;
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'GET') return jsonResponse(req, { error: 'Method not allowed' }, 405);

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

  // Fetch passcode leads, registered user profiles, and roles map in parallel
  const [leadsRes, profilesRes, rolesRes] = await Promise.all([
    supabase
      .from('passcode_leads')
      .select('*')
      .order('captured_at', { ascending: false })
      .limit(1000),
    supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'user_roles_v1')
      .maybeSingle()
  ]);

  return jsonResponse(req, {
    leads: leadsRes.data || [],
    profiles: profilesRes.error ? [] : (profilesRes.data || []),
    roles: rolesRes.data?.value || {}
  });
};
