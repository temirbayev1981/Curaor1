# The Emerald Pour — Setup Guide

## Prerequisites

- Node.js 20+
- npm
- [Supabase account](https://supabase.com) (free tier works)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for migrations)

---

## Step 1: Clone & Install

```bash
git clone https://github.com/temirbayev1981/Curaor1.git
cd Curaor1
git checkout cursor/emerald-pour-saas-platform-5239
npm install
```

## Step 2: Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

**Required (Supabase)** — from **Dashboard → Settings → API**:

| Variable | Where to find |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (keep secret!) |

**Recommended (app config)**:

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URLs, sitemap, Stripe redirects |
| `NEXT_PUBLIC_APP_NAME` | `The Emerald Pour` | Branding |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `bookings@emeraldpour.com` | Notifications default |
| `NEXT_PUBLIC_DEFAULT_TENANT_ID` | seed tenant UUID | Multi-tenant default |

Optional (for full features):

| Variable | Service |
|----------|---------|
| `STRIPE_SECRET_KEY` | Payments |
| `STRIPE_WEBHOOK_SECRET` | Payment webhooks |
| `OPENAI_API_KEY` | AI SEO articles |
| `MAPBOX_ACCESS_TOKEN` | Delivery distance |
| `MAPBOX_ORIGIN_LAT` / `MAPBOX_ORIGIN_LNG` | Distance origin (default: Charlotte, NC) |

## Step 3: Database Setup

### Option A: Supabase Cloud (recommended)

```bash
# Link to your project
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply schema + seed data
npx supabase db push
# Or full reset with seed:
npx supabase db reset --linked
```

### Option B: Run migrations manually

Copy contents of `supabase/migrations/20260101000000_initial_schema.sql` into Supabase SQL Editor and run it. Then run `supabase/seed.sql`.

## Step 4: Create Dev Users

```bash
# Reads .env.local automatically
npm run bootstrap
```

This creates:

| Email | Password | Role | URL |
|-------|----------|------|-----|
| `owner@emeraldpour.com` | `DevPassword123!` | owner | `/en/admin` |
| `customer@example.com` | `DevPassword123!` | customer | `/en/portal` |

## Step 5: Start Dev Server

```bash
npm run dev
```

Open **http://localhost:3000** — redirects to `/en`.

---

## Verify Everything Works

```bash
npm test          # unit tests
npm run typecheck # TypeScript
npm run lint      # ESLint
npm run build     # production build
```

### Manual smoke test

1. **Landing** — http://localhost:3000/en
2. **Book event** — http://localhost:3000/en/book (works without login)
3. **Login as customer** — http://localhost:3000/en/login → see bookings in portal
4. **Login as owner** — http://localhost:3000/en/admin → dashboard, bookings, settings
5. **Gallery** — http://localhost:3000/en/gallery

---

## Stripe Setup (Payments)

1. Create account at [stripe.com](https://stripe.com)
2. Use test mode keys in `.env.local`
3. For webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

---

## Edge Functions (Notifications)

Deploy to Supabase:

```bash
npx supabase functions deploy notify-telegram
npx supabase functions deploy send-email
npx supabase functions deploy send-sms
npx supabase functions deploy sync-calendar
npx supabase functions deploy calculate-distance
npx supabase functions deploy process-media
```

Set secrets in Supabase Dashboard → Edge Functions → Secrets.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Portal shows no bookings | Login with `customer@example.com` or run bootstrap script |
| Admin redirects to portal | User needs `owner`/`admin`/`staff` role in `tenant_users` |
| Build fails on env vars | Ensure `.env.local` exists with placeholder values |
| Double booking error | Time slot taken — pick different date/time |
| Rate limit on booking | Wait 1 minute (3 bookings/min per IP) |

---

## Production Deployment (Vercel)

Production URL: **https://curaor1.vercel.app**

1. Push branch to GitHub and import repo in [Vercel](https://vercel.com)
2. In **Vercel → Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://curaor1.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key (starts with `eyJ...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (starts with `eyJ...`, keep secret!) |

**Important:** Do not use placeholder values like `your-project.supabase.co` or `your-anon-key`.  
`SUPABASE_SERVICE_ROLE_KEY` must be the full JWT from Supabase — not a short password.

3. In **Supabase Dashboard → Authentication → URL Configuration**:
   - Site URL: `https://curaor1.vercel.app`
   - Redirect URLs: `https://curaor1.vercel.app/**`

4. Redeploy after changing environment variables (required for `NEXT_PUBLIC_*`).

Check deployment: `GET https://curaor1.vercel.app/api/health` — `supabase: true` means keys are valid.

---

## Custom domain: emeraldpour.com

If `https://emeraldpour.com/en` shows a GoDaddy **404 Page Not Found** instead of the Next.js app, the domain still points to **GoDaddy Website Builder**, not Vercel.

### Verify

```bash
# GoDaddy (wrong for this app):
curl -sI https://emeraldpour.com/en | grep Server
# → Server: DPS/2.0.0  (GoDaddy)

# Vercel (correct):
curl -sI https://curaor1.vercel.app/en | grep -i server
# → server: Vercel
```

### Fix: point domain to Vercel

1. **Vercel** → your project → **Settings → Domains** → Add `emeraldpour.com` and `www.emeraldpour.com`
2. **GoDaddy** → DNS for `emeraldpour.com`:
   - Remove A records pointing to GoDaddy Website Builder
   - Add Vercel records (as shown in Vercel Domains tab), typically:
     - `A` `@` → `76.76.21.21`
     - `CNAME` `www` → `cname.vercel-dns.com`
3. In **GoDaddy** → Websites: disconnect or unpublish the old Website Builder site
4. Update env on Vercel:
   - `NEXT_PUBLIC_SITE_URL=https://emeraldpour.com`
5. **Supabase Auth** redirect URLs: `https://emeraldpour.com/**`
6. Redeploy and wait for DNS propagation (up to 48h, often minutes)

Working app until DNS propagates: **https://curaor1.vercel.app/en**

---

## Production Deployment (general)

Recommended: [Vercel](https://vercel.com)

1. Push branch to GitHub
2. Import repo in Vercel
3. Add all env vars from `.env.example`
4. Deploy

Set `NEXT_PUBLIC_SUPABASE_URL` and keys to production Supabase project.
