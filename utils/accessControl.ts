/**
 * accessControl.ts
 * ─────────────────────────────────────────────────────────────
 * Gated access system for the Wingman platform.
 * Manages passcode validation, session storage, and expiry.
 *
 * Access tiers:
 *  1. None      — can browse limited content (title + date only)
 *  2. Passcode  — 24-hour access after entering valid passcode
 *  3. Account   — permanent access (logged-in user)
 */

export const ACCESS_STORAGE_KEY  = 'wm_access';
export const ACCESS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AccessSession {
  email: string;
  fullName: string;  // captured at passcode gate
  grantedAt: number;  // ms timestamp
  expiresAt: number;  // ms timestamp
}

// ─── Session management ───────────────────────────────────────

export function getAccessSession(): AccessSession | null {
  try {
    const raw = localStorage.getItem(ACCESS_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AccessSession;
    // Check expiry
    if (Date.now() > session.expiresAt) {
      clearAccessSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function grantPasscodeAccess(email: string, fullName: string = ''): AccessSession {
  const session: AccessSession = {
    email,
    fullName: fullName.trim(),
    grantedAt: Date.now(),
    expiresAt: Date.now() + ACCESS_DURATION_MS,
  };
  localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(session));
  // Always record the email+name as a permanent lead for outreach
  recordPasscodeLead(email, fullName);
  return session;
}

export function clearAccessSession(): void {
  localStorage.removeItem(ACCESS_STORAGE_KEY);
}

// ─── Validation ───────────────────────────────────────────────


export function hasActivePasscodeSession(): boolean {
  return getAccessSession() !== null;
}

export function getTimeRemainingMs(): number {
  const session = getAccessSession();
  if (!session) return 0;
  return Math.max(0, session.expiresAt - Date.now());
}

export function formatTimeRemaining(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

// ─── Persistent Lead Capture ──────────────────────────────────
// Emails entered at the passcode gate are stored permanently —
// independent of the 24-hour access session — so they can be
// used for follow-up outreach after session expiry.

export const LEADS_STORE_KEY = 'wm_passcode_leads';

export interface PasscodeLead {
  email: string;
  fullName: string;
  capturedAt: number;           // ms timestamp of FIRST access
  expiresAt: number;            // capturedAt + 24h (refreshed on re-entry)
  profileCreated: boolean;      // true once onboarding completes
  userId?: number;              // linked after onboarding
  status: 'temporary_access' | 'profile_created' | 'expired';
  accessSource: 'passcode';     // always passcode for now
  lastSeenAt?: number;          // updated on each session grant
}

export function recordPasscodeLead(email: string, fullName: string = ''): void {
  const normalized = email.trim().toLowerCase();
  const now = Date.now();
  // Keep a local copy as an offline fallback…
  try {
    const existing: PasscodeLead[] = JSON.parse(
      localStorage.getItem(LEADS_STORE_KEY) ?? '[]'
    );
    const prev = existing.find(l => l.email === normalized);
    const filtered = existing.filter(l => l.email !== normalized);
    // Build the updated lead — never downgrade profileCreated from true to false
    const updated: PasscodeLead = {
      email: normalized,
      fullName: fullName.trim() || prev?.fullName || '',
      capturedAt: prev?.capturedAt ?? now,   // preserve original first-access time
      expiresAt: now + ACCESS_DURATION_MS,   // refresh 24h window on each entry
      profileCreated: prev?.profileCreated ?? false,
      userId: prev?.userId,
      status: prev?.profileCreated ? 'profile_created' : 'temporary_access',
      accessSource: 'passcode',
      lastSeenAt: now,
    };
    filtered.push(updated);
    localStorage.setItem(LEADS_STORE_KEY, JSON.stringify(filtered));
  } catch {}

  // …and persist to the server so the business actually receives the lead.
  // Fire-and-forget: never block or break the access flow on a network error.
  try {
    void fetch('/.netlify/functions/capture-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, fullName: fullName.trim() }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

/** Called when a lead completes onboarding and becomes a full user. */
export function markLeadAsConverted(email: string, userId: number): void {
  const normalized = email.trim().toLowerCase();
  try {
    const existing: PasscodeLead[] = JSON.parse(
      localStorage.getItem(LEADS_STORE_KEY) ?? '[]'
    );
    const updated = existing.map(l =>
      l.email === normalized
        ? { ...l, profileCreated: true, userId, status: 'profile_created' as const }
        : l
    );
    localStorage.setItem(LEADS_STORE_KEY, JSON.stringify(updated));
  } catch {}
  // Also notify the server so cross-device admin sees the conversion
  try {
    void fetch('/.netlify/functions/capture-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalized,
        profileCreated: true,
        userId: String(userId),
        status: 'profile_created',
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function getPasscodeLeads(): PasscodeLead[] {
  try {
    return JSON.parse(localStorage.getItem(LEADS_STORE_KEY) ?? '[]');
  } catch {
    return [];
  }
}
