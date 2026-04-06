/**
 * tarkov.dev hosts static map previews and interactive maps.
 * Paths align with https://github.com/the-hideout/tarkov-dev/blob/main/src/data/maps.json
 * (`primaryPath` where it differs from `/map/:normalizedName`).
 */
const MAP_PAGE_PATH: Record<string, string> = {
  factory: "/map/factory-3d",
  interchange: "/map/interchange-2d",
  "the-lab": "/map/labs-2d",
  "the-labyrinth": "/map/labyrinth",
  lighthouse: "/map/lighthouse-2d-landscape",
  reserve: "/map/reserve-3d",
  shoreline: "/map/shoreline-2d",
  woods: "/map/woods-2d",
  "ground-zero-21": "/map/ground-zero-21",
};

const TARKOV_ORIGIN = "https://tarkov.dev";

/** Full interactive map on tarkov.dev (layers, markers, filters). */
export function tarkovInteractiveMapUrl(mapNormalizedName: string): string {
  const path = MAP_PAGE_PATH[mapNormalizedName] ?? `/map/${mapNormalizedName}`;
  return `${TARKOV_ORIGIN}${path}`;
}
