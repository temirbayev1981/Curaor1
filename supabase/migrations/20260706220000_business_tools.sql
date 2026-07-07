-- Staff scheduling, procurement, and business tooling

CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'bartender',
  hourly_rate NUMERIC(8,2) NOT NULL DEFAULT 18.00 CHECK (hourly_rate >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_members_tenant ON staff_members(tenant_id);

CREATE TABLE staff_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  shift_start TIMESTAMPTZ NOT NULL,
  shift_end TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT staff_shift_time_valid CHECK (shift_end > shift_start)
);

CREATE INDEX idx_staff_shifts_tenant ON staff_shifts(tenant_id);
CREATE INDEX idx_staff_shifts_member ON staff_shifts(staff_member_id);
CREATE INDEX idx_staff_shifts_booking ON staff_shifts(booking_id);

CREATE TYPE purchase_order_status AS ENUM ('draft', 'ordered', 'received');

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status purchase_order_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchase_orders_tenant ON purchase_orders(tenant_id);
CREATE INDEX idx_purchase_orders_booking ON purchase_orders(booking_id);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchase_order_items_order ON purchase_order_items(purchase_order_id);

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_members_staff ON staff_members FOR ALL
  USING (tenant_id = public.user_tenant_id() AND public.user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY staff_shifts_staff ON staff_shifts FOR ALL
  USING (tenant_id = public.user_tenant_id() AND public.user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY purchase_orders_staff ON purchase_orders FOR ALL
  USING (tenant_id = public.user_tenant_id() AND public.user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY purchase_order_items_staff ON purchase_order_items FOR ALL
  USING (
    purchase_order_id IN (
      SELECT id FROM purchase_orders
      WHERE tenant_id = public.user_tenant_id()
        AND public.user_role() IN ('owner', 'admin', 'staff')
    )
  );
