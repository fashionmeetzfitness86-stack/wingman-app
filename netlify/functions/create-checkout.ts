import Stripe from 'stripe';

interface CartItemPayload {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  image?: string;
}

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
    if (!process.env.STRIPE_API_KEY) {
      throw new Error('STRIPE_API_KEY missing in Netlify environment variables.');
    }

    const stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: '2026-02-25.clover' as any });

    const body = await req.json();
    const { items, userEmail, userId, successUrl, cancelUrl } = body as {
      items: CartItemPayload[];
      userEmail?: string;
      userId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items provided' }), { status: 400 });
    }

    let origin = 'https://wingman-app.com';
    try { origin = new URL(req.url).origin; } catch { origin = req.headers.get('origin') || origin; }

    const lineItems = items
      .filter(item => item && item.amount > 0)
      .map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(item.amount * 100),
        },
        quantity: item.quantity || 1,
      }));

    if (lineItems.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid line items' }), { status: 400 });
    }

    const cartContext = JSON.stringify(items.map(i => ({ id: i.id, q: i.quantity || 1 })));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId || '',
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
