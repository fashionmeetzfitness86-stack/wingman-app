/**
 * capture-lead.ts
 * ─────────────────────────────────────────────────────────────
 * Persists passcode-gate leads (email + name) to Supabase so the
 * business actually receives them. Previously leads lived only in
 * the visitor's localStorage and were invisible server-side.
 *
 * Fire-and-forget from the client — never blocks the access flow.
 * Requires SUPABASE_URL + SUPABASE_SERVICE_KEY (see _shared/supabaseAdmin).
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  let email = '';
  let fullName = '';
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
    email = (String(body.email || '')).trim().toLowerCase();
    fullName = (String(body.fullName || '')).trim();
  } catch {
    return jsonResponse(req, { error: 'Invalid request body' }, 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(req, { error: 'Valid email required' }, 400);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Degrade gracefully — the client also keeps a localStorage copy.
    return jsonResponse(req, { ok: true, skipped: true });
  }

  const { error } = await supabase
    .from('passcode_leads')
    .upsert(
      {
        email,
        full_name: fullName || undefined,
        captured_at: new Date().toISOString(),
        // Only write richer fields when explicitly provided
        ...(body.profileCreated !== undefined && { profile_created: body.profileCreated }),
        ...(body.userId          !== undefined && { user_id: String(body.userId) }),
        ...(body.status          !== undefined && { status: body.status }),
      },
      { onConflict: 'email' }
    );


  if (error) {
    console.error('[Wingman] capture-lead insert failed:', error.message);
    return jsonResponse(req, { ok: false, reason: 'db_error' }, 200);
  }

  return jsonResponse(req, { ok: true });
};
