# API Reference

Base URL: `https://emeraldpour.com` (production) or `http://localhost:3000` (dev)

All API responses follow: `{ data, error, meta: { timestamp, requestId } }`

## Public

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/bookings` | Create booking request |
| GET | `/api/gallery?tenantId=` | Public gallery assets |
| GET | `/api/health` | Health check |

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Customer registration |
| POST | `/api/auth/link-customer` | Link bookings to user on login |

## Portal (authenticated customer)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portal/bookings` | List customer bookings |
| PATCH | `/api/portal/bookings/[id]/dates` | Change event dates |
| GET | `/api/portal/invoices/[bookingId]` | Download invoice HTML |
| POST | `/api/portal/contracts/[bookingId]` | Sign contract |
| POST | `/api/payments/checkout` | Stripe checkout session |

## Admin (staff RBAC)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/bookings` | List all bookings |
| PATCH | `/api/admin/bookings/[id]/status` | Transition booking status |
| GET/PATCH | `/api/admin/settings` | Tenant settings |
| GET | `/api/admin/audit` | Audit log |
| GET | `/api/admin/seo-articles` | SEO articles |
| POST | `/api/admin/seo-articles/[id]/approve` | Approve article |
| POST | `/api/admin/seo-articles/[id]/reject` | Reject article |
| GET/POST | `/api/media` | Media library |

## System

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/stripe` | Stripe webhook |
| POST | `/api/ai/generate-article` | AI SEO generation (staff) |
