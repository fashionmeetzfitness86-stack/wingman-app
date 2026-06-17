import Stripe from 'stripe';
import { jsonResponse, preflight } from './_shared/cors';

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

// ─── Official Wingman Pricing ────────────────────────────────────────────────
// Restaurant: $450 per 2-person block  → Math.ceil(guests / 2) * 450
// Yacht:      $400 per person
// Nightclub:  $500 per person
// ─────────────────────────────────────────────────────────────────────────────
const RESTAURANT_BLOCK_PRICE = 450;
const RESTAURANT_BLOCK_SIZE  = 2;

const PRICE_SCHEDULE: ScheduleEntry[] = [
  // ── Monday ──
  { id: 'mon-dinner-nobu',           title: 'Wingman Dinner @ Nobu',          pricePerPerson: 450, maxPerBooking: 2 },
  // ── Tuesday ──
  { id: 'tue-nightclub-mr-jones',    title: 'Wingman @ Mr. Jones',            pricePerPerson: 500 },
  // ── Wednesday ──
  { id: 'wed-dinner-sexy-fish',      title: 'Wingman Dinner @ Sexy Fish',     pricePerPerson: 450, maxPerBooking: 2 },
  // ── Thursday ──
  { id: 'thu-nightclub-liv',         title: 'Wingman @ LIV',                  pricePerPerson: 500 },
  // ── Friday ──
  { id: 'fri-nightclub-e11even',     title: 'Wingman @ E11EVEN',              pricePerPerson: 500 },
  { id: 'fri-nightclub-mr-jones',    title: 'Wingman @ Mr. Jones',            pricePerPerson: 500 },
  { id: 'fri-yacht-biscayne',        title: 'Friday Yacht — Biscayne Bay',    pricePerPerson: 400 },
  // ── Saturday ──
  { id: 'sat-nightclub-story',       title: 'Wingman @ Story',                pricePerPerson: 500 },
  { id: 'sat-nightclub-mr-jones',    title: 'Wingman @ Mr. Jones',            pricePerPerson: 500 },
  { id: 'sat-yacht-miami-beach',     title: 'Saturday Yacht — Miami Beach',   pricePerPerson: 400 },
  // ── Sunday ──
  { id: 'sun-dinner-komodo',         title: 'Sunday Dinner @ Komodo',         pricePerPerson: 450, maxPerBooking: 2 },
  { id: 'sun-yacht-key-biscayne',    title: 'Sunday Yacht — Key Biscayne',    pricePerPerson: 400 },
];

// Build a lookup map for O(1) access
const PRICE_MAP = new Map<string, ScheduleEntry>(
  PRICE_SCHEDULE.map(e => [e.id, e])
);

// Resolve prices for generic items (store, experience, tables) server-side to prevent price spoofing.
function resolveGenericItemPrice(cartItemId: string, clientUnitPrice: number): number {
  const id = cartItemId.toLowerCase();
  
  if (id.startsWith('store-')) {
    const parts = cartItemId.split('-');
    const itemKey = parts[1]; // e.g. s1, s2
    const storePrices: Record<string, number> = {
      s1: 25,
      s2: 100,
      s3: 65,
      s4: 250,
      s5: 80,
      s6: 175,
    };
    const price = storePrices[itemKey];
    if (price !== undefined) {
      return price;
    }
    throw new Error(`Invalid store item ID in cart: ${cartItemId}`);
  }

  if (id.startsWith('experience-')) {
    const parts = id.split('-');
    const expId = parts[1];
    const validExps = ['1', '2', '3', '4'];
    if (validExps.includes(expId)) {
      return 600; // All mock experiences are $600 USD
    }
    throw new Error(`Invalid experience ID in cart: ${cartItemId}`);
  }

  if (id.startsWith('table-')) {
    // Deposit booking: client sends exactly $50
    if (Math.round(clientUnitPrice) === 50) {
      return 50;
    }

    // ── New format: table-<venueId>-<date>-<tableId>-exp<type>-guests<N>-<ts> ──
    // BookingFlow encodes experience type + guest count so we can price server-side.
    const expTypeMatch = id.match(/-exp(restaurant|nightclub|yacht)-/);
    const guestsMatch  = id.match(/-guests(\d+)-/);
    if (expTypeMatch && guestsMatch) {
      const expType   = expTypeMatch[1] as 'restaurant' | 'nightclub' | 'yacht';
      const guests    = Math.max(1, parseInt(guestsMatch[1], 10));
      if (expType === 'restaurant') {
        return Math.ceil(guests / RESTAURANT_BLOCK_SIZE) * RESTAURANT_BLOCK_PRICE;
      }
      if (expType === 'nightclub') {
        return guests * 500;
      }
      if (expType === 'yacht') {
        return guests * 400;
      }
    }

    // ── Legacy format: encoded only -guests<N>- (restaurant only) ──
    const legacyGuests = id.match(/-guests(\d+)(?:-|$)/);
    if (legacyGuests || id.includes('general-inquiry') || id.includes('restaurant')) {
      const guestCount = legacyGuests ? parseInt(legacyGuests[1], 10) : 2;
      return Math.ceil(Math.max(1, guestCount) / RESTAURANT_BLOCK_SIZE) * RESTAURANT_BLOCK_PRICE;
    }

    // Named VIP table options (nightclub min-spend tables)
    let minSpend = 0;
    if      (id.includes('-mj-t1-')) minSpend = 3000;
    else if (id.includes('-mj-t2-')) minSpend = 5000;
    else if (id.includes('-t1-'))    minSpend = 5000;
    else if (id.includes('-t2-'))    minSpend = 3000;
    else if (id.includes('-t3-'))    minSpend = 8000;
    else {
      // Unknown table — reject to prevent $0 bypass
      throw new Error(`Unrecognised table option in cart: ${cartItemId}`);
    }
    const TAX_SERVICE_RATE = 0.36;
    return minSpend * (1 + TAX_SERVICE_RATE);
  }

  throw new Error(`Unknown item type in cart: ${cartItemId}`);
}

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
  if (req.method === 'OPTIONS') return preflight(req);

  if (req.method !== 'POST') {
    return jsonResponse(req, { error: 'Method not allowed' }, 405);
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
      return jsonResponse(req, { error: 'No bookings provided' }, 400);
    }

    // ── Server-side price resolution ─────────────────────────────────────────
    // We NEVER use any price the client sent for scheduled events.
    // Generic (legacy) items use client price since they have no scheduleId.
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const resolvedBookings: { cartItemId: string; instanceId: string; quantity: number; unitPrice: number }[] = [];

    for (const booking of bookings) {
      const { scheduleId, instanceId, quantity, cartItemId } = booking;

      if (!scheduleId || !instanceId || !quantity || !cartItemId) {
        return jsonResponse(req, { error: `Invalid booking payload: missing required field` }, 400);
      }

      // Strip the date suffix to get the base schedule ID
      // Instance IDs look like: 'fri-nightclub-e11even-2025-06-07'
      // We derive scheduleId from the instance so clients can't tamper with it
      const derivedScheduleId = instanceId.replace(/-\d{4}-\d{2}-\d{2}$/, '');
      const entry = PRICE_MAP.get(derivedScheduleId);

      if (!entry) {
        return jsonResponse(req, { error: `Unknown schedule: ${derivedScheduleId}. Booking rejected.` }, 400);
      }

      // Enforce booking rules server-side
      if (entry.maxPerBooking && quantity > entry.maxPerBooking) {
        return jsonResponse(req, {
          error: `${entry.title} has a max of ${entry.maxPerBooking} per booking. Requested ${quantity}.`,
        }, 400);
      }

      if (quantity < 1 || quantity > 20) {
        return jsonResponse(req, { error: `Invalid quantity: ${quantity}` }, 400);
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
    // These now use server-resolved prices to prevent price spoofing.
    const resolvedGenericItems: { cartItemId: string; name: string; unitPrice: number; quantity: number }[] = [];
    for (const gi of genericItems) {
      if (!gi.cartItemId || !gi.name || gi.quantity < 1) continue;
      
      let resolvedUnitPrice: number;
      try {
        resolvedUnitPrice = resolveGenericItemPrice(gi.cartItemId, gi.unitPrice);
      } catch (err: any) {
        return jsonResponse(req, { error: err.message || 'Invalid item price' }, 400);
      }
      
      const unitAmountCents = Math.round(resolvedUnitPrice * 100);
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: gi.name, description: 'Wingman Experience' },
          unit_amount: unitAmountCents,
        },
        quantity: gi.quantity,
      });

      resolvedGenericItems.push({
        cartItemId: gi.cartItemId,
        name: gi.name,
        unitPrice: resolvedUnitPrice,
        quantity: gi.quantity,
      });
    }

    if (lineItems.length === 0) {
      return jsonResponse(req, { error: 'No valid bookings after validation' }, 400);
    }

    // ── Reject $0 orders ──────────────────────────────────────────────────────
    // Stripe cannot process $0 charges, and we deliberately do NOT offer a
    // client-trusted "free" bypass (it was previously exploitable — any client
    // could self-issue a `free-` session id). All live products are paid; a $0
    // total means a misconfigured price, so we reject rather than confirm.
    const subtotalCents =
      resolvedBookings.reduce((sum, b) => sum + b.unitPrice * b.quantity * 100, 0) +
      resolvedGenericItems.reduce((sum, gi) => sum + Math.round(gi.unitPrice * 100) * gi.quantity, 0);
    if (subtotalCents <= 0) {
      return jsonResponse(req, { error: 'Order total must be greater than zero.' }, 400);
    }

    let origin = 'https://wingman-app.netlify.app';
    try { origin = new URL(req.url).origin; } catch {
      origin = req.headers.get('origin') || origin;
    }

    // Store resolved booking metadata so verify-session can reconcile
    const cartContext = JSON.stringify([
      ...resolvedBookings.map(b => ({ id: b.cartItemId, inst: b.instanceId, q: b.quantity })),
      ...resolvedGenericItems.map(gi => ({ id: gi.cartItemId, inst: gi.name, q: gi.quantity })),
    ]);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // 'card' automatically enables Apple Pay + Google Pay on compatible devices
      // in Stripe Hosted Checkout — no extra configuration needed on the frontend.
      // 'cashapp' enables Cash App Pay for US customers.
      // Enable each method in Stripe Dashboard → Settings → Payment Methods.
      payment_method_types: ['card', 'cashapp'] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId || '',
        cart_context: cartContext.length < 500 ? cartContext : '',
      },
      line_items: lineItems,
      success_url: successUrl || `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/?payment=cancelled`,
    });

    return jsonResponse(req, { url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return jsonResponse(req, { error: error.message || 'Checkout failed' }, 500);
  }
};
