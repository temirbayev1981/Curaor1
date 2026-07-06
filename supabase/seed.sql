-- Development seed data for The Emerald Pour
-- Run: supabase db reset (applies migrations + seed)

-- Sample inventory
INSERT INTO inventory_items (tenant_id, name, sku, category, quantity, unit_cost, unit_price, reorder_level) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Guinness Draft Keg', 'BEER-001', 'beer', 12, 85.00, 150.00, 4),
  ('a0000000-0000-4000-8000-000000000001', 'Jameson Irish Whiskey', 'SPIR-001', 'spirits', 8, 28.00, 55.00, 3),
  ('a0000000-0000-4000-8000-000000000001', 'Irish Flag Bunting', 'DECO-001', 'decor', 50, 2.50, 8.00, 10),
  ('a0000000-0000-4000-8000-000000000001', 'Portable Bar Unit', 'EQUIP-001', 'equipment', 3, 500.00, 0.00, 1),
  ('a0000000-0000-4000-8000-000000000001', 'Plastic Pint Glasses (50pk)', 'SUPP-001', 'supplies', 100, 8.00, 0.00, 20)
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- Sample customers (no user_id — link after auth signup)
INSERT INTO customers (id, tenant_id, email, full_name, phone) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'sarah.wedding@example.com', 'Sarah Mitchell', '+17045550101'),
  ('c1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'corp@techcorp.com', 'Mike Johnson', '+17045550102')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Sample bookings
INSERT INTO bookings (
  id, tenant_id, customer_id, booking_start, booking_end, status, event_type,
  guest_count, venue_address, venue_city, venue_state, delivery_distance_miles,
  delivery_cost, subtotal, deposit_percent, deposit_amount, balance_due
) VALUES
  (
    'b1000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    '2026-09-15 18:00:00+00', '2026-09-15 23:00:00+00',
    'deposit_paid', 'wedding', 120,
    '1000 Wedding Lane', 'Charlotte', 'NC', 15.0,
    37.50, 1537.50, 25, 384.38, 1153.12
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000002',
    '2026-10-20 17:00:00+00', '2026-10-20 21:00:00+00',
    'pending', 'corporate', 80,
    '500 Business Park Dr', 'Raleigh', 'NC', 120.0,
    300.00, 1800.00, 50, 900.00, 900.00
  )
ON CONFLICT DO NOTHING;

-- Note: Create auth users via Supabase Dashboard or scripts/bootstrap-dev.ts
-- Then insert tenant_users:
-- INSERT INTO tenant_users (tenant_id, user_id, role) VALUES
--   ('a0000000-0000-4000-8000-000000000001', '<owner-uuid>', 'owner'),
--   ('a0000000-0000-4000-8000-000000000001', '<customer-uuid>', 'customer');
