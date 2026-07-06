# The Emerald Pour — Multi-Tenant SaaS Platform

Production-ready commercial SaaS platform for **The Emerald Pour**, a mobile Irish pub catering service across North and South Carolina.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Public Zone          Auth Zone           Admin Zone        │
│  Landing (SSR/SSG)    Customer Portal     Dashboard (CSR)   │
│  SEO Location Pages   Login/Stripe        Media / AI / RBAC │
└──────────────┬──────────────────┬──────────────┬────────────┘
               │                  │              │
         ┌─────▼──────────────────▼──────────────▼─────┐
         │           API Contract Layer                 │
         │     { data, error, meta: { requestId } }     │
         └─────┬──────────────────┬──────────────┬─────┘
               │                  │              │
         ┌─────▼─────┐    ┌──────▼──────┐  ┌────▼─────┐
         │  Domain   │    │  Event Bus  │  │ Supabase │
         │ Services  │───▶│  (v1 audit) │  │ RLS + DB │
         └───────────┘    └──────┬──────┘  └──────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Edge Functions        │
                    │ Telegram / Email / Cal  │
                    └─────────────────────────┘
```

## Features

- **Multi-Tenancy** — Hard `tenant_id` isolation with PostgreSQL RLS
- **i18n** — Full English/Russian localization with `/en/` and `/ru/` routes
- **Booking Engine** — EXCLUDE constraint prevents double-booking
- **Payments** — Stripe Checkout (25/50/100% deposits)
- **Event Bus** — Immutable versioned events with idempotent consumers
- **Admin Dashboard** — Dark-themed UI with Net Profit, ROI, COGS, LTV, Conversion widgets
- **Media Library** — Drag-and-drop manager with folders, tags, lazy loading
- **AI Assistant** — OpenAI-powered SEO article generation (sanitized, rate-limited, approval required)
- **Programmatic SEO** — Dynamic pages for 9 Carolina cities with JSON-LD LocalBusiness schema
- **Edge Integrations** — Telegram, Resend email, Google Calendar, Mapbox distance

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Payments | Stripe Checkout |
| i18n | react-i18next |
| Validation | Zod |
| Testing | Vitest |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in Supabase, Stripe, OpenAI, and Mapbox credentials

# Run database migrations (requires Supabase CLI)
npx supabase db push

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Security Zones

| Zone | Routes | Access |
|------|--------|--------|
| Public | `/en`, `/ru`, `/locations` | Open |
| Auth | `/portal`, `/login` | Authenticated customers |
| Admin | `/admin/*` | RBAC (owner/admin/staff) |
| System | `/api/webhooks`, Edge Functions | Service keys |

## Configuration Hierarchy

Runtime config resolves in priority order:
1. System defaults
2. Tenant settings (`tenants.settings`)
3. Admin overrides (`tenants.admin_overrides`)
4. Runtime overrides

## API Contract

All API responses follow:

```json
{
  "data": "<T | null>",
  "error": { "code": "string", "message": "string" } | null,
  "meta": { "timestamp": "ISO8601", "requestId": "uuid" }
}
```

## License

Proprietary — The Emerald Pour © 2026
