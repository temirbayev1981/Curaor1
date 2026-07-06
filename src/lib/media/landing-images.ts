/**
 * Irish pub photography — locally hosted assets verified for theme accuracy.
 * Unsplash CDN IDs are unreliable (same slug can serve unrelated images).
 */

export interface LandingImage {
  id: string;
  src: string;
  alt: string;
}

const BASE = '/images/irish-pub';

function img(file: string, alt: string): LandingImage {
  return { id: file.replace(/\.jpg$/, ''), src: `${BASE}/${file}`, alt };
}

/** Master catalog — each file verified visually for Irish pub theme. */
const CATALOG = {
  pubInteriorHero: img(
    'hero-pub-interior.jpg',
    'Cozy Irish pub interior with wooden benches and warm ambient lighting'
  ),
  guinnessMacro: img(
    'guinness-macro.jpg',
    'Close-up of a perfect pint of Guinness stout with creamy white head'
  ),
  guinnessWood: img(
    'guinness-wood.jpg',
    'Pint of Guinness on a rustic wooden pub table with tartan seating'
  ),
  guinnessCandlelit: img(
    'guinness-candlelit.jpg',
    'Guinness draught in a glass beside candlelight in a traditional pub'
  ),
  guinnessDublin: img(
    'guinness-dublin.jpg',
    'Glass of Guinness beside a can in Dublin, Ireland'
  ),
  guinnessTable: img(
    'guinness-table.jpg',
    'Glass of Guinness on a dark wooden pub bar with bottle display'
  ),
  guinnessGarden: img(
    'guinness-garden.jpg',
    'Pint of Guinness on a table outside an Irish pub'
  ),
  guinnessSign: img(
    'guinness-sign.jpg',
    'Guinness brewery sign on a brick building in Dublin'
  ),
  guinnessPour: img(
    'beer-tap-pour.jpg',
    'Draft stout being poured from brass beer taps at the bar'
  ),
  vintageWhiskeyBar: img(
    'vintage-whiskey-bar.jpg',
    'Antique wooden bar counter lined with whiskey and liquor bottles'
  ),
  irishWhiskeyStore: img(
    'irish-whiskey-store.jpg',
    'Traditional Irish storefront with whiskey bottles in the window'
  ),
  beerCheers: img(
    'beer-cheers.jpg',
    'Friends toasting with beer bottles at golden hour'
  ),
  whiskeyCocktail: img(
    'whiskey-cocktail.jpg',
    'Handcrafted whiskey cocktail poured at a polished pub bar'
  ),
  whiskeyNeat: img(
    'jameson-bottle.jpg',
    'Jameson Irish whiskey bottle beside a glass on the rocks'
  ),
  jamesonPour: img(
    'jameson-pour.jpg',
    'Irish whiskey poured into a glass at the bar'
  ),
  whiskeyWall: img(
    'jameson-bottles.jpg',
    'Jameson Irish whiskey bottles lined up on the bar'
  ),
  irishWhiskeyTray: img(
    'irish-whiskey-tray.jpg',
    'Irish whiskey bottle and glass served on a wooden tray'
  ),
  irishPubExterior: img(
    'irish-pub-exterior.jpg',
    'Mulligan and Haines Irish pub with Guinness signage in Dublin'
  ),
  pubBarEvening: img(
    'pub-bar-evening.jpg',
    'Evening atmosphere inside a traditional Irish pub bar'
  ),
  stoutOnBar: img(
    'stout-on-bar.jpg',
    'Two pints of dark stout beneath brass beer taps on the bar'
  ),
  pubSausages: img(
    'sausages-mustard.jpg',
    'Pub sausages served with mustard on a wooden table'
  ),
  pubBurger: img(
    'pub-burger.jpg',
    'Gourmet pub burger with fries served at an Irish bar'
  ),
  irishBreakfast: img(
    'breakfast-plate.jpg',
    'Full Irish breakfast with eggs, bacon, black pudding and soda bread'
  ),
  fishAndChips: img(
    'fish-and-chips.jpg',
    'Classic Irish pub fish and chips with lemon and tartar sauce'
  ),
  bangersMash: img(
    'bangers-mash.jpg',
    'Bangers and mash with gravy served pub-style on a plate'
  ),
  shepherdPie: img(
    'plate-wooden.jpg',
    'Shepherd\'s pie with mashed potato topping served pub-style'
  ),
  potatoGravy: img(
    'potato-gravy.jpg',
    'Creamy mashed potatoes with gravy — classic pub side dish'
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
  CATALOG.whiskeyNeat,
  CATALOG.guinnessCandlelit,
  CATALOG.irishWhiskeyStore,
];

export const EXPERIENCE_IMAGES: LandingImage[] = [
  CATALOG.irishPubExterior,
  CATALOG.stoutOnBar,
  CATALOG.irishWhiskeyTray,
  CATALOG.guinnessPour,
  CATALOG.whiskeyCocktail,
  CATALOG.pubBarEvening,
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
  cocktails: CATALOG.whiskeyCocktail,
  food: CATALOG.fishAndChips,
} as const;

export const SERVICE_IMAGES = {
  weddings: CATALOG.beerCheers.src,
  corporate: CATALOG.pubBarEvening.src,
  private: CATALOG.irishWhiskeyStore.src,
  stpatricks: CATALOG.stoutOnBar.src,
} as const;

export const TESTIMONIAL_IMAGES = {
  t1: CATALOG.fishAndChips.src,
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
  CATALOG.guinnessSign,
  CATALOG.vintageWhiskeyBar,
  CATALOG.whiskeyWall,
  CATALOG.jamesonPour,
  CATALOG.pubBurger,
  CATALOG.pubSausages,
  CATALOG.potatoGravy,
  CATALOG.beerCheers,
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
  const fromSrc = (src: string) => src.split('/').pop()?.replace('.jpg', '') ?? src;

  return [...new Set([
    LANDING_IMAGES.hero.id,
    LANDING_IMAGES.heroAccent.id,
    LANDING_IMAGES.guinness.id,
    ...GALLERY_STRIP_IMAGES.map((i) => i.id),
    ...EXPERIENCE_IMAGES.map((i) => i.id),
    ...FOOD_IMAGES.map((i) => i.id),
    ...Object.values(MENU_CATEGORY_IMAGES).map((i) => i.id),
    ...Object.values(SERVICE_IMAGES).map(fromSrc),
  ])];
}

export const STOCK_GALLERY_COUNT = STOCK_GALLERY_IMAGES.length;
