import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/config/env', () => ({
  getMapboxToken: () => 'pk.test',
  getMapboxOrigin: () => ({ lat: 35.2271, lng: -80.8431 }),
}));

describe('calculateDistance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns distance from mapbox directions response', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('geocoding')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            features: [{ center: [-80.8431, 35.2271] }],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          routes: [{ distance: 16093.4, duration: 1200 }],
        }),
      });
    }) as unknown as typeof fetch;

    const { calculateDistance } = await import('@/domain/maps/distance.service');
    const result = await calculateDistance('Charlotte, NC');
    expect(result.distanceMiles).toBeCloseTo(10, 0);
    expect(result.durationMinutes).toBeGreaterThan(0);
  });

  it('calculates distance between two addresses', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('geocoding')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            features: [{ center: [-80.8431, 35.2271] }],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          routes: [{ distance: 8046.7, duration: 600 }],
        }),
      });
    }) as unknown as typeof fetch;

    const { calculateDistanceBetween } = await import('@/domain/maps/distance.service');
    const result = await calculateDistanceBetween('Charlotte, NC', 'Concord, NC');
    expect(result.originAddress).toBe('Charlotte, NC');
    expect(result.destinationAddress).toBe('Concord, NC');
    expect(result.distanceMiles).toBeGreaterThan(0);
  });

  it('throws when directions API fails', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('geocoding')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            features: [{ center: [-80.8431, 35.2271] }],
          }),
        });
      }
      return Promise.resolve({ ok: false });
    }) as unknown as typeof fetch;

    const { calculateDistance } = await import('@/domain/maps/distance.service');
    await expect(calculateDistance('Charlotte, NC')).rejects.toThrow(
      'Failed to calculate distance'
    );
  });

  it('throws when mapbox returns no route', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('geocoding')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            features: [{ center: [-80.8431, 35.2271] }],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ routes: [] }),
      });
    }) as unknown as typeof fetch;

    const { calculateDistance } = await import('@/domain/maps/distance.service');
    await expect(calculateDistance('Charlotte, NC')).rejects.toThrow('No route found');
  });

  it('throws when origin cannot be geocoded', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    }) as unknown as typeof fetch;

    const { calculateDistanceBetween } = await import('@/domain/maps/distance.service');
    await expect(calculateDistanceBetween('Nowhere', 'Also Nowhere')).rejects.toThrow(
      'Could not geocode origin address'
    );
  });

  it('throws when destination cannot be geocoded', async () => {
    let call = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            features: [{ center: [-80.8431, 35.2271] }],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ features: [] }),
      });
    }) as unknown as typeof fetch;

    const { calculateDistanceBetween } = await import('@/domain/maps/distance.service');
    await expect(calculateDistanceBetween('Charlotte, NC', 'Invalid')).rejects.toThrow(
      'Could not geocode destination address'
    );
  });
});
