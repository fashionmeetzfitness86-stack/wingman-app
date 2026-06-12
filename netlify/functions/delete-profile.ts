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

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'DELETE') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  let body: Record<string, string>;
  try { body = await req.json(); } catch { return jsonResponse(req, { error: 'Invalid body' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  if (!email) return jsonResponse(req, { error: 'email required' }, 400);

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonResponse(req, { ok: true, skipped: true });

  // Remove from both tables — ignore errors if row doesn't exist
  await Promise.all([
    supabase.from('user_profiles').delete().eq('email', email),
    supabase.from('passcode_leads').delete().eq('email', email),
  ]);

  return jsonResponse(req, { ok: true });
};
