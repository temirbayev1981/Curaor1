# Architecture

## Zones

| Zone | Routes | Auth |
|------|--------|------|
| Public | `/[locale]`, `/book`, `/gallery`, `/locations` | None |
| Auth | `/login`, `/signup`, `/reset-password` | Optional |
| Portal | `/portal` | Customer (Supabase) |
| Admin | `/admin/*` | Staff RBAC |
| System | `/api/*` | Per-route |

## Multi-Tenancy

- `tenant_id` on all domain tables with PostgreSQL RLS
- Default tenant: `a0000000-0000-4000-8000-000000000001`
- `tenant_users` maps auth users to roles: `owner`, `admin`, `staff`, `customer`

## Event Bus

Domain services publish versioned events via `eventBus.publish()`:

- `booking.created.v1` → Telegram, email, SMS
- `booking.status_changed.v1` → Google Calendar sync
- `payment.succeeded.v1` → Telegram, email, SMS
- `article.published.v1` → (extensible)

Consumers in `src/domain/events/register-consumers.ts` forward to Supabase Edge Functions.

## Security

- IDOR protection via `verifyBookingOwnership()` on portal APIs
- Admin APIs use `requireStaff()` / `requireRole()`
- Middleware: locale routing, admin/portal guards, safe redirect validation
- Stripe webhooks verified with signing secret

## i18n

- Locales: `en`, `ru`
- JSON files in `src/lib/i18n/locales/`
- Middleware sets locale cookie; `I18nProvider` wraps `[locale]` routes
