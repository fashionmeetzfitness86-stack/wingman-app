import Stripe from 'stripe';

// ─── Server-side price authority ─────────────────────────────────────────────
// This is the SINGLE SOURCE OF TRUTH for pricing.
// The client is NEVER trusted for price data — it sends only a scheduleId
// and quantity. The server resolves the dollar amount here.
//
// Keep this in sync with utils/eventSchedule.ts WEEKLY_SCHEDULE.
// When you add or update an event price, update BOTH files.
// ─────────────────────────────────────────────────────────────────────────────

interface ScheduleEntry {
  id: string;
  title: string;
  pricePerPerson: number; // USD
  maxPerBooking?: number;
}

const PRICE_SCHEDULE: ScheduleEntry[] = [
  // ── Monday ──
  { id: 'mon-dinner-nobu',           title: 'Wingman Dinner @ Nobu',          pricePerPerson: 400, maxPerBooking: 2 },
  // ── Tuesday ──
  { id: 'tue-nightclub-mr-jones',    title: 'Wingman @ Mr. Jones',            pricePerPerson: 500 },
  // ── Wednesday ──
  { id: 'wed-dinner-sexy-fish',      title: 'Wingman Dinner @ Sexy Fish',     pricePerPerson: 400, maxPerBooking: 2 },
  // ── Thursday ──
  { id: 'thu-nightclub-liv',         title: 'Wingman @ LIV',                  pricePerPerson: 500 },
  // ── Friday ──
  { id: 'fri-nightclub-e11even',     title: 'Wingman @ E11EVEN',              pricePerPerson: 500 },
  { id: 'fri-nightclub-mr-jones',    title: 'Wingman @ Mr. Jones',            pricePerPerson: 500 },
  { id: 'fri-yacht-biscayne',        title: 'Friday Yacht — Biscayne Bay',    pricePerPerson: 350 },
  // ── Saturday ──
  { id: 'sat-nightclub-story',       title: 'Wingman @ Story',                pricePerPerson: 500 },
  { id: 'sat-nightclub-mr-jones',    title: 'Wingman @ Mr. Jones',            pricePerPerson: 500 },
  { id: 'sat-yacht-miami-beach',     title: 'Saturday Yacht — Miami Beach',   pricePerPerson: 350 },
  // ── Sunday ──
  { id: 'sun-dinner-komodo',         title: 'Sunday Dinner @ Komodo',         pricePerPerson: 400, maxPerBooking: 2 },
  { id: 'sun-yacht-key-biscayne',    title: 'Sunday Yacht — Key Biscayne',    pricePerPerson: 350 },
];

// Build a lookup map for O(1) access
const PRICE_MAP = new Map<string, ScheduleEntry>(
  PRICE_SCHEDULE.map(e => [e.id, e])
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface BookingPayload {
  /**
   * The scheduleId from WEEKLY_SCHEDULE (e.g. 'fri-nightclub-e11even').
   * This is NOT an instanceId — the date suffix is stripped server-side
   * so that any client-supplied date cannot affect pricing.
   */
  scheduleId: string;
  /** Full instanceId stored in cart (e.g. 'fri-nightclub-e11even-2025-06-07') */
  instanceId: string;
  /** Number of spots being purchased */
  quantity: number;
  /** Cart item ID, echoed back in metadata for post-payment reconciliation */
  cartItemId: string;
}

interface RequestBody {
  bookings: BookingPayload[];
  /** Legacy cart items (tables, experiences, store) that don't have a scheduleId */
  genericItems?: { cartItemId: string; name: string; unitPrice: number; quantity: number }[];
  userEmail?: string;
  userId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const apiKey = process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY;
    if (!apiKey) {
      throw new Error(
        'Stripe secret key missing. Set STRIPE_API_KEY (or STRIPE_SECRET_KEY) in Netlify environment variables and redeploy.'
      );
    }

    const stripe = new Stripe(apiKey, { apiVersion: '2026-02-25.clover' as any });

    const body = await req.json() as RequestBody;
    const { bookings, genericItems = [], userEmail, userId, successUrl, cancelUrl } = body;

    if ((!bookings || bookings.length === 0) && (!genericItems || genericItems.length === 0)) {
      return new Response(JSON.stringify({ error: 'No bookings provided' }), { status: 400 });
    }

    // ── Server-side price resolution ─────────────────────────────────────────
    // We NEVER use any price the client sent for scheduled events.
    // Generic (legacy) items use client price since they have no scheduleId.
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const resolvedBookings: { cartItemId: string; instanceId: string; quantity: number; unitPrice: number }[] = [];

    for (const booking of bookings) {
      const { scheduleId, instanceId, quantity, cartItemId } = booking;

      if (!scheduleId || !instanceId || !quantity || !cartItemId) {
        return new Response(
          JSON.stringify({ error: `Invalid booking payload: missing required field` }),
          { status: 400 }
        );
      }

      // Strip the date suffix to get the base schedule ID
      // Instance IDs look like: 'fri-nightclub-e11even-2025-06-07'
      // We derive scheduleId from the instance so clients can't tamper with it
      const derivedScheduleId = instanceId.replace(/-\d{4}-\d{2}-\d{2}$/, '');
      const entry = PRICE_MAP.get(derivedScheduleId);

      if (!entry) {
        return new Response(
          JSON.stringify({ error: `Unknown schedule: ${derivedScheduleId}. Booking rejected.` }),
          { status: 400 }
        );
      }

      // Enforce booking rules server-side
      if (entry.maxPerBooking && quantity > entry.maxPerBooking) {
        return new Response(
          JSON.stringify({
            error: `${entry.title} has a max of ${entry.maxPerBooking} per booking. Requested ${quantity}.`,
          }),
          { status: 400 }
        );
      }

      if (quantity < 1 || quantity > 20) {
        return new Response(
          JSON.stringify({ error: `Invalid quantity: ${quantity}` }),
          { status: 400 }
        );
      }

      const unitAmountCents = Math.round(entry.pricePerPerson * 100);

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: entry.title,
            description: `${quantity} spot${quantity > 1 ? 's' : ''} · ${instanceId.slice(-10)}`,
          },
          unit_amount: unitAmountCents,
        },
        quantity,
      });

      resolvedBookings.push({ cartItemId, instanceId, quantity, unitPrice: entry.pricePerPerson });
    }

    // ── Generic (legacy) items ────────────────────────────────────────────────
    // Tables, experiences, store items sent from old cart path.
    // These use client-supplied price since they have no PRICE_SCHEDULE entry.
    for (const gi of genericItems) {
      if (!gi.cartItemId || !gi.name || gi.quantity < 1) continue;
      const unitAmountCents = Math.round((gi.unitPrice || 0) * 100);
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: gi.name, description: 'Wingman Experience' },
          unit_amount: unitAmountCents,
        },
        quantity: gi.quantity,
      });
    }

    if (lineItems.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid bookings after validation' }), { status: 400 });
    }

    // ── Free booking bypass ───────────────────────────────────────────────────
    // Stripe cannot process $0 charges. If the entire order is free,
    // return a special free=true response so the client can confirm
    // the booking directly without going through Stripe.
    const totalCents = resolvedBookings.reduce((sum, b) => sum + b.unitPrice * b.quantity * 100, 0);
    if (totalCents === 0) {
      return new Response(
        JSON.stringify({
          free: true,
          confirmed: true,
          bookings: resolvedBookings,
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    let origin = 'https://wingman-app.netlify.app';
    try { origin = new URL(req.url).origin; } catch {
      origin = req.headers.get('origin') || origin;
    }

    // Store resolved booking metadata so verify-session can reconcile
    const cartContext = JSON.stringify(
      resolvedBookings.map(b => ({ id: b.cartItemId, inst: b.instanceId, q: b.quantity }))
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail || undefined,
      adaptive_pricing: { enabled: false },
      metadata: {
        userId: userId || '',
        // Store resolved bookings (not client prices) so webhooks can trust them
        cart_context: cartContext.length < 500 ? cartContext : '',
      },
      line_items: lineItems,
      success_url: successUrl || `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/?payment=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Checkout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
