import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

// Primary source: ADMIN_EMAILS env var (comma-separated).
// Fallback ensures admin access even if env var is temporarily missing.
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

  // ── Authenticate the caller ───────────────────────────────────
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  const email = userData?.user?.email?.toLowerCase();
  if (userErr || !email) return jsonResponse(req, { error: 'Unauthorized' }, 401);

  // ── Validate caller is an admin ───────────────────────────────
  const allowed = adminEmails();
  if (!allowed.includes(email)) {
    return jsonResponse(req, { error: 'Forbidden' }, 403);
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: 'Invalid request body' }, 400);
  }

  const newPasscode = (body.passcode || '').trim().toUpperCase();
  if (!newPasscode || newPasscode.length < 6 || newPasscode.length > 20 || !/^[A-Z0-9]+$/.test(newPasscode)) {
    return jsonResponse(req, { error: 'Invalid passcode format (6-20 alphanumeric chars)' }, 400);
  }

  // Upsert the passcode setting
  const { error } = await supabase
    .from('platform_settings')
    .upsert({
      key: 'access_passcode',
      value: newPasscode, // supabase-js handles jsonb serialization
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[Wingman] update-passcode db upsert failed:', error.message);
    return jsonResponse(req, { error: 'Update failed' }, 500);
  }

  return jsonResponse(req, { ok: true });
};
