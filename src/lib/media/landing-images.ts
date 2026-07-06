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

/** Master catalog — authentic Irish pub, Guinness, whiskey & hearty food only. */
const CATALOG = {
  pubInteriorHero: img(
    'photo-1757695099881-c890996d9e39',
    'Cozy Irish pub interior with wooden benches and warm ambient lighting',
    1920
  ),
  guinnessMacro: img(
    'photo-1720110919165-49df0e4f5d49',
    'Close-up of a perfect pint of Guinness stout with creamy white head'
  ),
  guinnessWood: img(
    'photo-1642191572834-256807f846b7',
    'Pint of Guinness on a rustic wooden pub table'
  ),
  guinnessCandlelit: img(
    'photo-1563396983631-2f8cf576bb36',
    'Guinness draught in a glass beside candlelight in a traditional pub'
  ),
  guinnessDublin: img(
    'photo-1743634424925-bd6a37c38bcc',
    'Glass of Guinness beside a can in Dublin, Ireland'
  ),
  guinnessTable: img(
    'photo-1632293416349-4a3ff46e3572',
    'Glass of Guinness sitting on a dark wooden pub table'
  ),
  guinnessGarden: img(
    'photo-1701714280017-cd7bbe218e6a',
    'Pint of Guinness on a table outside an Irish pub'
  ),
  guinnessPour: img(
    'photo-1543353071-873f17a7a088',
    'Bartender pouring dark stout into a pint glass at an Irish pub'
  ),
  vintageWhiskeyBar: img(
    'photo-1759373247456-49cc5f02b408',
    'Antique wooden bar counter lined with whiskey and liquor bottles'
  ),
  irishWhiskeyStore: img(
    'photo-1706483524268-597b1ea01ed1',
    'Traditional Irish storefront with whiskey bottles in the window'
  ),
  whiskeyRocks: img(
    'photo-1436076863939-06870fe779c2',
    'Premium Irish whiskey served on the rocks in a crystal tumbler'
  ),
  whiskeyCocktail: img(
    'photo-1470337458703-46ad1756a187',
    'Handcrafted whiskey cocktail on a polished wooden pub bar'
  ),
  whiskeyNeat: img(
    'photo-1601925260368-ae2f83cf8b7f',
    'Amber Irish whiskey poured into a glass at the bar'
  ),
  whiskeyFlight: img(
    'photo-1629203851122-3726ecdf080e',
    'Flight of Irish whiskeys lined up for tasting at the bar'
  ),
  whiskeyWall: img(
    'photo-1481391319762-47dff72954d9',
    'Shelves of Irish whiskey bottles behind a traditional pub bar'
  ),
  barBottleWall: img(
    'photo-1535958636474-b021ee887b13',
    'Backlit wall of whiskey and spirits behind a pub bar'
  ),
  pubDiningRoom: img(
    'photo-1763495194909-22f53b608620',
    'Traditional Irish pub storefront with Guinness signage in Dublin'
  ),
  barEvening: img(
    'photo-1514933651103-005eec06c04b',
    'Evening atmosphere inside a traditional Irish pub bar'
  ),
  beerTaps: img(
    'photo-1551218808-94e220e084d2',
    'Row of brass beer taps ready to pour Guinness and draft ale'
  ),
  barToast: img(
    'photo-1513475382585-d06e58bcb0e0',
    'Friends raising pints of stout in a toast at a cozy Irish pub'
  ),
  barCorner: img(
    'photo-1555396273-367ea4eb4db5',
    'Cozy corner of an Irish pub with wooden bar and warm lighting'
  ),
  barCraft: img(
    'photo-1559339352-11d035aa65de',
    'Bartender pouring draft beer behind a wooden Irish pub bar'
  ),
  stoutOnBar: img(
    'photo-1769767677701-b471aa0ebf43',
    'Two pints of dark stout on a wooden pub bar counter'
  ),
  pubPlatter: img(
    'photo-1555939594-58d7cb561ad1',
    'Hearty pub fare platter served on a wooden table with beer'
  ),
  pubBurger: img(
    'photo-1551782450-17144efb9c50',
    'Gourmet pub burger with fries served at an Irish bar'
  ),
  irishBreakfast: img(
    'photo-1567620905732-2d1ec7ab7445',
    'Traditional full Irish breakfast with eggs, sausage and soda bread'
  ),
  sharingBoard: img(
    'photo-1764397557799-258db31fe6a4',
    'Classic Irish pub fish and chips with lemon on a plate'
  ),
  fishAndChips: img(
    'photo-1553621042-f6e147245754',
    'Classic Irish pub fish and chips with tartar sauce'
  ),
  bangersMash: img(
    'photo-1621996346565-e3dbc646d9a9',
    'Bangers and mash with gravy served pub-style on a plate'
  ),
  shepherdPie: img(
    'photo-1528607929212-2636ec44253e',
    'Shepherd\'s pie with mashed potato topping fresh from the pub kitchen'
  ),
  stoutMoment: img(
    'photo-1509042239860-f550ce710b93',
    'Dark stout beer enjoyed at a wooden Irish pub table'
  ),
} as const;

export { CATALOG };

export const LANDING_IMAGES = {
  hero: CATALOG.pubInteriorHero,
  heroAccent: CATALOG.guinnessMacro,
  guinness: CATALOG.guinnessWood,
  about: CATALOG.vintageWhiskeyBar,
} as const;

export const GALLERY_STRIP_IMAGES: LandingImage[] = [
  CATALOG.guinnessDublin,
  CATALOG.whiskeyRocks,
  CATALOG.guinnessCandlelit,
  CATALOG.irishWhiskeyStore,
];

export const EXPERIENCE_IMAGES: LandingImage[] = [
  CATALOG.pubDiningRoom,
  CATALOG.stoutMoment,
  CATALOG.barBottleWall,
  CATALOG.beerTaps,
  CATALOG.whiskeyCocktail,
  CATALOG.barCraft,
];

export const FOOD_IMAGES: LandingImage[] = [
  CATALOG.fishAndChips,
  CATALOG.irishBreakfast,
  CATALOG.bangersMash,
  CATALOG.shepherdPie,
];

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
  stpatricks: CATALOG.stoutOnBar.src,
} as const;

export const TESTIMONIAL_IMAGES = {
  t1: CATALOG.sharingBoard.src,
  t2: CATALOG.irishBreakfast.src,
  t3: CATALOG.whiskeyNeat.src,
} as const;

export const STOCK_GALLERY_IMAGES: LandingImage[] = dedupeById([
  ...GALLERY_STRIP_IMAGES,
  ...EXPERIENCE_IMAGES,
  ...FOOD_IMAGES,
  CATALOG.pubInteriorHero,
  CATALOG.guinnessMacro,
  CATALOG.guinnessWood,
  CATALOG.guinnessGarden,
  CATALOG.guinnessPour,
  CATALOG.vintageWhiskeyBar,
  CATALOG.whiskeyWall,
  CATALOG.guinnessTable,
  CATALOG.whiskeyCocktail,
  CATALOG.whiskeyNeat,
  CATALOG.barCraft,
  CATALOG.pubPlatter,
  CATALOG.pubBurger,
  CATALOG.bangersMash,
  CATALOG.shepherdPie,
  CATALOG.stoutOnBar,
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
