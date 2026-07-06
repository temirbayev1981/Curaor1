export type BookingStatus =
  | 'pending'
  | 'deposit_paid'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentType = 'deposit' | 'balance' | 'full';
export type UserRole = 'owner' | 'admin' | 'staff' | 'customer';
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'void';
export type ArticleStatus = 'draft' | 'pending_approval' | 'published' | 'rejected';
export type Locale = 'en' | 'ru';

export interface TenantSettings {
  price_per_mile: number;
  default_deposit_percent: 25 | 50 | 100;
  base_event_price: number;
  currency: string;
  timezone: string;
  notification_email: string;
  telegram_chat_id: string | null;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  settings: TenantSettings;
  admin_overrides: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  tenant_id: string;
  customer_id: string;
  booking_start: string;
  booking_end: string;
  status: BookingStatus;
  event_type: string;
  guest_count: number;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_zip: string | null;
  delivery_distance_miles: number | null;
  delivery_cost: number;
  subtotal: number;
  deposit_percent: 25 | 50 | 100;
  deposit_amount: number;
  balance_due: number;
  notes: string | null;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  booking_id: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  amount: number;
  payment_type: PaymentType;
  status: PaymentStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  tenant_id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  tenant_id: string;
  folder_id: string | null;
  storage_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  webp_path: string | null;
  tags: string[];
  alt_text: string | null;
  created_at: string;
}

export interface MediaFolder {
  id: string;
  tenant_id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
}

export interface Contract {
  id: string;
  tenant_id: string;
  booking_id: string;
  storage_path: string;
  status: ContractStatus;
  signed_at: string | null;
  signature_data: Record<string, unknown> | null;
  created_at: string;
}

export interface DomainEvent {
  id: string;
  tenant_id: string;
  event_type: string;
  event_version: string;
  aggregate_id: string;
  aggregate_type: string;
  payload: Record<string, unknown>;
  idempotency_key: string;
  processed_by: string[];
  created_at: string;
}

export interface SeoArticle {
  id: string;
  tenant_id: string;
  locale: Locale;
  city_slug: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  status: ArticleStatus;
  ai_generated: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface RateLimitBucket {
  id: string;
  bucket_key: string;
  request_count: number;
  window_start: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      tenants: TableDef<Tenant>;
      customers: TableDef<
        Customer,
        Pick<Customer, 'tenant_id' | 'email' | 'full_name'> &
          Partial<Pick<Customer, 'user_id' | 'phone' | 'metadata'>>
      >;
      bookings: TableDef<Booking>;
      payments: TableDef<Payment>;
      inventory_items: TableDef<InventoryItem>;
      media_assets: TableDef<MediaAsset>;
      media_folders: TableDef<MediaFolder>;
      contracts: TableDef<Contract>;
      domain_events: TableDef<DomainEvent>;
      seo_articles: TableDef<SeoArticle>;
      audit_logs: TableDef<AuditLog>;
      rate_limit_buckets: TableDef<
        RateLimitBucket,
        Pick<RateLimitBucket, 'bucket_key'> &
          Partial<Pick<RateLimitBucket, 'request_count' | 'window_start'>>
      >;
      tenant_users: TableDef<
        TenantUser,
        Pick<TenantUser, 'tenant_id' | 'user_id' | 'role'>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
