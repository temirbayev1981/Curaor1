/** Curated stock photography for landing & gallery fallbacks (Irish pub / events theme). */

export interface LandingImage {
  src: string;
  alt: string;
}

export const LANDING_IMAGES = {
  hero: {
    src: '/images/landing/hero.jpg',
    alt: 'Mobile Irish pub setup at an outdoor evening event with warm lighting',
  },
  guinness: {
    src: '/images/landing/guinness.jpg',
    alt: 'Perfect pint of stout on a wooden bar',
  },
  about: {
    src: '/images/landing/pub-interior.jpg',
    alt: 'Warm Irish pub interior with bottles and ambient lighting',
  },
} as const;

export const GALLERY_STRIP_IMAGES: LandingImage[] = [
  { src: '/images/landing/outdoor-party.jpg', alt: 'Guests enjoying drinks at an outdoor mobile bar' },
  { src: '/images/landing/bar-taps.jpg', alt: 'Craft beer taps at The Emerald Pour mobile bar' },
  { src: '/images/landing/night-lights.jpg', alt: 'Mobile pub illuminated at night with string lights' },
  { src: '/images/landing/wedding.jpg', alt: 'Wedding celebration with mobile bar service' },
  { src: '/images/landing/whiskey.jpg', alt: 'Premium Irish whiskey selection' },
  { src: '/images/landing/celebration.jpg', alt: 'Festival crowd celebrating with drinks' },
];

export const EXPERIENCE_IMAGES: LandingImage[] = [
  { src: '/images/landing/corporate.jpg', alt: 'Corporate event with professional bar service' },
  { src: '/images/landing/pour.jpg', alt: 'Bartender pouring a fresh pint' },
  { src: '/images/landing/cocktails.jpg', alt: 'Handcrafted cocktails at a private party' },
  { src: '/images/landing/festival.jpg', alt: 'Festival bar setup in the Carolinas' },
  { src: '/images/landing/private-party.jpg', alt: 'Private party with friends at the mobile pub' },
  { src: '/images/landing/st-patricks.jpg', alt: "St. Patrick's Day celebration" },
];

export const SERVICE_IMAGES = {
  weddings: '/images/landing/wedding.jpg',
  corporate: '/images/landing/corporate.jpg',
  private: '/images/landing/private-party.jpg',
  stpatricks: '/images/landing/st-patricks.jpg',
} as const;

export const TESTIMONIAL_IMAGES = {
  t1: '/images/landing/wedding.jpg',
  t2: '/images/landing/corporate.jpg',
  t3: '/images/landing/st-patricks.jpg',
} as const;

/** All stock images for public gallery when DB has no tagged assets. */
export const STOCK_GALLERY_IMAGES: LandingImage[] = [
  ...GALLERY_STRIP_IMAGES,
  ...EXPERIENCE_IMAGES,
  { src: LANDING_IMAGES.hero.src, alt: LANDING_IMAGES.hero.alt },
  { src: LANDING_IMAGES.guinness.src, alt: LANDING_IMAGES.guinness.alt },
  { src: LANDING_IMAGES.about.src, alt: LANDING_IMAGES.about.alt },
];
