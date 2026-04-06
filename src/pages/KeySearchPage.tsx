import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql } from "../api/tarkov";
import { MAPS_LIST, SEARCH_KEYS } from "../api/queries";
import type {
  KeySearchHit,
  MapWithLocks,
  MapsListResponse,
  SearchKeysResponse,
} from "../api/types";
import { KeyResultRow } from "../components/KeyResultRow";
import { filterPrimaryMapsForBrowse } from "../lib/mapBrowse";
import { mapNamesForKey } from "../lib/mapLocks";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 320;

export function KeySearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [hits, setHits] = useState<KeySearchHit[]>([]);
  const [maps, setMaps] = useState<MapWithLocks[]>([]);
  const [mapList, setMapList] = useState<{ name: string; normalizedName: string }[]>(
    [],
  );
  const [mapsListLoading, setMapsListLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await gql<MapsListResponse>(MAPS_LIST);
        const list = filterPrimaryMapsForBrowse((data.maps ?? []).slice());
        list.sort((a, b) => a.name.localeCompare(b.name));
        if (!cancelled) setMapList(list);
      } catch {
        if (!cancelled) setMapList([]);
      } finally {
        if (!cancelled) setMapsListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(async (name: string) => {
    if (name.length < MIN_CHARS) {
      setHits([]);
      setMaps([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await gql<SearchKeysResponse>(SEARCH_KEYS, { name });
      setHits(data.items ?? []);
      setMaps(data.maps ?? []);
    } catch (e) {
      setHits([]);
      setMaps([]);
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void runSearch(debounced);
  }, [debounced, runSearch]);

  return (
    <div className="page search-page">
      <header className="page-header">
        <h1>EFT Keys</h1>
        <p className="muted">
          Search Tarkov mechanical keys by name (data from{" "}
          <a
            href="https://tarkov.dev"
            target="_blank"
            rel="noreferrer"
            className="inline-link"
          >
            tarkov.dev
          </a>
          ).
        </p>
      </header>

      <label className="search-field">
        <span className="sr-only">Key name</span>
        <input
          type="search"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. dorm, marked, KIBA…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <section className="map-browse" aria-labelledby="map-browse-heading">
        <h2 id="map-browse-heading" className="map-browse-title">
          Browse by map
        </h2>
        {mapsListLoading ? (
          <p className="muted small">Loading maps…</p>
        ) : mapList.length === 0 ? (
          <p className="muted small">Maps could not be loaded.</p>
        ) : (
          <ul className="map-grid" role="list">
            {mapList.map((m) => (
              <li key={m.normalizedName}>
                <button
                  type="button"
                  className="map-chip"
                  onClick={() =>
                    navigate(`/map/${encodeURIComponent(m.normalizedName)}`)
                  }
                >
                  {m.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {debounced.length > 0 && debounced.length < MIN_CHARS && (
        <p className="hint">Type at least {MIN_CHARS} characters.</p>
      )}

      {loading && <p className="muted">Searching…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && debounced.length >= MIN_CHARS && hits.length === 0 && (
        <p className="muted">No keys match that search.</p>
      )}

      <ul className="result-list" role="list">
        {hits.map((k) => (
          <li key={k.id}>
            <KeyResultRow
              hit={k}
              mapNames={mapNamesForKey(maps, k.id)}
              onSelect={() => navigate(`/key/${k.id}`)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
