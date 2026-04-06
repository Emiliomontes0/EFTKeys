import type { MapWithLocks } from "../api/types";

/**
 * Alternate tarkov.dev map entries that mirror another map’s locks.
 * Variants are hidden from “Browse by map” and folded into the primary map everywhere else.
 */
const VARIANT_TO_PRIMARY: Record<string, string> = {
  "night-factory": "factory",
  "ground-zero-21": "ground-zero",
  "ground-zero-tutorial": "ground-zero",
};

export function primaryNormalizedName(normalizedName: string): string {
  return VARIANT_TO_PRIMARY[normalizedName] ?? normalizedName;
}

export function isVariantMap(normalizedName: string): boolean {
  return normalizedName in VARIANT_TO_PRIMARY;
}

/** Drop alternate map versions from the home map grid. */
export function filterPrimaryMapsForBrowse<
  T extends { normalizedName: string },
>(maps: T[]): T[] {
  return maps.filter((m) => !isVariantMap(m.normalizedName));
}

/** Prefer the non-variant map’s title when several rows share the same primary id. */
export function pickMapMetaForPrimary(
  maps: MapWithLocks[],
  primaryNormalized: string,
): MapWithLocks | undefined {
  const group = maps.filter(
    (m) => primaryNormalizedName(m.normalizedName) === primaryNormalized,
  );
  return group.find((m) => !isVariantMap(m.normalizedName)) ?? group[0];
}
