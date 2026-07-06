-- The Emerald Pour — Multi-Tenant SaaS Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================
-- TENANTS & USERS
-- ============================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  admin_overrides JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);

-- ============================================================
-- BOOKINGS (with double-booking protection)
-- ============================================================
CREATE TYPE booking_status AS ENUM (
  'pending',
  'deposit_paid',
  'confirmed',
  'completed',
  'cancelled'
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  booking_start TIMESTAMPTZ NOT NULL,
  booking_end TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  event_type TEXT NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  venue_address TEXT NOT NULL,
  venue_city TEXT NOT NULL,
  venue_state TEXT NOT NULL DEFAULT 'NC',
  venue_zip TEXT,
  delivery_distance_miles NUMERIC(8,2),
  delivery_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL,
  deposit_percent INTEGER NOT NULL DEFAULT 25 CHECK (deposit_percent IN (25, 50, 100)),
  deposit_amount NUMERIC(10,2) NOT NULL,
  balance_due NUMERIC(10,2) NOT NULL,
  notes TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_time_valid CHECK (booking_end > booking_start),
  EXCLUDE USING gist (
    tenant_id WITH =,
    tsrange(booking_start, booking_end) WITH &&
  ) WHERE (status NOT IN ('cancelled'))
);

CREATE INDEX idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(tenant_id, status);
CREATE INDEX idx_bookings_calendar ON bookings USING gist (tenant_id, tsrange(booking_start, booking_end));

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE payment_type AS ENUM ('deposit', 'balance', 'full');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  payment_type payment_type NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, sku)
);

CREATE INDEX idx_inventory_tenant_id ON inventory_items(tenant_id);

-- ============================================================
-- MEDIA LIBRARY
-- ============================================================
CREATE TABLE media_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  thumbnail_path TEXT,
  webp_path TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_assets_tenant_id ON media_assets(tenant_id);
CREATE INDEX idx_media_folders_tenant_id ON media_folders(tenant_id);

-- ============================================================
-- CONTRACTS
-- ============================================================
CREATE TYPE contract_status AS ENUM ('draft', 'sent', 'signed', 'void');

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  signature_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);

-- ============================================================
-- EVENT BUS (immutable, versioned audit log)
-- ============================================================
CREATE TABLE domain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_version TEXT NOT NULL DEFAULT 'v1',
  aggregate_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key TEXT NOT NULL,
  processed_by TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX idx_domain_events_tenant_id ON domain_events(tenant_id);
CREATE INDEX idx_domain_events_type ON domain_events(tenant_id, event_type);
CREATE INDEX idx_domain_events_aggregate ON domain_events(aggregate_id);

-- ============================================================
-- SEO ARTICLES (AI-generated, approval required)
-- ============================================================
CREATE TYPE article_status AS ENUM ('draft', 'pending_approval', 'published', 'rejected');

CREATE TABLE seo_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'ru')),
  city_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  status article_status NOT NULL DEFAULT 'draft',
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, locale, slug)
);

CREATE INDEX idx_seo_articles_tenant_id ON seo_articles(tenant_id);

-- ============================================================
-- AUDIT LOGS (eventual consistency)
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- ============================================================
-- RATE LIMITING
-- ============================================================
CREATE TABLE rate_limit_buckets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket_key TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bucket_key)
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER inventory_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER seo_articles_updated_at BEFORE UPDATE ON seo_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- HELPER: get user's tenant_id
-- ============================================================
CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM tenant_users
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM tenant_users
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenants: users see their own tenant
CREATE POLICY tenants_select ON tenants FOR SELECT
  USING (id = auth.user_tenant_id());

-- Tenant users: see members of own tenant
CREATE POLICY tenant_users_select ON tenant_users FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY tenant_users_admin ON tenant_users FOR ALL
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin'));

-- Customers: staff+ see all, customers see own
CREATE POLICY customers_staff_select ON customers FOR SELECT
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY customers_self_select ON customers FOR SELECT
  USING (tenant_id = auth.user_tenant_id() AND user_id = auth.uid());

CREATE POLICY customers_staff_write ON customers FOR ALL
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

-- Bookings: staff+ full access, customers see own
CREATE POLICY bookings_staff ON bookings FOR ALL
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY bookings_customer_select ON bookings FOR SELECT
  USING (
    tenant_id = auth.user_tenant_id()
    AND customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY bookings_customer_update ON bookings FOR UPDATE
  USING (
    tenant_id = auth.user_tenant_id()
    AND customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    AND status IN ('pending', 'deposit_paid')
  );

-- Payments
CREATE POLICY payments_staff ON payments FOR ALL
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY payments_customer_select ON payments FOR SELECT
  USING (
    tenant_id = auth.user_tenant_id()
    AND booking_id IN (
      SELECT b.id FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

-- Inventory: staff+ only
CREATE POLICY inventory_staff ON inventory_items FOR ALL
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

-- Media: staff+ manage, public read via signed URLs (service role)
CREATE POLICY media_staff ON media_assets FOR ALL
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY media_folders_staff ON media_folders FOR ALL
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

-- Contracts
CREATE POLICY contracts_staff ON contracts FOR ALL
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY contracts_customer ON contracts FOR SELECT
  USING (
    tenant_id = auth.user_tenant_id()
    AND booking_id IN (
      SELECT b.id FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

-- Domain events: staff read
CREATE POLICY events_staff_select ON domain_events FOR SELECT
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

-- SEO articles: public read published, staff manage
CREATE POLICY seo_public_read ON seo_articles FOR SELECT
  USING (status = 'published');

CREATE POLICY seo_staff ON seo_articles FOR ALL
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin', 'staff'));

-- Audit logs: admin read
CREATE POLICY audit_admin ON audit_logs FOR SELECT
  USING (tenant_id = auth.user_tenant_id() AND auth.user_role() IN ('owner', 'admin'));

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('media', 'media', false, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']),
  ('contracts', 'contracts', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY media_tenant_upload ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY media_tenant_select ON storage.objects FOR SELECT
  USING (bucket_id = 'media' AND auth.user_tenant_id() IS NOT NULL);

CREATE POLICY contracts_tenant ON storage.objects FOR ALL
  USING (bucket_id = 'contracts' AND auth.user_tenant_id() IS NOT NULL);

-- ============================================================
-- SEED: Default tenant
-- ============================================================
INSERT INTO tenants (id, slug, name, settings) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'emerald-pour',
  'The Emerald Pour',
  '{
    "price_per_mile": 2.50,
    "default_deposit_percent": 25,
    "base_event_price": 1500,
    "currency": "USD",
    "timezone": "America/New_York",
    "notification_email": "bookings@emeraldpour.com",
    "telegram_chat_id": null
  }'::jsonb
);
