import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/config/env', () => ({
  getMapboxToken: () => 'pk.test',
}));

describe('geocode.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty suggestions for short queries', async () => {
    const { suggestAddresses } = await import('@/domain/maps/geocode.service');
    expect(await suggestAddresses('ab')).toEqual([]);
  });

  it('maps mapbox features to address suggestions', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            id: 'place.1',
            place_name: '123 Main St, Charlotte, NC 28202',
            text: 'Main St',
            address: '123',
            context: [
              { id: 'place.1', text: 'Charlotte' },
              { id: 'region.1', text: 'North Carolina', short_code: 'US-NC' },
              { id: 'postcode.1', text: '28202' },
            ],
          },
        ],
      }),
    }) as unknown as typeof fetch;

    const { suggestAddresses } = await import('@/domain/maps/geocode.service');
    const results = await suggestAddresses('123 Main');
    expect(results).toHaveLength(1);
    expect(results[0]?.city).toBe('Charlotte');
    expect(results[0]?.state).toBe('NC');
    expect(results[0]?.zip).toBe('28202');
  });

  it('geocodes an address to coordinates', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [{ center: [-80.8431, 35.2271] }],
      }),
    }) as unknown as typeof fetch;

    const { geocodeAddress } = await import('@/domain/maps/geocode.service');
    const coords = await geocodeAddress('Charlotte, NC');
    expect(coords).toEqual({ lng: -80.8431, lat: 35.2271 });
  });

  it('maps place-only features without street number', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            id: 'place.2',
            place_name: 'Concord, NC',
            text: 'Concord',
            context: [{ id: 'region.1', text: 'North Carolina', short_code: 'US-NC' }],
          },
        ],
      }),
    }) as unknown as typeof fetch;

    const { suggestAddresses } = await import('@/domain/maps/geocode.service');
    const results = await suggestAddresses('Concord');
    expect(results[0]?.address).toBe('Concord');
    expect(results[0]?.state).toBe('NC');
  });

  it('returns empty suggestions when mapbox responds with error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as unknown as typeof fetch;

    const { suggestAddresses } = await import('@/domain/maps/geocode.service');
    expect(await suggestAddresses('123 Main')).toEqual([]);
  });

  it('returns null for short geocode queries', async () => {
    const { geocodeAddress } = await import('@/domain/maps/geocode.service');
    expect(await geocodeAddress('ab')).toBeNull();
  });

  it('returns null when geocode response has no features', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    }) as unknown as typeof fetch;

    const { geocodeAddress } = await import('@/domain/maps/geocode.service');
    expect(await geocodeAddress('Unknown Place XYZ')).toBeNull();
  });
});
