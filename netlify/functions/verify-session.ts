import Stripe from 'stripe';
import { jsonResponse, preflight } from './_shared/cors';

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);

  try {
    const apiKey = process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY;
    if (!apiKey) {
      throw new Error('Stripe secret key missing. Set STRIPE_API_KEY (or STRIPE_SECRET_KEY) in Netlify and redeploy.');
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId) {
      return jsonResponse(req, { error: 'session_id required' }, 400);
    }

    // NOTE: there is intentionally NO "free-" bypass here. Payment status is
    // only ever derived from a real Stripe session, so a client cannot
    // self-issue a session id and have it treated as paid.
    const stripe = new Stripe(apiKey, { apiVersion: '2026-02-25.clover' as any });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return jsonResponse(req, {
      paid: session.payment_status === 'paid',
      status: session.status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email,
      cartContext: session.metadata?.cart_context || '',
    });
  } catch (error: any) {
    console.error('Verify session error:', error);
    return jsonResponse(req, { error: error.message || 'Verification failed', paid: false }, 500);
  }
};
