import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  CATALOG,
  FOOD_IMAGES,
  getLandingPageImageIds,
  MENU_CATEGORY_IMAGES,
  STOCK_GALLERY_IMAGES,
} from './landing-images';

const PUBLIC_DIR = join(process.cwd(), 'public');

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

  it('serves locally hosted Irish pub photography', () => {
    const all = [
      ...Object.values(CATALOG),
      ...FOOD_IMAGES,
      ...Object.values(MENU_CATEGORY_IMAGES),
    ];

    for (const image of all) {
      expect(image.src).toMatch(/^\/images\/irish-pub\/.+\.jpg$/);
      const filePath = join(PUBLIC_DIR, image.src);
      expect(existsSync(filePath), `missing asset ${image.src}`).toBe(true);
      expect(image.alt.toLowerCase()).toMatch(
        /guinness|whiskey|whisky|irish|pub|stout|beer|bar|pint|ale|fish|chips|breakfast|banger|shepherd|jameson|cocktail|sausage|burger|gravy|mash|food truck|mobile bar|string lights|toast|tasting|gourmet|plating|celebration|twilight|guests|edison|festoon|illuminated|evening|liquor|bottles/
      );
    }
  });

  it('exposes enough gallery fallbacks', () => {
    expect(STOCK_GALLERY_IMAGES.length).toBeGreaterThanOrEqual(20);
  });
});
