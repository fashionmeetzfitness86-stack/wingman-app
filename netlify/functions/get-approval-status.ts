/**
 * get-approval-status.ts
 * ─────────────────────────────────────────────────────────────
 * Lets a logged-in client learn ITS OWN approval status, so the
 * booking gate unlocks after an admin approves them. The admin-only
 * get-leads endpoint can't be used by regular clients, so without
 * this they never see their approval and stay blocked.
 *
 * GET /.netlify/functions/get-approval-status?email=foo@bar.com
 * → { status: 'pending' | 'approved' | 'rejected' }
 *
 * Returns 'pending' when no profile exists yet. Low-sensitivity
 * (only reveals approval state for an email the caller supplies).
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'GET') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  const supabase = getSupabaseAdmin();
  if (!supabase) return jsonResponse(req, { status: 'pending', configured: false });

  const email = (new URL(req.url).searchParams.get('email') || '').trim().toLowerCase();
  if (!email) return jsonResponse(req, { error: 'email required' }, 400);

  const { data, error } = await supabase
    .from('user_profiles')
    .select('approval_status')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('[Wingman] get-approval-status failed:', error.message);
    return jsonResponse(req, { status: 'pending', error: 'query_failed' });
  }

  return jsonResponse(req, { status: data?.approval_status || 'pending' });
};
