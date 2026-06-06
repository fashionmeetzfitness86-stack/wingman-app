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
export const PASSCODE_STORAGE_KEY = 'wm_admin_passcode';
export const ACCESS_DURATION_MS  = 24 * 60 * 60 * 1000; // 24 hours

// ─── Default passcode ─────────────────────────────────────────
// This is the fallback used when no passcode has been set via the
// Admin Dashboard. Admin should rotate this immediately after first login.
const DEFAULT_PASSCODE = 'WINGMAN2025';

export interface AccessSession {
  email: string;
  fullName: string;  // captured at passcode gate
  grantedAt: number;  // ms timestamp
  expiresAt: number;  // ms timestamp
}

// ─── Admin passcode management ────────────────────────────────

export function getAdminPasscode(): string | null {
  try {
    const stored = localStorage.getItem(PASSCODE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { code: string; updatedAt: number };
      return parsed.code;
    }
  } catch {}
  return DEFAULT_PASSCODE; // fallback until admin sets a custom code
}

export function setAdminPasscode(code: string): void {
  localStorage.setItem(PASSCODE_STORAGE_KEY, JSON.stringify({
    code: code.trim().toUpperCase(),
    updatedAt: Date.now(),
  }));
}

export function getPasscodeLastUpdated(): number | null {
  try {
    const stored = localStorage.getItem(PASSCODE_STORAGE_KEY);
    if (stored) {
      return (JSON.parse(stored) as { updatedAt: number }).updatedAt;
    }
  } catch {}
  return null;
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

export function validatePasscode(input: string): boolean {
  const adminCode = getAdminPasscode();
  // Reject all attempts if no passcode has been configured by admin
  if (!adminCode) return false;
  return input.trim().toUpperCase() === adminCode.toUpperCase();
}

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
  capturedAt: number; // ms timestamp
}

export function recordPasscodeLead(email: string, fullName: string = ''): void {
  try {
    const normalized = email.trim().toLowerCase();
    const existing: PasscodeLead[] = JSON.parse(
      localStorage.getItem(LEADS_STORE_KEY) ?? '[]'
    );
    // Deduplicate — update capturedAt if email already exists
    const filtered = existing.filter(l => l.email !== normalized);
    filtered.push({ email: normalized, fullName: fullName.trim(), capturedAt: Date.now() });
    localStorage.setItem(LEADS_STORE_KEY, JSON.stringify(filtered));
  } catch {}
}

export function getPasscodeLeads(): PasscodeLead[] {
  try {
    return JSON.parse(localStorage.getItem(LEADS_STORE_KEY) ?? '[]');
  } catch {
    return [];
  }
}
