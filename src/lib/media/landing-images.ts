/**
 * Irish pub photography — locally hosted assets with strict per-page de-duplication.
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

/** Master catalog — each file used once on the landing page. */
const CATALOG = {
  heroMobileBarTruck: img(
    'hero-mobile-bar-truck.jpg',
    'The Emerald Pour mobile Irish pub truck glowing with warm string lights and guests at twilight'
  ),
  foodTruckStringLights: img(
    'food-truck-string-lights.jpg',
    'Outdoor mobile bar cart glowing with festoon string lights against a dark evening sky'
  ),
  illuminatedBarTruckEvening: img(
    'illuminated-bar-truck-evening.jpg',
    'Warmly illuminated mobile bar truck with outdoor seating under tree branches at evening'
  ),
  outdoorEventStringLights: img(
    'outdoor-event-string-lights.jpg',
    'Elegant outdoor evening event with warm string lights and intimate bar atmosphere'
  ),
  nightTruckCustomers: img(
    'night-truck-customers.jpg',
    'Mobile food truck serving guests at night under cozy amber bar lighting'
  ),
  moodyTruckNight: img(
    'moody-truck-night.jpg',
    'Moody nighttime mobile bar truck with customers under warm street lights'
  ),
  whiskeyBarShelf: img(
    'whiskey-bar-shelf.jpg',
    'Premium whiskey and liquor bottles beautifully lit on a warm wooden bar shelf'
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
  eventToastGlasses: img(
    'event-toast-glasses.jpg',
    'Guests raising glasses in a warm candlelit celebration toast'
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
  whiskeyTasting: img(
    'whiskey-tasting.jpg',
    'Premium Irish whiskey tasting flight on a dark wooden bar'
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
  fullBreakfast: img(
    'full-breakfast.jpg',
    'Hearty Irish breakfast spread with eggs, sausage and grilled tomato'
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
    'shepherds-pie.jpg',
    "Classic Irish shepherd's pie with golden mashed potato crust in a cast-iron skillet"
  ),
  potatoGravy: img(
    'potato-gravy.jpg',
    'Creamy mashed potatoes with gravy — classic pub side dish'
  ),
  plateWooden: img(
    'plate-wooden.jpg',
    'Artisan pub fare served on a rustic wooden board'
  ),
  pubInteriorHero: img(
    'hero-pub-interior.jpg',
    'Cozy Irish pub interior with wooden benches and warm ambient lighting'
  ),
} as const;

export { CATALOG };

export const LANDING_IMAGES = {
  hero: CATALOG.heroMobileBarTruck,
  heroAccent: CATALOG.whiskeyBarShelf,
  guinness: CATALOG.guinnessWood,
  about: CATALOG.vintageWhiskeyBar,
  aboutAccent: CATALOG.jamesonPour,
} as const;

export const GALLERY_STRIP_IMAGES: LandingImage[] = [
  CATALOG.outdoorEventStringLights,
  CATALOG.illuminatedBarTruckEvening,
  CATALOG.foodTruckStringLights,
  CATALOG.nightTruckCustomers,
];

export const EXPERIENCE_IMAGES: LandingImage[] = [
  CATALOG.irishPubExterior,
  CATALOG.moodyTruckNight,
  CATALOG.stoutOnBar,
  CATALOG.guinnessPour,
  CATALOG.pubBarEvening,
  CATALOG.pubSausages,
];

export const FOOD_IMAGES: LandingImage[] = [
  CATALOG.shepherdPie,
  CATALOG.fishAndChips,
  CATALOG.irishBreakfast,
  CATALOG.bangersMash,
];

export const MENU_CATEGORY_IMAGES = {
  beer: CATALOG.guinnessTable,
  whiskey: CATALOG.whiskeyWall,
  cocktails: CATALOG.whiskeyCocktail,
  food: CATALOG.pubBurger,
} as const;

export const SERVICE_IMAGES = {
  weddings: CATALOG.eventToastGlasses.src,
  corporate: CATALOG.whiskeyTasting.src,
  private: CATALOG.guinnessGarden.src,
  stpatricks: CATALOG.beerCheers.src,
} as const;

export const TESTIMONIAL_IMAGES = {
  t1: CATALOG.plateWooden.src,
  t2: CATALOG.fullBreakfast.src,
  t3: CATALOG.guinnessSign.src,
} as const;

export const STOCK_GALLERY_IMAGES: LandingImage[] = dedupeById([
  ...GALLERY_STRIP_IMAGES,
  ...EXPERIENCE_IMAGES,
  ...FOOD_IMAGES,
  CATALOG.heroMobileBarTruck,
  CATALOG.whiskeyBarShelf,
  CATALOG.guinnessMacro,
  CATALOG.guinnessWood,
  CATALOG.guinnessSign,
  CATALOG.vintageWhiskeyBar,
  CATALOG.irishWhiskeyStore,
  CATALOG.potatoGravy,
  CATALOG.pubInteriorHero,
  CATALOG.moodyTruckNight,
  CATALOG.nightTruckCustomers,
]);

function dedupeById(images: LandingImage[]): LandingImage[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.id)) return false;
    seen.add(image.id);
    return true;
  });
}

/** Every image shown on the home page — must be unique. */
export function getLandingPageImageIds(): string[] {
  const fromSrc = (src: string) => src.split('/').pop()?.replace('.jpg', '') ?? src;

  return [
    LANDING_IMAGES.hero.id,
    LANDING_IMAGES.heroAccent.id,
    LANDING_IMAGES.guinness.id,
    LANDING_IMAGES.about.id,
    LANDING_IMAGES.aboutAccent.id,
    ...GALLERY_STRIP_IMAGES.map((i) => i.id),
    ...EXPERIENCE_IMAGES.map((i) => i.id),
    ...FOOD_IMAGES.map((i) => i.id),
    ...Object.values(MENU_CATEGORY_IMAGES).map((i) => i.id),
    ...Object.values(SERVICE_IMAGES).map(fromSrc),
    ...Object.values(TESTIMONIAL_IMAGES).map(fromSrc),
  ];
}

export const STOCK_GALLERY_COUNT = STOCK_GALLERY_IMAGES.length;
