import type { KeySearchHit, MapWithLocks } from "../api/types";
import {
  isVariantMap,
  primaryNormalizedName,
} from "./mapBrowse";

export type LockLocationRow = {
  mapName: string;
  /** e.g. `customs`, `factory` — used for preview image & map links. */
  mapNormalizedName: string;
  lockType: string | null;
  needsPower: boolean | null;
  position: { x: number; y: number; z: number } | null;
};

/** Flatten maps → lock rows where the lock’s key matches `keyId`. */
export function locksForKey(
  maps: MapWithLocks[],
  keyId: string,
): LockLocationRow[] {
  const raw: LockLocationRow[] = [];

  for (const map of maps) {
    const locks = map.locks ?? [];
    for (const lock of locks) {
      if (lock.key?.id === keyId) {
        raw.push({
          mapName: map.name,
          mapNormalizedName: map.normalizedName,
          lockType: lock.lockType,
          needsPower: lock.needsPower,
          position: lock.position,
        });
      }
    }
  }

  const merged = new Map<string, LockLocationRow>();
  for (const row of raw) {
    const primary = primaryNormalizedName(row.mapNormalizedName);
    const pos = row.position;
    const canMerge =
      pos != null &&
      pos.x != null &&
      pos.y != null &&
      pos.z != null;
    const key = canMerge
      ? `${primary}|${row.lockType ?? ""}|${pos.x}|${pos.y}|${pos.z}`
      : null;

    if (!key) {
      merged.set(`__${merged.size}`, row);
      continue;
    }

    const prev = merged.get(key);
    if (!prev) {
      merged.set(key, row);
      continue;
    }
    if (isVariantMap(prev.mapNormalizedName) && !isVariantMap(row.mapNormalizedName)) {
      merged.set(key, row);
    }
  }

  return [...merged.values()];
}

/** Unique map names where this key appears in a lock (sorted). Variant maps fold into one label. */
export function mapNamesForKey(
  maps: MapWithLocks[],
  keyId: string,
): string[] {
  const byPrimary = new Map<string, { name: string; isVariant: boolean }>();

  for (const map of maps) {
    const locks = map.locks ?? [];
    let used = false;
    for (const lock of locks) {
      if (lock.key?.id === keyId) {
        used = true;
        break;
      }
    }
    if (!used) continue;

    const primary = primaryNormalizedName(map.normalizedName);
    const variant = isVariantMap(map.normalizedName);
    const prev = byPrimary.get(primary);
    if (!prev) {
      byPrimary.set(primary, { name: map.name, isVariant: variant });
    } else if (!variant) {
      byPrimary.set(primary, { name: map.name, isVariant: false });
    }
  }

  return [...byPrimary.values()]
    .map((x) => x.name)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Unique keys that appear on a map’s locks (sorted by name).
 * Includes locks from alternate map versions (e.g. Night Factory → Factory).
 */
export function keysForMap(
  maps: MapWithLocks[],
  mapNormalizedName: string,
): KeySearchHit[] {
  const primary = primaryNormalizedName(mapNormalizedName);
  const byId = new Map<string, KeySearchHit>();
  for (const map of maps) {
    if (primaryNormalizedName(map.normalizedName) !== primary) continue;
    for (const lock of map.locks ?? []) {
      const k = lock.key;
      if (!k?.id) continue;
      if (!byId.has(k.id)) {
        byId.set(k.id, {
          id: k.id,
          name: k.name,
          shortName: k.shortName ?? "",
          iconLink: k.iconLink ?? null,
          basePrice: k.basePrice ?? null,
        });
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}
