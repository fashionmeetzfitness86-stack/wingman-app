/**
 * send-welcome-email.ts
 * ─────────────────────────────────────────────────────────────
 * Triggered immediately after passcode access is granted.
 * Sends a branded welcome email telling the user to create
 * their profile within 24 hours.
 *
 * Requires env var:
 *   RESEND_API_KEY  — from resend.com (free tier covers this)
 *   RESEND_FROM     — verified sender address, e.g. hello@wingman-app.com
 *                     Defaults to onboarding@wingman-app.com if not set.
 *
 * Fails silently (returns 200) if RESEND_API_KEY is not set so that
 * a missing env var never blocks the user flow.
 */

import { jsonResponse, preflight } from './_shared/cors';

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM || 'WINGMAN Miami <onboarding@wingman-app.com>';

  // Fail silently — a missing email key should never break the auth flow
  if (!apiKey) {
    console.warn('[Wingman] RESEND_API_KEY not configured — welcome email skipped');
    return jsonResponse(req, { ok: true, skipped: true });
  }

  let email = '';
  try {
    const body = await req.json();
    email = (body.email || '').trim().toLowerCase();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(req, { error: 'Valid email required' }, 400);
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to WINGMAN</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo / wordmark -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.4em;color:#4B5563;text-transform:uppercase;font-weight:700;">
                WINGMAN · MIAMI
              </p>
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:48px 40px;">

              <!-- Check icon -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <div style="width:72px;height:72px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin:0 auto;">
                      <span style="font-size:32px;">✓</span>
                    </div>
                  </td>
                </tr>

                <!-- Headline -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                      Access Granted
                    </h1>
                  </td>
                </tr>

                <!-- Sub -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.6;max-width:380px;">
                      You're in. Your 24-hour window starts now.
                      Create your profile to unlock reservations at Miami's most
                      exclusive venues.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-bottom:32px;">
                    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);"></div>
                  </td>
                </tr>

                <!-- What happens next -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#4B5563;text-transform:uppercase;letter-spacing:0.1em;">
                      What happens next
                    </p>

                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="32" valign="top">
                          <div style="width:24px;height:24px;background:rgba(255,255,255,0.06);border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#9CA3AF;">1</div>
                        </td>
                        <td valign="top" style="padding-left:10px;">
                          <p style="margin:0;font-size:14px;color:#D1D5DB;font-weight:600;">Create your profile (5 quick steps)</p>
                          <p style="margin:4px 0 0;font-size:12px;color:#6B7280;">Name, photo, contact info, and password</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="32" valign="top">
                          <div style="width:24px;height:24px;background:rgba(255,255,255,0.06);border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#9CA3AF;">2</div>
                        </td>
                        <td valign="top" style="padding-left:10px;">
                          <p style="margin:0;font-size:14px;color:#D1D5DB;font-weight:600;">Browse this week's events</p>
                          <p style="margin:4px 0 0;font-size:12px;color:#6B7280;">Nightclubs, dinners, and yacht experiences</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top">
                          <div style="width:24px;height:24px;background:rgba(255,255,255,0.06);border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#9CA3AF;">3</div>
                        </td>
                        <td valign="top" style="padding-left:10px;">
                          <p style="margin:0;font-size:14px;color:#D1D5DB;font-weight:600;">Reserve your spot</p>
                          <p style="margin:4px 0 0;font-size:12px;color:#6B7280;">Confirm with a card — no surprises</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 24h warning -->
                <tr>
                  <td style="padding-bottom:32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:16px 20px;">
                          <p style="margin:0;font-size:13px;color:#FCA5A5;font-weight:600;">
                            ⏱ Your access expires in 24 hours
                          </p>
                          <p style="margin:6px 0 0;font-size:12px;color:#9CA3AF;line-height:1.5;">
                            Complete your profile before your window closes.
                            After that, you'll need a new passcode to re-enter.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA button -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <a href="https://wingman-app.com"
                       style="display:inline-block;background:linear-gradient(135deg,#ffffff,#9CA3AF,#374151);color:#000000;font-weight:900;font-size:14px;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:0.02em;">
                      Create My Profile →
                    </a>
                  </td>
                </tr>

                <!-- Fine print -->
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:11px;color:#374151;line-height:1.6;">
                      You received this because your email was used to access WINGMAN Miami.<br/>
                      Questions? Reply to this email or contact your host.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:10px;color:#1F2937;letter-spacing:0.15em;text-transform:uppercase;">
                WINGMAN · MIAMI · PRIVATE ACCESS
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
WINGMAN MIAMI — Access Granted

Your 24-hour window starts now.

Create your profile to unlock reservations:
https://wingman-app.com

What's next:
1. Create your profile (5 quick steps)
2. Browse this week's events — nightclubs, dinners, yacht experiences
3. Reserve your spot and confirm with a card

⏱ Your access expires in 24 hours. Complete your profile before your window closes.

Questions? Reply to this email or contact your host.

— WINGMAN Miami
`.trim();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: "You're in — create your profile before your 24 hrs expire",
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Wingman] Resend API error:', res.status, errText);
      // Return 200 — don't block the user flow for an email failure
      return jsonResponse(req, { ok: false, reason: 'email_send_failed' });
    }

    return jsonResponse(req, { ok: true });
  } catch (err: any) {
    console.error('[Wingman] send-welcome-email exception:', err?.message);
    // Fail silently
    return jsonResponse(req, { ok: false, reason: 'exception' });
  }
};
