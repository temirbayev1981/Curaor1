import { getMapboxToken } from '@/lib/config/env';

export interface AddressSuggestion {
  id: string;
  placeName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

/** Carolinas bounding box: west, south, east, north */
const CAROLINAS_BBOX = '-84.5,31.5,-78.0,36.6';

export async function suggestAddresses(query: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return [];

  const token = getMapboxToken();
  const encoded = encodeURIComponent(query.trim());
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
    `?country=us&types=address,place&bbox=${CAROLINAS_BBOX}&limit=5&access_token=${token}`;

  const response = await fetch(url);
  if (!response.ok) return [];

  const data = (await response.json()) as {
    features: Array<{
      id: string;
      place_name: string;
      text: string;
      address?: string;
      context?: Array<{ id: string; text: string; short_code?: string }>;
    }>;
  };

  return (data.features ?? []).map((feature) => {
    const ctx = feature.context ?? [];
    const city =
      ctx.find((c) => c.id.startsWith('place.'))?.text ??
      ctx.find((c) => c.id.startsWith('locality.'))?.text ??
      '';
    const region = ctx.find((c) => c.id.startsWith('region.'));
    const state = region?.short_code?.replace('US-', '') ?? region?.text ?? '';
    const zip = ctx.find((c) => c.id.startsWith('postcode.'))?.text ?? '';
    const address = feature.address
      ? `${feature.address} ${feature.text}`
      : feature.text;

    return {
      id: feature.id,
      placeName: feature.place_name,
      address,
      city,
      state,
      zip,
    };
  });
}
