/**
 * Centralized environment variable access.
 * Server-only secrets must not use NEXT_PUBLIC_ prefix.
 */

const DEFAULT_TENANT = 'a0000000-0000-4000-8000-000000000001';

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function looksLikePlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes('your-project') ||
    normalized.includes('your-anon') ||
    normalized.includes('your-service') ||
    normalized.includes('placeholder') ||
    normalized === 'your-anon-key' ||
    normalized === 'your-service-role-key'
  );
}

function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.supabase.co') &&
      !looksLikePlaceholder(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function isValidSupabaseKey(key: string): boolean {
  return key.startsWith('eyJ') && key.length > 100;
}

export function getSiteUrl(): string {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  );
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME ?? 'The Emerald Pour';
}

export function getSupportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'bookings@emeraldpour.com';
}

export function getDefaultTenantId(): string {
  return (
    process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ??
    process.env.DEFAULT_TENANT_ID ??
    DEFAULT_TENANT
  );
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return key;
}

export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return key;
}

export function getStripeWebhookSecret(): string {
  const key = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  return key;
}

export function getStripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

export function getOpenAiApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  return key;
}

export function isMapboxConfigured(): boolean {
  return Boolean(process.env.MAPBOX_ACCESS_TOKEN);
}

export function getMapboxToken(): string {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) throw new Error('MAPBOX_ACCESS_TOKEN is not set');
  return token;
}

export function getGooglePlaceId(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;
}

export function getGoogleReviewsUrl(): string {
  const placeId = getGooglePlaceId();
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${placeId}`;
  }
  return 'https://www.google.com/maps/search/The+Emerald+Pour+mobile+Irish+pub';
}

export function getMapboxOrigin(): { lat: number; lng: number } {
  return {
    lat: Number(process.env.MAPBOX_ORIGIN_LAT ?? '35.2271'),
    lng: Number(process.env.MAPBOX_ORIGIN_LNG ?? '-80.8431'),
  };
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) return false;
  if (looksLikePlaceholder(url) || looksLikePlaceholder(anonKey) || looksLikePlaceholder(serviceKey)) {
    return false;
  }

  return isValidSupabaseUrl(url) && isValidSupabaseKey(anonKey) && isValidSupabaseKey(serviceKey);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
