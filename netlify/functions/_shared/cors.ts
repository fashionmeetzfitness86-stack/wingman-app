/**
 * cors.ts — shared CORS policy for all Netlify functions.
 * ─────────────────────────────────────────────────────────────
 * Locks Access-Control-Allow-Origin to a known allowlist instead of "*".
 * The request Origin is reflected back only when it matches the list,
 * which is required for credentialed/browser calls and keeps the
 * endpoints from being trivially invoked by arbitrary third-party sites.
 *
 * Extra origins can be added via the ALLOWED_ORIGINS env var
 * (comma-separated) without a code change.
 */

const STATIC_ALLOWED = [
  'https://wingman-app.com',
  'https://www.wingman-app.com',
  'https://wingman-app.netlify.app',
  'http://localhost:5173',
  'http://localhost:8888',
];

function allowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return [...STATIC_ALLOWED, ...fromEnv];
}

/** Resolve the Access-Control-Allow-Origin value for this request. */
export function resolveAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  return allowedOrigins().includes(origin) ? origin : STATIC_ALLOWED[0];
}

/** Base CORS headers for a given request. */
export function corsHeaders(req: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': resolveAllowedOrigin(req),
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

/** JSON response with CORS + content-type applied. */
export function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
  });
}

/** Standard preflight handler. */
export function preflight(req: Request): Response {
  return new Response('', { headers: corsHeaders(req) });
}
