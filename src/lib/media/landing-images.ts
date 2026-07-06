/** Curated stock photography — CDN URLs work on Vercel without bundling large binaries in git. */

const pexels = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export interface LandingImage {
  src: string;
  alt: string;
}

export const LANDING_IMAGES = {
  hero: {
    src: pexels(1283219, 1920),
    alt: 'Mobile Irish pub setup at an outdoor evening event with warm lighting',
  },
  guinness: {
    src: pexels(5946962, 900),
    alt: 'Perfect pint of stout on a wooden bar',
  },
  about: {
    src: pexels(2574489, 900),
    alt: 'Warm Irish pub interior with bottles and ambient lighting',
  },
} as const;

export const GALLERY_STRIP_IMAGES: LandingImage[] = [
  { src: pexels(3184418, 900), alt: 'Guests enjoying drinks at an outdoor mobile bar' },
  { src: pexels(1552630, 900), alt: 'Craft beer and bar service' },
  { src: pexels(2747449, 900), alt: 'Evening event with warm string lights' },
  { src: pexels(1519742, 900), alt: 'Wedding celebration with mobile bar service' },
  { src: pexels(602750, 900), alt: 'Premium Irish whiskey selection' },
  { src: pexels(1763075, 900), alt: 'Festival crowd celebrating with drinks' },
];

export const EXPERIENCE_IMAGES: LandingImage[] = [
  { src: pexels(3184419, 900), alt: 'Corporate event with professional bar service' },
  { src: pexels(1552630, 900), alt: 'Bartender pouring a fresh pint' },
  { src: pexels(1304540, 900), alt: 'Handcrafted cocktails at a private party' },
  { src: pexels(1763075, 900), alt: 'Festival bar setup in the Carolinas' },
  { src: pexels(3171837, 900), alt: 'Private party with friends at the mobile pub' },
  { src: pexels(1190297, 900), alt: "St. Patrick's Day celebration" },
];

export const SERVICE_IMAGES = {
  weddings: pexels(1519742, 900),
  corporate: pexels(3184419, 900),
  private: pexels(3171837, 900),
  stpatricks: pexels(1190297, 900),
} as const;

export const TESTIMONIAL_IMAGES = {
  t1: pexels(1519742, 900),
  t2: pexels(3184419, 900),
  t3: pexels(1190297, 900),
} as const;

/** Stock gallery when DB has no tagged uploads. */
export const STOCK_GALLERY_IMAGES: LandingImage[] = [
  ...GALLERY_STRIP_IMAGES,
  ...EXPERIENCE_IMAGES,
  { src: LANDING_IMAGES.hero.src, alt: LANDING_IMAGES.hero.alt },
  { src: LANDING_IMAGES.guinness.src, alt: LANDING_IMAGES.guinness.alt },
  { src: LANDING_IMAGES.about.src, alt: LANDING_IMAGES.about.alt },
];
