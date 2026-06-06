import Stripe from 'stripe';

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  }

  try {
    const apiKey = process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY;
    if (!apiKey) {
      throw new Error('Stripe secret key missing. Set STRIPE_API_KEY (or STRIPE_SECRET_KEY) in Netlify and redeploy.');
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'session_id required' }), { status: 400 });
    }

    // ── Free booking bypass ───────────────────────────────────────────────────
    // session_ids prefixed with 'free-' are generated locally for $0 bookings
    // that bypassed Stripe. No Stripe call needed — they are always considered paid.
    if (sessionId.startsWith('free-')) {
      return new Response(
        JSON.stringify({ paid: true, status: 'complete', amountTotal: 0, currency: 'usd', customerEmail: '', cartContext: '' }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const stripe = new Stripe(apiKey, { apiVersion: '2026-02-25.clover' as any });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return new Response(
      JSON.stringify({
        paid: session.payment_status === 'paid',
        status: session.status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email,
        cartContext: session.metadata?.cart_context || '',
      }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error: any) {
    console.error('Verify session error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Verification failed', paid: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
