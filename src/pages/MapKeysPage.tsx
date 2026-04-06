import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { gql } from "../api/tarkov";
import { MAPS_WITH_KEY_DETAILS } from "../api/queries";
import type { MapWithLocks, MapsWithKeyDetailsResponse } from "../api/types";
import { KeyResultRow } from "../components/KeyResultRow";
import { ExternalLink } from "../components/ExternalLink";
import { pickMapMetaForPrimary, primaryNormalizedName } from "../lib/mapBrowse";
import { keysForMap } from "../lib/mapLocks";
import { tarkovInteractiveMapUrl } from "../lib/tarkovMapUrls";

export function MapKeysPage() {
  const { normalizedName: normalizedNameParam } = useParams<{
    normalizedName: string;
  }>();
  const navigate = useNavigate();
  const normalizedName = normalizedNameParam
    ? decodeURIComponent(normalizedNameParam)
    : "";

  const [maps, setMaps] = useState<MapWithLocks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gql<MapsWithKeyDetailsResponse>(MAPS_WITH_KEY_DETAILS);
      setMaps(data.maps ?? []);
    } catch (e) {
      setMaps([]);
      setError(e instanceof Error ? e.message : "Failed to load maps.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!normalizedNameParam) {
    return null;
  }

  if (loading) {
    return (
      <div className="page map-keys-page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page map-keys-page">
        <p className="error">{error}</p>
        <Link to="/" className="back-link">
          ← Back to search
        </Link>
      </div>
    );
  }

  const primary = primaryNormalizedName(normalizedName);
  const mapMeta = pickMapMetaForPrimary(maps, primary);
  const keys = keysForMap(maps, primary);

  if (!mapMeta) {
    return (
      <div className="page map-keys-page">
        <p className="error">Map not found.</p>
        <Link to="/" className="back-link">
          ← Back to search
        </Link>
      </div>
    );
  }

  const mapUrl = tarkovInteractiveMapUrl(primary);

  return (
    <div className="page map-keys-page">
      <nav className="detail-nav">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link to="/" className="nav-home">
          Search
        </Link>
      </nav>

      <header className="map-keys-header">
        <h1>{mapMeta.name}</h1>
        <p className="muted map-keys-sub">
          Keys that open locks on this map ({keys.length})
          {" · "}
          <ExternalLink href={mapUrl}>Interactive map</ExternalLink>
        </p>
      </header>

      {keys.length === 0 ? (
        <p className="muted">No keys listed for this map in the API.</p>
      ) : (
        <ul className="result-list" role="list">
          {keys.map((k) => (
            <li key={k.id}>
              <KeyResultRow
                hit={k}
                onSelect={() => navigate(`/key/${k.id}`)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
