import { getMapboxOrigin, getMapboxToken } from '@/lib/config/env';
import { geocodeAddress } from '@/domain/maps/geocode.service';

export interface DistanceResult {
  distanceMiles: number;
  durationMinutes: number;
}

export interface RouteDistanceResult extends DistanceResult {
  originAddress: string;
  destinationAddress: string;
}

export async function calculateDistance(
  destinationAddress: string
): Promise<DistanceResult> {
  const { lat, lng } = getMapboxOrigin();
  return calculateDistanceFromCoords(lng, lat, destinationAddress);
}

export async function calculateDistanceBetween(
  originAddress: string,
  destinationAddress: string
): Promise<RouteDistanceResult> {
  const [origin, destination] = await Promise.all([
    geocodeAddress(originAddress),
    geocodeAddress(destinationAddress),
  ]);

  if (!origin) throw new Error('Could not geocode origin address');
  if (!destination) throw new Error('Could not geocode destination address');

  const result = await fetchDirections(
    origin.lng,
    origin.lat,
    destination.lng,
    destination.lat
  );

  return {
    ...result,
    originAddress,
    destinationAddress,
  };
}

async function calculateDistanceFromCoords(
  originLng: number,
  originLat: number,
  destinationAddress: string
): Promise<DistanceResult> {
  const destination = await geocodeAddress(destinationAddress);
  if (!destination) throw new Error('Could not geocode destination address');
  return fetchDirections(originLng, originLat, destination.lng, destination.lat);
}

async function fetchDirections(
  originLng: number,
  originLat: number,
  destLng: number,
  destLat: number
): Promise<DistanceResult> {
  const token = getMapboxToken();
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/` +
    `${originLng},${originLat};${destLng},${destLat}?access_token=${token}`;

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
