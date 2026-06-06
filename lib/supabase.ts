import { createClient } from '@supabase/supabase-js';

const url     = import.meta.env.VITE_SUPABASE_URL     as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Graceful degradation — if env vars are missing (e.g. first deploy, local dev without .env.local)
// return a no-op stub so the app renders instead of white-screening.
// Auth features will silently fail; passcode flow continues to work.
function createSafeClient() {
  if (!url || !anonKey) {
    console.warn(
      '[Wingman] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing. ' +
      'Supabase auth is disabled. Add them to .env.local and restart.'
    );
    // Return a minimal stub so imports never throw
    return {
      auth: {
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signUp:             async () => ({ data: null, error: new Error('Supabase not configured') }),
        signOut:            async () => ({ error: null }),
        getUser:            async () => ({ data: { user: null }, error: null }),
        getSession:         async () => ({ data: { session: null }, error: null }),
        resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase not configured') }),
        updateUser:         async () => ({ data: null, error: new Error('Supabase not configured') }),
        onAuthStateChange:  () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession:    true,
      autoRefreshToken:  true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
}

export const supabase = createSafeClient();
