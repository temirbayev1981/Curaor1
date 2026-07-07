-- Second demo tenant + custom domain support

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

INSERT INTO tenants (id, slug, name, settings, is_active) VALUES (
  'b0000000-0000-4000-8000-000000000002',
  'shamrock-mobile',
  'Shamrock Mobile Bar',
  '{
    "price_per_mile": 2.00,
    "default_deposit_percent": 50,
    "base_event_price": 1200,
    "currency": "USD",
    "timezone": "America/New_York",
    "notification_email": "bookings@shamrockmobile.com",
    "telegram_chat_id": null
  }'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;
