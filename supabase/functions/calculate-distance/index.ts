import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const MAPBOX_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');
const ORIGIN_LAT = 35.2271;
const ORIGIN_LNG = -80.8431;

interface DistanceRequest {
  destinationAddress: string;
  pricePerMile: number;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!MAPBOX_TOKEN) {
    return new Response(JSON.stringify({ error: 'Mapbox not configured' }), {
      status: 503,
    });
  }

  const body = (await req.json()) as DistanceRequest;
  const encoded = encodeURIComponent(body.destinationAddress);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

  const geoResponse = await fetch(url);
  const geoData = (await geoResponse.json()) as {
    features: Array<{ center: [number, number] }>;
  };

  const feature = geoData.features[0];
  if (!feature) {
    return new Response(JSON.stringify({ error: 'Address not found' }), { status: 404 });
  }

  const [destLng, destLat] = feature.center;
  const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${ORIGIN_LNG},${ORIGIN_LAT};${destLng},${destLat}?access_token=${MAPBOX_TOKEN}`;

  const dirResponse = await fetch(directionsUrl);
  const dirData = (await dirResponse.json()) as {
    routes: Array<{ distance: number; duration: number }>;
  };

  const route = dirData.routes[0];
  if (!route) {
    return new Response(JSON.stringify({ error: 'No route found' }), { status: 404 });
  }

  const distanceMiles = Math.round((route.distance / 1609.34) * 100) / 100;
  const deliveryCost = Math.round(distanceMiles * body.pricePerMile * 100) / 100;

  return new Response(
    JSON.stringify({
      distanceMiles,
      durationMinutes: Math.round(route.duration / 60),
      deliveryCost,
    }),
    { status: 200 }
  );
});
