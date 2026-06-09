<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WINGMAN — Miami

Luxury lifestyle & nightlife platform. React + Vite + TypeScript front end,
Supabase (auth + persistence), Stripe checkout, and Netlify Functions for the
server side.

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in your values.
3. Run the app: `npm run dev`

To exercise the Netlify functions (checkout, webhook, lead capture) locally,
use the Netlify CLI: `netlify dev`.

## Environment variables

See [`.env.example`](./.env.example) for the full list. Set the same keys in
**Netlify → Site settings → Environment variables** for production.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | client | Supabase auth |
| `STRIPE_API_KEY` | server | Stripe secret key (checkout + verify) |
| `STRIPE_WEBHOOK_SECRET` | server | Verifies Stripe webhook signatures |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | server | Service-role writes (bookings, leads) |
| `RESEND_API_KEY` / `RESEND_FROM` | server | Welcome email |
| `ALLOWED_ORIGINS` | server | Optional extra CORS origins (comma-separated) |

> The server-only keys (`STRIPE_*`, `SUPABASE_SERVICE_KEY`) must **never** be
> prefixed with `VITE_` — that would expose them to the browser.

## Database

Apply [`supabase/migrations/0001_persistence.sql`](./supabase/migrations/0001_persistence.sql)
in the Supabase SQL Editor (or `supabase db push`). It creates:

- `confirmed_bookings` — written by the `stripe-webhook` function on
  `checkout.session.completed` (durable source of truth for paid bookings).
- `passcode_leads` — written by the `capture-lead` function when a visitor
  enters the passcode gate.

Both tables have RLS enabled with **no public policies**, so they are readable
and writable only via the service-role key (server side). Read them from the
Supabase dashboard.

## Stripe webhook setup

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook`
3. Event: `checkout.session.completed`
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## Known follow-ups (not yet done)

- **Admin authorization is still client-side** (role on a mock user in
  `localStorage` + a default passcode in `utils/accessControl.ts`). This must be
  moved to a server-enforced check (Supabase `profiles.role` + RLS) before the
  admin surface can be trusted in production.
- Most app content (venues, events, users) is still seeded from
  `data/mockData.ts` rather than the database.
