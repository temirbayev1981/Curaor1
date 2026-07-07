-- SEO tenant scoping + updated_at triggers for business tools tables

DROP POLICY IF EXISTS seo_public_read ON seo_articles;

CREATE POLICY seo_public_read ON seo_articles FOR SELECT
  USING (
    status = 'published'
    AND tenant_id = 'a0000000-0000-4000-8000-000000000001'::uuid
  );

CREATE TRIGGER staff_members_updated_at BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER staff_shifts_updated_at BEFORE UPDATE ON staff_shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
