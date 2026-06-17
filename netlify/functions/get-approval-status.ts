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

  const [profileRes, rolesRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('approval_status')
      .eq('email', email)
      .maybeSingle(),
    supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'user_roles_v1')
      .maybeSingle()
  ]);

  if (profileRes.error) {
    console.error('[Wingman] get-approval-status profile query failed:', profileRes.error.message);
  }

  const approvalStatus = profileRes.data?.approval_status || 'pending';
  const rolesMap = (rolesRes.data?.value || {}) as Record<string, { role: string; accessLevel: string }>;
  const userRoleData = rolesMap[email];

  // Only include role/accessLevel when they are explicitly stored in the DB.
  // Returning a hardcoded default ('User') when no record exists would
  // silently overwrite a real Admin/Wingman role on the client side.
  const response: Record<string, string> = { status: approvalStatus };
  if (userRoleData?.role)        response.role        = userRoleData.role;
  if (userRoleData?.accessLevel) response.accessLevel = userRoleData.accessLevel;

  return jsonResponse(req, response);
};
