export const GUEST_PACKAGES = {
  g10: {
    id: 'g10',
    guestCount: 10,
    multiplier: 0.42,
    extraPerGuest: 10,
    featureCount: 4,
  },
  g20: {
    id: 'g20',
    guestCount: 20,
    multiplier: 0.62,
    extraPerGuest: 10,
    featureCount: 5,
  },
  g35: {
    id: 'g35',
    guestCount: 35,
    multiplier: 0.8,
    extraPerGuest: 10,
    featureCount: 6,
  },
  g60: {
    id: 'g60',
    guestCount: 60,
    multiplier: 1,
    extraPerGuest: 10,
    featureCount: 7,
  },
} as const;

export type PackageTierId = keyof typeof GUEST_PACKAGES;

export const PACKAGE_TIER_IDS = Object.keys(GUEST_PACKAGES) as PackageTierId[];

export const GUEST_PACKAGE_GUEST_COUNTS = PACKAGE_TIER_IDS.map(
  (id) => GUEST_PACKAGES[id].guestCount
);

const LEGACY_PACKAGE_MAP: Record<string, PackageTierId> = {
  shamrock: 'g35',
  emerald: 'g60',
  legend: 'g60',
};

export function isPackageTierId(value: string): value is PackageTierId {
  return value in GUEST_PACKAGES;
}

export function normalizePackageTier(
  value: string | undefined | null,
  guestCount: number
): PackageTierId {
  if (value && isPackageTierId(value)) return value;
  if (value) {
    const legacy = LEGACY_PACKAGE_MAP[value as keyof typeof LEGACY_PACKAGE_MAP];
    if (legacy) return legacy;
  }
  return resolveGuestPackage(guestCount);
}

export function resolveGuestPackage(guestCount: number): PackageTierId {
  if (guestCount <= 10) return 'g10';
  if (guestCount <= 20) return 'g20';
  if (guestCount <= 35) return 'g35';
  return 'g60';
}

export function getPackageGuestCount(packageId: PackageTierId): number {
  return GUEST_PACKAGES[packageId].guestCount;
}

export function calculatePackagePrice(
  baseEventPrice: number,
  packageId: PackageTierId,
  guestCount?: number
): number {
  const pkg = GUEST_PACKAGES[packageId];
  let price = baseEventPrice * pkg.multiplier;

  if (guestCount && guestCount > pkg.guestCount) {
    price += (guestCount - pkg.guestCount) * pkg.extraPerGuest;
  }

  return Math.round(price * 100) / 100;
}

/** @deprecated Use calculatePackagePrice */
export function calculatePackageBasePrice(
  baseEventPrice: number,
  packageId: PackageTierId,
  guestCount: number
): number {
  return calculatePackagePrice(baseEventPrice, packageId, guestCount);
}

export function calculateEventPrice(baseEventPrice: number, guestCount: number): number {
  const packageId = resolveGuestPackage(guestCount);
  return calculatePackagePrice(baseEventPrice, packageId, guestCount);
}
