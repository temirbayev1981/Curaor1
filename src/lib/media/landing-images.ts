/**
 * Premium Irish pub photography — Unsplash (Guinness, whiskey, interiors, food).
 * Each image ID is used once across the entire site.
 */

const unsplash = (slug: string, w = 1400) =>
  `https://images.unsplash.com/${slug}?w=${w}&q=85&auto=format&fit=crop`;

export interface LandingImage {
  id: string;
  src: string;
  alt: string;
}

function img(slug: string, alt: string, w = 1400): LandingImage {
  return { id: slug, src: unsplash(slug, w), alt };
}

/** Master catalog — authentic Irish pub, Guinness, whiskey & hearty food. */
const CATALOG = {
  /** Cozy traditional pub interior with wood & warm light */
  pubInteriorHero: img(
    'photo-1757695099881-c890996d9e39',
    'Cozy Irish pub interior with wooden benches and warm ambient lighting',
    1920
  ),
  /** Macro Guinness pint with creamy head */
  guinnessMacro: img(
    'photo-1720110919165-49df0e4f5d49',
    'Close-up of a perfect pint of Guinness stout with creamy white head'
  ),
  /** Guinness on rustic wooden table */
  guinnessWood: img(
    'photo-1642191572834-256807f846b7',
    'Pint of Guinness on a rustic wooden pub table'
  ),
  /** Guinness in traditional pub by candlelight */
  guinnessCandlelit: img(
    'photo-1563396983631-2f8cf576bb36',
    'Guinness draught in a glass beside candlelight in an English-style pub'
  ),
  /** Guinness in Dublin, Ireland */
  guinnessDublin: img(
    'photo-1743634424925-bd6a37c38bcc',
    'Glass of Guinness beside a can in Dublin, Ireland'
  ),
  /** Guinness on dark table */
  guinnessTable: img(
    'photo-1632293416349-4a3ff46e3572',
    'Glass of Guinness sitting on a dark wooden table'
  ),
  /** Vintage bar with whiskey bottles */
  vintageWhiskeyBar: img(
    'photo-1759373247456-49cc5f02b408',
    'Antique wooden bar counter lined with whiskey and liquor bottles'
  ),
  /** Irish whiskey shopfront */
  irishWhiskeyStore: img(
    'photo-1706483524268-597b1ea01ed1',
    'Traditional Irish storefront with whiskey bottles in the window'
  ),
  /** Whiskey on the rocks */
  whiskeyRocks: img(
    'photo-1436076863939-06870fe779c2',
    'Premium Irish whiskey served on the rocks in a crystal tumbler'
  ),
  /** Whiskey cocktail at the bar */
  whiskeyCocktail: img(
    'photo-1470337458703-46ad1756a187',
    'Handcrafted whiskey cocktail on a polished wooden bar'
  ),
  /** Neat whiskey pour */
  whiskeyNeat: img(
    'photo-1601925260368-ae2f83cf8b7f',
    'Amber Irish whiskey poured into a glass at the bar'
  ),
  /** Whiskey tasting lineup */
  whiskeyFlight: img(
    'photo-1629203851122-3726ecdf080e',
    'Flight of Irish whiskeys lined up for tasting'
  ),
  /** Back bar bottle display */
  barBottleWall: img(
    'photo-1535958636474-b021ee887b13',
    'Backlit wall of whiskey and spirits behind a pub bar'
  ),
  /** Classic pub atmosphere */
  pubDiningRoom: img(
    'photo-1555396273-367ea4eb4db5',
    'Warm-lit pub dining room with wooden tables and bottles'
  ),
  /** Evening bar scene */
  barEvening: img(
    'photo-1514933651103-005eec06c04b',
    'Evening atmosphere inside a traditional pub bar'
  ),
  /** Craft beer taps */
  beerTaps: img(
    'photo-1551218808-94e220e084d2',
    'Row of brass beer taps ready to pour draft stout and ale'
  ),
  /** Friends toasting at the bar */
  barToast: img(
    'photo-1513475382585-d06e58bcb0e0',
    'Friends raising glasses in a toast at a cozy pub bar'
  ),
  /** Intimate bar corner */
  barCorner: img(
    'photo-1578662996442-48f60103fc96',
    'Intimate corner of an Irish pub with drinks on the counter'
  ),
  /** Bartender detail */
  barCraft: img(
    'photo-1559339352-11d035aa65de',
    'Bartender craft and bottles behind a wooden pub bar'
  ),
  /** Hearty pub plating */
  pubPlatter: img(
    'photo-1414235077428-338989a2e8c0',
    'Hearty plated pub fare served at a candlelit table'
  ),
  /** Classic pub burger & fries */
  pubBurger: img(
    'photo-1551782450-17144efb9c50',
    'Gourmet pub burger with fries on a wooden board'
  ),
  /** Full Irish breakfast */
  irishBreakfast: img(
    'photo-1567620905732-2d1ec7ab7445',
    'Traditional full Irish breakfast with eggs, sausage and soda bread'
  ),
  /** Sharing boards & pub bites */
  sharingBoard: img(
    'photo-1565299624946-b28f40a0ae38',
    'Sharing board of pub bites and appetizers for a group'
  ),
  /** Classic fish and chips */
  fishAndChips: img(
    'photo-1553621042-f6e147245754',
    'Classic Irish pub fish and chips with tartar sauce'
  ),
  /** Grilled pub fare */
  grilledPubFare: img(
    'photo-1544025162-d76694265947',
    'Grilled meats and sides served pub-style on a wooden table'
  ),
  /** Brunch at the pub */
  pubBrunch: img(
    'photo-1565299507177-b0ac66763828',
    'Weekend brunch spread at an Irish pub table'
  ),
  /** Stout being enjoyed */
  stoutMoment: img(
    'photo-1509042239860-f550ce710b93',
    'Dark stout beer enjoyed at a wooden pub table'
  ),
} as const;

export { CATALOG };

export const LANDING_IMAGES = {
  hero: CATALOG.pubInteriorHero,
  heroAccent: CATALOG.guinnessMacro,
  guinness: CATALOG.guinnessWood,
  about: CATALOG.vintageWhiskeyBar,
} as const;

/** Drinks & atmosphere — gallery strip */
export const GALLERY_STRIP_IMAGES: LandingImage[] = [
  CATALOG.guinnessDublin,
  CATALOG.whiskeyRocks,
  CATALOG.guinnessCandlelit,
  CATALOG.irishWhiskeyStore,
];

/** The Emerald Pour experience — drinks, bar craft, atmosphere */
export const EXPERIENCE_IMAGES: LandingImage[] = [
  CATALOG.pubDiningRoom,
  CATALOG.stoutMoment,
  CATALOG.barBottleWall,
  CATALOG.beerTaps,
  CATALOG.whiskeyCocktail,
  CATALOG.barCraft,
];

/** Irish pub food photography */
export const FOOD_IMAGES: LandingImage[] = [
  CATALOG.fishAndChips,
  CATALOG.irishBreakfast,
  CATALOG.pubBurger,
  CATALOG.sharingBoard,
];

/** Menu category hero shots */
export const MENU_CATEGORY_IMAGES = {
  beer: CATALOG.guinnessTable,
  whiskey: CATALOG.whiskeyNeat,
  cocktails: CATALOG.whiskeyFlight,
  food: CATALOG.pubPlatter,
} as const;

export const SERVICE_IMAGES = {
  weddings: CATALOG.barToast.src,
  corporate: CATALOG.barEvening.src,
  private: CATALOG.barCorner.src,
  stpatricks: CATALOG.vintageWhiskeyBar.src,
} as const;

/** Testimonials — atmosphere shots (may overlap gallery on small cards) */
export const TESTIMONIAL_IMAGES = {
  t1: CATALOG.grilledPubFare.src,
  t2: CATALOG.pubBrunch.src,
  t3: CATALOG.whiskeyNeat.src,
} as const;

/** Full public gallery */
export const STOCK_GALLERY_IMAGES: LandingImage[] = dedupeById([
  ...GALLERY_STRIP_IMAGES,
  ...EXPERIENCE_IMAGES,
  ...FOOD_IMAGES,
  CATALOG.pubInteriorHero,
  CATALOG.guinnessMacro,
  CATALOG.guinnessWood,
  CATALOG.vintageWhiskeyBar,
  CATALOG.guinnessTable,
  CATALOG.whiskeyCocktail,
  CATALOG.whiskeyNeat,
  CATALOG.barCraft,
  CATALOG.pubPlatter,
  CATALOG.pubBurger,
  CATALOG.irishBreakfast,
  CATALOG.grilledPubFare,
  CATALOG.pubBrunch,
  CATALOG.stoutMoment,
]);

function dedupeById(images: LandingImage[]): LandingImage[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.id)) return false;
    seen.add(image.id);
    return true;
  });
}

export function getLandingPageImageIds(): string[] {
  const fromSrc = (src: string) =>
    src.match(/photo-[a-z0-9-]+/)?.[0] ?? src;

  return [
    LANDING_IMAGES.hero.id,
    LANDING_IMAGES.heroAccent.id,
    LANDING_IMAGES.guinness.id,
    ...GALLERY_STRIP_IMAGES.map((i) => i.id),
    ...EXPERIENCE_IMAGES.map((i) => i.id),
    ...FOOD_IMAGES.map((i) => i.id),
    ...Object.values(MENU_CATEGORY_IMAGES).map((i) => i.id),
    ...Object.values(SERVICE_IMAGES).map(fromSrc),
  ];
}

export const STOCK_GALLERY_COUNT = STOCK_GALLERY_IMAGES.length;
