/**
 * supabaseAdmin.ts — service-role Supabase client for server functions.
 * ─────────────────────────────────────────────────────────────
 * Uses the SERVICE ROLE key, which bypasses RLS. NEVER import this
 * from client code — it must only ever run inside Netlify functions.
 *
 * Required env vars (set in Netlify, not committed):
 *   SUPABASE_URL          — same project URL as VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_KEY  — service_role key from Supabase > Settings > API
 *
 * Returns null when the env vars are missing so callers can degrade
 * gracefully (e.g. webhook still ACKs Stripe) instead of throwing.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// supabase-js constructs a RealtimeClient at init, which requires a global
// WebSocket constructor to EXIST (even though these server functions never use
// realtime). Node < 22 has no native WebSocket, so construction throws a 502.
// Provide a harmless stub when none exists — it is never actually instantiated
// because we never open a channel. (On Node 22+ the native one is used.)
if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class {
    constructor() { throw new Error('realtime not supported in this runtime'); }
  };
}

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn('[Wingman] SUPABASE_URL or SUPABASE_SERVICE_KEY missing — DB writes skipped');
    return null;
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
