import { describe, expect, it } from 'vitest';
import {
  CATALOG,
  getLandingPageImageIds,
  STOCK_GALLERY_IMAGES,
} from './landing-images';

describe('landing-images', () => {
  it('uses unique Pexels IDs across landing page sections', () => {
    const ids = getLandingPageImageIds();
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('keeps catalog IDs unique', () => {
    const ids = Object.values(CATALOG).map((image) => image.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('deduplicates stock gallery images', () => {
    const ids = STOCK_GALLERY_IMAGES.map((image) => image.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exposes enough gallery fallbacks', () => {
    expect(STOCK_GALLERY_IMAGES.length).toBeGreaterThanOrEqual(12);
  });
});
