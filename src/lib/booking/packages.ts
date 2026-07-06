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

export function isPackageTierId(value: string): value is PackageTierId {
  return value in PACKAGE_TIERS;
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
