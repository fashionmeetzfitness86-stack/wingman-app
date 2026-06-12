/**
 * register-profile.ts
 * ─────────────────────────────────────────────────────────────
 * Saves a newly-created user profile to the Supabase
 * `user_profiles` table so it's visible to the admin dashboard
 * from any device — not just the device the user signed up on.
 *
 * Called fire-and-forget from handleOnboardingComplete in App.tsx.
 * Never blocks the user flow — fails silently if Supabase is down.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY
 *
 * Supabase table (run once in your Supabase SQL editor):
 * ─────────────────────────────────────────────────────
 * CREATE TABLE IF NOT EXISTS user_profiles (
 *   id            TEXT PRIMARY KEY,
 *   name          TEXT NOT NULL,
 *   email         TEXT UNIQUE NOT NULL,
 *   phone         TEXT,
 *   city          TEXT,
 *   gender        TEXT,
 *   profile_photo TEXT,
 *   approval_status TEXT DEFAULT 'pending',
 *   created_at    TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at    TIMESTAMPTZ DEFAULT NOW()
 * );
 */

import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: 'Invalid request body' }, 400);
  }

  const { id, name, email, phone, city, gender, profilePhoto, joinDate } = body as Record<string, string>;

  if (!email || !name) {
    return jsonResponse(req, { error: 'email and name are required' }, 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Supabase not configured — degrade gracefully, localStorage is still the source
    return jsonResponse(req, { ok: true, skipped: true });
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        id: String(id),
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || null,
        city: city || null,
        gender: gender || null,
        profile_photo: profilePhoto || null,
        approval_status: 'pending',
        created_at: joinDate ? new Date(joinDate).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

  if (error) {
    console.error('[Wingman] register-profile upsert failed:', error.message);
    // Return 200 so client doesn't treat this as a hard failure
    return jsonResponse(req, { ok: false, reason: 'db_error' }, 200);
  }

  return jsonResponse(req, { ok: true });
};
