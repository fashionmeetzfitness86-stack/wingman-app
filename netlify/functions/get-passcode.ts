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
  if (!allowed.includes(email)) {
    return jsonResponse(req, { error: 'Forbidden' }, 403);
  }

  // Fetch passcode and last updated timestamp
  const { data, error } = await supabase
    .from('platform_settings')
    .select('value, updated_at')
    .eq('key', 'access_passcode')
    .maybeSingle();

  if (error) {
    console.error('[Wingman] get-passcode db query failed:', error.message);
    return jsonResponse(req, { error: 'Query failed' }, 500);
  }

  const passcode = data?.value ? String(data.value).trim().toUpperCase() : 'WINGMAN2025';
  const updatedAt = data?.updated_at ? new Date(data.updated_at).getTime() : Date.now();

  return jsonResponse(req, { passcode, updatedAt });
};
