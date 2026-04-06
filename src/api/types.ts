export type KeySearchHit = {
  id: string;
  name: string;
  shortName: string;
  iconLink: string | null;
  basePrice: number | null;
};

export type SearchKeysResponse = {
  items: KeySearchHit[];
  maps: MapWithLocks[];
};

export type MapsListResponse = {
  maps: { name: string; normalizedName: string }[];
};

export type MapsWithKeyDetailsResponse = {
  maps: MapWithLocks[];
};

export type ItemPriceOffer = {
  source: string;
  price: number;
  currency: string;
};

export type TaskRef = {
  id: string;
  name: string;
  normalizedName?: string | null;
};

export type ItemRef = {
  id: string;
  name: string;
  shortName?: string | null;
};

export type BarterRow = {
  id: string;
  level?: number | null;
  trader: { name: string } | null;
  taskUnlock?: { name: string } | null;
  requiredItems: { item: { name: string; shortName?: string | null }; count: number }[];
  rewardItems: { item: { name: string }; count: number }[];
};

export type BarterUsingRow = {
  id: string;
  level?: number | null;
  trader: { name: string } | null;
  requiredItems: { item: { name: string }; count: number }[];
};

export type CraftRow = {
  id: string;
  duration?: number | null;
  level?: number | null;
  station: { name: string } | null;
  requiredItems: { item: { name: string }; count: number }[];
  rewardItems: { item: { name: string }; count: number }[];
};

export type KeyItemDetail = {
  id: string;
  name: string;
  normalizedName: string | null;
  shortName: string | null;
  description: string | null;
  basePrice: number | null;
  weight: number | null;
  width: number | null;
  height: number | null;
  backgroundColor: string | null;
  iconLink: string | null;
  gridImageLink: string | null;
  image512pxLink: string | null;
  wikiLink: string | null;
  link: string | null;
  types: string[] | null;
  avg24hPrice: number | null;
  lastLowPrice: number | null;
  low24hPrice: number | null;
  high24hPrice: number | null;
  changeLast48h: number | null;
  changeLast48hPercent: number | null;
  lastOfferCount: number | null;
  minLevelForFlea: number | null;
  fleaMarketFee: number | null;
  conflictingItems: ItemRef[];
  /** Present for keys (`ItemPropertiesKey`). */
  properties: { uses?: number | null } | null;
  categories: { name: string }[];
  handbookCategories: { name: string }[];
  sellFor: ItemPriceOffer[];
  buyFor: ItemPriceOffer[];
  usedInTasks: TaskRef[];
  receivedFromTasks: { id: string; name: string }[];
  bartersFor: BarterRow[];
  bartersUsing: BarterUsingRow[];
  craftsFor: CraftRow[];
  craftsUsing: CraftRow[];
};

export type MapLockKeyRef = {
  id: string;
  name: string;
  shortName: string | null;
  /** Present when requested (e.g. map browse query). */
  iconLink?: string | null;
  basePrice?: number | null;
};

export type MapLockEntry = {
  lockType: string | null;
  needsPower: boolean | null;
  position: { x: number; y: number; z: number } | null;
  key: MapLockKeyRef | null;
};

export type MapWithLocks = {
  name: string;
  normalizedName: string;
  locks: MapLockEntry[] | null;
};

export type KeyDetailResponse = {
  item: KeyItemDetail | null;
  maps: MapWithLocks[];
};
