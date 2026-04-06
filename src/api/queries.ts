/** Map names for the home screen browse grid. */
export const MAPS_LIST = `
  query MapsList {
    maps {
      name
      normalizedName
    }
  }
`;

/**
 * All maps with lock → key links including icon/price for listing keys per map.
 */
export const MAPS_WITH_KEY_DETAILS = `
  query MapsWithKeyDetails {
    maps {
      name
      normalizedName
      locks {
        key {
          id
          name
          shortName
          iconLink
          basePrice
        }
      }
    }
  }
`;

/** Search keys by partial name (Tarkov.dev GraphQL). */
export const SEARCH_KEYS = `
  query SearchKeys($name: String!) {
    items(categoryNames: ["Key"], name: $name, limit: 80) {
      id
      name
      shortName
      iconLink
      basePrice
    }
    maps {
      name
      normalizedName
      locks {
        key {
          id
        }
      }
    }
  }
`;

/** Full key detail + map lock locations that use this key. */
export const KEY_DETAIL = `
  query KeyDetail($id: ID!) {
    item(id: $id) {
      id
      name
      normalizedName
      shortName
      description
      basePrice
      weight
      width
      height
      backgroundColor
      iconLink
      gridImageLink
      image512pxLink
      wikiLink
      link
      types
      avg24hPrice
      lastLowPrice
      low24hPrice
      high24hPrice
      changeLast48h
      changeLast48hPercent
      lastOfferCount
      minLevelForFlea
      fleaMarketFee
      conflictingItems {
        id
        name
        shortName
      }
      properties {
        ... on ItemPropertiesKey {
          uses
        }
      }
      categories {
        name
      }
      handbookCategories {
        name
      }
      sellFor {
        source
        price
        currency
      }
      buyFor {
        source
        price
        currency
      }
      usedInTasks {
        id
        name
        normalizedName
      }
      receivedFromTasks {
        id
        name
      }
      bartersFor {
        id
        level
        trader {
          name
        }
        taskUnlock {
          name
        }
        requiredItems {
          item {
            name
            shortName
          }
          count
        }
        rewardItems {
          item {
            name
          }
          count
        }
      }
      bartersUsing {
        id
        level
        trader {
          name
        }
        requiredItems {
          item {
            name
          }
          count
        }
      }
      craftsFor {
        id
        duration
        level
        station {
          name
        }
        requiredItems {
          item {
            name
          }
          count
        }
        rewardItems {
          item {
            name
          }
          count
        }
      }
      craftsUsing {
        id
        duration
        level
        station {
          name
        }
        requiredItems {
          item {
            name
          }
          count
        }
        rewardItems {
          item {
            name
          }
          count
        }
      }
    }
    maps {
      name
      normalizedName
      locks {
        lockType
        needsPower
        position {
          x
          y
          z
        }
        key {
          id
          name
          shortName
        }
      }
    }
  }
`;
