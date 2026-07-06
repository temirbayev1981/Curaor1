import { describe, expect, it } from 'vitest';
import {
  CATALOG,
  FOOD_IMAGES,
  getLandingPageImageIds,
  MENU_CATEGORY_IMAGES,
  STOCK_GALLERY_IMAGES,
} from './landing-images';

describe('landing-images', () => {
  it('uses unique image IDs across landing page sections', () => {
    const ids = getLandingPageImageIds();
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps catalog IDs unique', () => {
    const ids = Object.values(CATALOG).map((image) => image.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('deduplicates stock gallery images', () => {
    const ids = STOCK_GALLERY_IMAGES.map((image) => image.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses Unsplash Irish pub photography', () => {
    const all = [
      ...Object.values(CATALOG),
      ...FOOD_IMAGES,
      ...Object.values(MENU_CATEGORY_IMAGES),
    ];
    for (const image of all) {
      expect(image.src).toContain('images.unsplash.com');
      expect(image.alt.toLowerCase()).toMatch(
        /guinness|whiskey|whisky|irish|pub|stout|beer|bar/
      );
    }
  });

  it('exposes enough gallery fallbacks', () => {
    expect(STOCK_GALLERY_IMAGES.length).toBeGreaterThanOrEqual(20);
  });
});
