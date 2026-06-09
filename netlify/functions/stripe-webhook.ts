/**
 * stripe-webhook.ts
 * ─────────────────────────────────────────────────────────────
 * Stripe webhook handler — listens for checkout.session.completed
 * events so bookings are confirmed even when the browser closes
 * before the redirect lands.
 *
 * Requires env vars:
 *   STRIPE_API_KEY (or STRIPE_SECRET_KEY / STRIPE_KEY)
 *   STRIPE_WEBHOOK_SECRET  — from Stripe dashboard > Webhooks > signing secret
 *
 * Setup in Stripe Dashboard:
 *   Endpoint URL: https://your-site.netlify.app/.netlify/functions/stripe-webhook
 *   Events to send: checkout.session.completed
 *
 * On success: logs the confirmed session and stores a compact
 * confirmation record that the client can poll on return.
 */

import Stripe from 'stripe';
import { getSupabaseAdmin } from './_shared/supabaseAdmin';

const getStripeKey = (): string => {
  const key =
    process.env.STRIPE_API_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_KEY;
  if (!key) throw new Error('No Stripe API key configured');
  return key;
};

export default async (req: Request) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('[Wingman] STRIPE_WEBHOOK_SECRET not set — webhook signature verification skipped (unsafe)');
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(getStripeKey(), { apiVersion: '2026-02-25.clover' });
    const rawBody = await req.text();

    if (webhookSecret) {
      const signature = req.headers.get('stripe-signature') ?? '';
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('[Wingman] Webhook signature verification failed:', err.message);
        return new Response(JSON.stringify({ error: 'Webhook signature invalid' }), { status: 400 });
      }
    } else {
      // Skip signature check if secret not configured (dev/staging only)
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('[Wingman] stripe-webhook parse error:', err.message);
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
  }

  // ── Handle checkout.session.completed ─────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Payment must be paid (not just open)
    if (session.payment_status !== 'paid') {
      console.log(`[Wingman] Session ${session.id} not yet paid — ignoring`);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // Extract the cart context we embedded at checkout time.
    // create-checkout stores it under `cart_context` (snake_case) — must match.
    const rawCartContext = session.metadata?.cart_context || '';
    const cartContext = rawCartContext
      ? (() => {
          try { return JSON.parse(rawCartContext); }
          catch { return null; }
        })()
      : null;

    console.log('[Wingman] checkout.session.completed', {
      sessionId:      session.id,
      amountTotal:    session.amount_total,
      customerEmail:  session.customer_details?.email,
      cartContext,
    });

    // ── Persist the confirmed booking ─────────────────────────────────────────
    // The client polls verify-session on redirect; this webhook is the durable
    // source of truth so a booking survives even if the browser closes before
    // the redirect lands. Upsert on stripe_session_id makes retries idempotent.
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase
        .from('confirmed_bookings')
        .upsert(
          {
            stripe_session_id:  session.id,
            user_id:            session.metadata?.userId || null,
            customer_email:     session.customer_details?.email || null,
            amount_total_cents: session.amount_total ?? 0,
            currency:           session.currency || 'usd',
            cart_context:       cartContext,
            confirmed_at:       new Date().toISOString(),
          },
          { onConflict: 'stripe_session_id' }
        );
      if (error) {
        // Returning 500 makes Stripe retry the webhook, which is what we want
        // if the DB write failed transiently.
        console.error('[Wingman] Failed to persist confirmed booking:', error.message);
        return new Response(JSON.stringify({ error: 'persist_failed' }), { status: 500 });
      }
      console.log('[Wingman] Booking persisted for session:', session.id);
    } else {
      console.warn('[Wingman] Supabase admin not configured — booking NOT persisted:', session.id);
    }
  }

  // Acknowledge all other event types
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Netlify function config — use raw body for Stripe signature verification
export const config = {
  path: '/.netlify/functions/stripe-webhook',
};
