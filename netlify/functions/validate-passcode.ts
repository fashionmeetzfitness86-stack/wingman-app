import { getSupabaseAdmin } from './_shared/supabaseAdmin';
import { jsonResponse, preflight } from './_shared/cors';

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jsonResponse(req, { error: 'Server not configured' }, 503);
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: 'Invalid request body' }, 400);
  }

  const inputPasscode = (body.passcode || '').trim().toUpperCase();
  if (!inputPasscode) {
    return jsonResponse(req, { error: 'Passcode required' }, 400);
  }

  // Fetch from platform_settings table
  const { data, error } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'access_passcode')
    .maybeSingle();

  if (error) {
    console.error('[Wingman] validate-passcode db query failed:', error.message);
    return jsonResponse(req, { error: 'Query failed' }, 500);
  }

  const activePasscode = data?.value ? String(data.value).trim().toUpperCase() : 'WINGMAN2025';
  const isValid = inputPasscode === activePasscode;

  return jsonResponse(req, { ok: isValid });
};
