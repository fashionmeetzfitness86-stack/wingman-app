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

// Hardcoded fallback — mirrors get-leads.ts so both admin emails are always
// recognised as admins even when ADMIN_EMAILS env var isn't available at
// function runtime (controls elevated permissions during profile registration).
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
  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonResponse(req, { error: 'Server not configured' }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: 'Invalid request body' }, 400);
  }

  const { id, name, email, phone, city, gender, profilePhoto, joinDate, approvalStatus } = body as Record<string, string>;

  if (!email || !name) {
    return jsonResponse(req, { error: 'email and name are required' }, 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ── 1. Parse token (if any) ─────────────────────────────────
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  let callerEmail: string | null = null;
  let isAdmin = false;

  if (token) {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    callerEmail = userData?.user?.email?.toLowerCase() || null;
    if (userErr || !callerEmail) {
      return jsonResponse(req, { error: 'Unauthorized token' }, 401);
    }
    isAdmin = adminEmails().includes(callerEmail);
  }

  // ── 2. Fetch existing profile from DB (if any) ───────────────
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('approval_status, email')
    .eq('email', normalizedEmail)
    .maybeSingle();

  // ── 3. Enforce permissions & determine approval status ───────
  let finalStatus = 'pending';
  if (existingProfile) {
    // Updating an existing profile
    if (!isAdmin) {
      if (!callerEmail || callerEmail !== normalizedEmail) {
        return jsonResponse(req, { error: 'Forbidden: Cannot modify another user\'s profile' }, 403);
      }
      // Force keeping the existing approval status (non-admins cannot approve themselves)
      finalStatus = existingProfile.approval_status || 'pending';
    } else {
      // Admins can change status
      finalStatus = (approvalStatus === 'approved' || approvalStatus === 'rejected') ? approvalStatus : (existingProfile.approval_status || 'pending');
    }
  } else {
    // Registering a new profile
    if (!isAdmin) {
      if (token && callerEmail !== normalizedEmail) {
        return jsonResponse(req, { error: 'Forbidden: Email mismatch with authenticated user' }, 403);
      }
      // Guests or new signups always default to 'pending'
      finalStatus = 'pending';
    } else {
      // Admins can set status during manual creation
      finalStatus = (approvalStatus === 'approved' || approvalStatus === 'rejected') ? approvalStatus : 'pending';
    }
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
        approval_status: finalStatus,
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
