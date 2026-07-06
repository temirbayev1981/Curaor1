/** Curated Irish pub / mobile bar photography — unique Pexels IDs only. */

const pexels = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export interface LandingImage {
  id: number;
  src: string;
  alt: string;
}

function img(id: number, alt: string, w = 1200): LandingImage {
  return { id, src: pexels(id, w), alt };
}

/** Master catalog — each ID used once across the entire site. */
const CATALOG = {
  hero: img(1157570, 'Mobile Irish pub at an evening event with warm string lights', 1920),
  guinnessPint: img(5946962, 'Perfect pint of stout on a rustic wooden bar'),
  pubInterior: img(2574489, 'Warm Irish pub interior with bottles and ambient lighting'),
  outdoorBarDay: img(3184418, 'Guests enjoying drinks at an outdoor mobile bar'),
  beerTaps: img(3612571, 'Craft beer taps at a professional mobile bar'),
  nightCelebration: img(2747449, 'Evening celebration with golden string lights'),
  weddingToast: img(265722, 'Wedding reception toast with champagne and celebration'),
  whiskeyGlasses: img(602750, 'Premium Irish whiskey glasses on a wooden bar'),
  festivalCrowd: img(1763075, 'Festival crowd celebrating with drinks at sunset'),
  corporateMixer: img(1181395, 'Corporate networking event with bar service'),
  pouringPint: img(1552630, 'Bartender pouring a fresh pint of stout'),
  craftCocktails: img(1304540, 'Handcrafted cocktails at a private celebration'),
  outdoorConcert: img(2774556, 'Outdoor concert and bar at golden hour'),
  backyardParty: img(3171837, 'Friends celebrating at a backyard private party'),
  stPatricks: img(1190297, "St. Patrick's Day celebration with green decor"),
  weddingCouple: img(1444442, 'Happy couple at their wedding reception'),
  officeCelebration: img(4056723, 'Corporate team celebration with drinks'),
  cheersFriends: img(759174, 'Friends raising glasses for a toast'),
  irishPubNight: img(1267325, 'Cozy pub atmosphere with warm lighting at night'),
  whiskeyPour: img(3408744, 'Whiskey being poured into a crystal glass'),
  barrelAging: img(5531545, 'Oak barrels in a traditional distillery'),
  gardenParty: img(1670752, 'Elegant garden party with bar setup'),
  toastGroup: img(2206746, 'Group of guests toasting at an event'),
  cocktailBar: img(1126728, 'Colorful cocktails lined up on a bar'),
  eveningReception: img(4058705, 'Evening wedding reception with ambient lighting'),
  pubCrowd: img(1283218, 'Lively pub crowd enjoying drinks together'),
  beerCheers: img(1571020, 'Friends clinking beer glasses at a celebration'),
  rusticBar: img(2740966, 'Rustic wooden bar setup for an outdoor event'),
  festivalLights: img(1040880, 'Festival at night with glowing lights and crowd'),
  mobileSetup: img(5245329, 'Professional mobile bar setup at an outdoor venue'),
} as const;

export { CATALOG };

export const LANDING_IMAGES = {
  hero: CATALOG.hero,
  /** Hero side card — distinct from the about pint photo. */
  heroAccent: CATALOG.whiskeyGlasses,
  guinness: CATALOG.guinnessPint,
  about: CATALOG.pubInterior,
} as const;

/** Mockup: horizontal gallery strip (4–6 event photos). */
export const GALLERY_STRIP_IMAGES: LandingImage[] = [
  CATALOG.outdoorBarDay,
  CATALOG.whiskeyPour,
  CATALOG.irishPubNight,
  CATALOG.toastGroup,
];

/** Experience mosaic — 6 unique scenes. */
export const EXPERIENCE_IMAGES: LandingImage[] = [
  CATALOG.corporateMixer,
  CATALOG.pouringPint,
  CATALOG.craftCocktails,
  CATALOG.festivalLights,
  CATALOG.gardenParty,
  CATALOG.beerCheers,
];

export const SERVICE_IMAGES = {
  weddings: CATALOG.weddingCouple.src,
  corporate: CATALOG.officeCelebration.src,
  private: CATALOG.backyardParty.src,
  stpatricks: CATALOG.stPatricks.src,
} as const;

export const TESTIMONIAL_IMAGES = {
  t1: CATALOG.weddingToast.src,
  t2: CATALOG.eveningReception.src,
  t3: CATALOG.cheersFriends.src,
} as const;

/** Full public gallery — deduplicated by Pexels ID. */
export const STOCK_GALLERY_IMAGES: LandingImage[] = dedupeById([
  ...GALLERY_STRIP_IMAGES,
  ...EXPERIENCE_IMAGES,
  CATALOG.hero,
  CATALOG.guinnessPint,
  CATALOG.pubInterior,
  CATALOG.beerTaps,
  CATALOG.nightCelebration,
  CATALOG.whiskeyGlasses,
  CATALOG.festivalCrowd,
  CATALOG.outdoorConcert,
  CATALOG.cheersFriends,
  CATALOG.cocktailBar,
  CATALOG.eveningReception,
  CATALOG.pubCrowd,
  CATALOG.barrelAging,
  CATALOG.rusticBar,
  CATALOG.mobileSetup,
]);

function dedupeById(images: LandingImage[]): LandingImage[] {
  const seen = new Set<number>();
  return images.filter((image) => {
    if (seen.has(image.id)) return false;
    seen.add(image.id);
    return true;
  });
}

/** IDs visible on the landing page (each must appear once). */
export function getLandingPageImageIds(): number[] {
  const fromUrl = (src: string) => extractPexelsId(src)!;

  return [
    LANDING_IMAGES.hero.id,
    LANDING_IMAGES.heroAccent.id,
    LANDING_IMAGES.guinness.id,
    ...GALLERY_STRIP_IMAGES.map((i) => i.id),
    ...EXPERIENCE_IMAGES.map((i) => i.id),
    ...Object.values(SERVICE_IMAGES).map(fromUrl),
    ...Object.values(TESTIMONIAL_IMAGES).map(fromUrl),
  ];
}

function extractPexelsId(url: string): number | null {
  const match = url.match(/photos\/(\d+)\//);
  return match ? Number(match[1]) : null;
}

export const STOCK_GALLERY_COUNT = STOCK_GALLERY_IMAGES.length;
