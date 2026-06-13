/**
 * get-leads.ts
 * ─────────────────────────────────────────────────────────────
 * Returns all passcode-gate leads AND registered user profiles
 * from Supabase so the admin dashboard sees every user regardless
 * of which device they signed up on.
 *
 * Auth: caller sends their email in `x-admin-email` header.
 *       Server validates against ADMIN_EMAILS env var.
 *       Intentionally simpler than full Supabase auth so the
 *       local-mock admin account can call this without a session.
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
  if (req.method !== 'GET') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  // Validate caller is an admin
  const callerEmail = (req.headers.get('x-admin-email') || '').trim().toLowerCase();
  const allowed = adminEmails();
  
  // FIX: always require a valid caller email AND a non-empty allow-list.
  // If ADMIN_EMAILS env var is missing or empty, deny ALL access (fail-safe).
  // This prevents open data exposure in misconfigured deployments.
  if (!callerEmail || allowed.length === 0 || !allowed.includes(callerEmail)) {
    return jsonResponse(req, { error: 'Forbidden — admin email required' }, 403);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Supabase not configured — return empty so app degrades gracefully
    return jsonResponse(req, { leads: [], profiles: [], skipped: true });
  }

  // Fetch passcode leads
  const leadsRes = await supabase
    .from('passcode_leads')
    .select('*')
    .order('captured_at', { ascending: false })
    .limit(1000);

  // Fetch registered user profiles (table may not exist yet — handle gracefully)
  const profilesRes = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  return jsonResponse(req, {
    leads: leadsRes.data || [],
    // Silently ignore if user_profiles table doesn't exist yet
    profiles: profilesRes.error ? [] : (profilesRes.data || []),
  });
};
