import { getMapboxOrigin, getMapboxToken } from '@/lib/config/env';

export interface DistanceResult {
  distanceMiles: number;
  durationMinutes: number;
}

export async function calculateDistance(
  destinationAddress: string
): Promise<DistanceResult> {
  const token = getMapboxToken();
  const { lat, lng } = getMapboxOrigin();

  const encoded = encodeURIComponent(destinationAddress);
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lng},${lat};${encoded}?access_token=${token}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to calculate distance');
  }

  const data = (await response.json()) as {
    routes: Array<{ distance: number; duration: number }>;
  };

  const route = data.routes[0];
  if (!route) throw new Error('No route found');

  return {
    distanceMiles: Math.round((route.distance / 1609.34) * 100) / 100,
    durationMinutes: Math.round(route.duration / 60),
  };
}
