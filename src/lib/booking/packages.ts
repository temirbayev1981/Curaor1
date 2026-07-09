export const PACKAGE_TIERS = {
  shamrock: {
    id: 'shamrock',
    multiplier: 1,
    guestsIncluded: 50,
    extraPerGuest: 12,
  },
  emerald: {
    id: 'emerald',
    multiplier: 1.35,
    guestsIncluded: 100,
    extraPerGuest: 10,
  },
  legend: {
    id: 'legend',
    multiplier: 1.75,
    guestsIncluded: 200,
    extraPerGuest: 8,
  },
} as const;

export type PackageTierId = keyof typeof PACKAGE_TIERS;

export const PACKAGE_TIER_IDS = Object.keys(PACKAGE_TIERS) as PackageTierId[];

/** Guest brackets for intimate events — scaled from tenant base_event_price. */
export const INTIMATE_GUEST_TIERS = [10, 15, 20, 30] as const;

export type IntimateGuestTier = (typeof INTIMATE_GUEST_TIERS)[number];

/**
 * Launch-friendly multipliers for small gatherings (≤30 guests).
 * Keeps margins viable while staying below full Shamrock pricing.
 */
export const INTIMATE_GUEST_SCALE: Record<IntimateGuestTier, number> = {
  10: 0.42,
  15: 0.52,
  20: 0.62,
  30: 0.75,
};

export const INTIMATE_GUEST_MAX = 30;

export function isPackageTierId(value: string): value is PackageTierId {
  return value in PACKAGE_TIERS;
}

export function resolveIntimateGuestTier(guestCount: number): IntimateGuestTier | null {
  if (guestCount > INTIMATE_GUEST_MAX) return null;
  if (guestCount <= 10) return 10;
  if (guestCount <= 15) return 15;
  if (guestCount <= 20) return 20;
  return 30;
}

export function calculateIntimatePackagePrice(
  baseEventPrice: number,
  guestCount: number
): number | null {
  const tier = resolveIntimateGuestTier(guestCount);
  if (!tier) return null;

  return Math.round(baseEventPrice * INTIMATE_GUEST_SCALE[tier] * 100) / 100;
}

export function calculatePackageBasePrice(
  baseEventPrice: number,
  tierId: PackageTierId,
  guestCount: number
): number {
  const tier = PACKAGE_TIERS[tierId];
  const base = baseEventPrice * tier.multiplier;
  const extraGuests = Math.max(0, guestCount - tier.guestsIncluded);
  return Math.round((base + extraGuests * tier.extraPerGuest) * 100) / 100;
}

/** Applies intimate pricing for ≤30 guests, otherwise standard package tiers. */
export function calculateEventPrice(
  baseEventPrice: number,
  tierId: PackageTierId,
  guestCount: number
): number {
  const intimatePrice = calculateIntimatePackagePrice(baseEventPrice, guestCount);
  if (intimatePrice !== null) return intimatePrice;

  return calculatePackageBasePrice(baseEventPrice, tierId, guestCount);
}
