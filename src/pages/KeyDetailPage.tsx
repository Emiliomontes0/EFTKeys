import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { gql } from "../api/tarkov";
import { KEY_DETAIL } from "../api/queries";
import type { KeyDetailResponse, KeyItemDetail } from "../api/types";
import { ExternalLink } from "../components/ExternalLink";
import { WikiGallerySection } from "../components/WikiGallerySection";
import { formatPercent, formatRub, formatKg } from "../lib/format";
import { locksForKey } from "../lib/mapLocks";
import { tarkovInteractiveMapUrl } from "../lib/tarkovMapUrls";

export function KeyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<KeyItemDetail | null>(null);
  const [maps, setMaps] = useState<KeyDetailResponse["maps"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (keyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await gql<KeyDetailResponse>(KEY_DETAIL, { id: keyId });
      if (!data.item) {
        setItem(null);
        setMaps([]);
        setError("Key not found.");
        return;
      }
      setItem(data.item);
      setMaps(data.maps ?? []);
    } catch (e) {
      setItem(null);
      setMaps([]);
      setError(e instanceof Error ? e.message : "Failed to load key.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Missing key id.");
      setLoading(false);
      return;
    }
    void load(id);
  }, [id, load]);

  if (!id) {
    return null;
  }

  if (loading) {
    return (
      <div className="page detail-page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="page detail-page">
        <p className="error">{error ?? "Unknown error."}</p>
        <Link to="/" className="back-link">
          ← Back to search
        </Link>
      </div>
    );
  }

  const lockRows = locksForKey(maps, item.id);
  const uses = item.properties?.uses ?? null;

  return (
    <div className="page detail-page">
      <nav className="detail-nav">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link to="/" className="nav-home">
          Search
        </Link>
      </nav>

      <header className="detail-header">
        {item.iconLink && (
          <img
            className="detail-icon"
            src={item.iconLink}
            width={96}
            height={96}
            alt=""
          />
        )}
        <div>
          <h1>{item.name}</h1>
          {item.shortName && <p className="detail-short">{item.shortName}</p>}
        </div>
      </header>

      {item.description && (
        <section className="detail-section">
          <h2>Description</h2>
          <p>{item.description}</p>
        </section>
      )}

      {item.wikiLink && <WikiGallerySection wikiUrl={item.wikiLink} />}

      <section className="detail-section">
        <h2>Overview</h2>
        <dl className="detail-dl">
          <dt>Weight</dt>
          <dd>{formatKg(item.weight)}</dd>
          <dt>Size (slots)</dt>
          <dd>
            {item.width ?? "—"} × {item.height ?? "—"}
          </dd>
          <dt>Uses</dt>
          <dd>{uses != null ? uses : "—"}</dd>
          <dt>Categories</dt>
          <dd>
            {item.categories?.map((c) => c.name).filter(Boolean).join(", ") || "—"}
          </dd>
          <dt>Handbook</dt>
          <dd>
            {item.handbookCategories?.map((c) => c.name).filter(Boolean).join(", ") ||
              "—"}
          </dd>
          <dt>Types</dt>
          <dd>{item.types?.length ? item.types.join(", ") : "—"}</dd>
          <dt>Base price</dt>
          <dd>{formatRub(item.basePrice)}</dd>
        </dl>
      </section>

      <section className="detail-section">
        <h2>Flea market</h2>
        <dl className="detail-dl">
          <dt>Avg 24h</dt>
          <dd>{formatRub(item.avg24hPrice)}</dd>
          <dt>Last low</dt>
          <dd>{formatRub(item.lastLowPrice)}</dd>
          <dt>24h range</dt>
          <dd>
            {formatRub(item.low24hPrice)} – {formatRub(item.high24hPrice)}
          </dd>
          <dt>Change 48h</dt>
          <dd>
            {item.changeLast48h != null ? formatRub(item.changeLast48h) : "—"} (
            {formatPercent(item.changeLast48hPercent)})
          </dd>
          <dt>Last offer count</dt>
          <dd>{item.lastOfferCount ?? "—"}</dd>
          <dt>Min flea level</dt>
          <dd>{item.minLevelForFlea ?? "—"}</dd>
          <dt>Flea fee (est.)</dt>
          <dd>{formatRub(item.fleaMarketFee)}</dd>
        </dl>
      </section>

      <section className="detail-section">
        <h2>Buy & sell</h2>
        <div className="two-col">
          <div>
            <h3 className="h3">Sell for</h3>
            <table className="price-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {(item.sellFor ?? []).map((row, i) => (
                  <tr key={`${row.source}-${i}`}>
                    <td>{row.source}</td>
                    <td>
                      {row.price.toLocaleString()} {row.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="h3">Buy for</h3>
            <table className="price-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {(item.buyFor ?? []).map((row, i) => (
                  <tr key={`${row.source}-${i}`}>
                    <td>{row.source}</td>
                    <td>
                      {row.price.toLocaleString()} {row.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {lockRows.length > 0 && (
        <section className="detail-section">
          <h2>Lock locations ({lockRows.length})</h2>
          <p className="muted small">
            Data from tarkov.dev. Use the interactive map link for exact doors and layers. World
            coordinates are in-game reference values.
          </p>
          <div className="lock-locations-scroll">
          <table className="data-table lock-locations-table">
            <thead>
              <tr>
                <th>Map</th>
                <th>Type</th>
                <th>Power</th>
                <th>World position (x, y, z)</th>
                <th>Interactive map</th>
              </tr>
            </thead>
            <tbody>
              {lockRows.map((row, i) => {
                const mapPage = tarkovInteractiveMapUrl(row.mapNormalizedName);
                return (
                  <tr key={`${row.mapNormalizedName}-${i}-${row.position?.x ?? "p"}`}>
                    <td>{row.mapName}</td>
                    <td>{row.lockType ?? "—"}</td>
                    <td>{row.needsPower ? "Required" : "Not required"}</td>
                    <td className="mono">
                      {row.position
                        ? `${row.position.x.toFixed(2)}, ${row.position.y.toFixed(2)}, ${row.position.z.toFixed(2)}`
                        : "—"}
                    </td>
                    <td>
                      <ExternalLink href={mapPage}>Open</ExternalLink>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </section>
      )}

      {(item.usedInTasks?.length ?? 0) > 0 && (
        <section className="detail-section">
          <h2>Used in tasks</h2>
          <ul className="bullet-list">
            {item.usedInTasks!.map((t) => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
        </section>
      )}

      {(item.receivedFromTasks?.length ?? 0) > 0 && (
        <section className="detail-section">
          <h2>Received from tasks</h2>
          <ul className="bullet-list">
            {item.receivedFromTasks!.map((t) => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
        </section>
      )}

      {(item.bartersFor?.length ?? 0) > 0 && (
        <section className="detail-section">
          <h2>Barters (reward)</h2>
          <ul className="barter-list">
            {item.bartersFor!.map((b) => (
              <li key={b.id}>
                <strong>{b.trader?.name ?? "?"}</strong> L{b.level ?? "?"}
                {b.taskUnlock?.name && (
                  <span className="muted"> — requires {b.taskUnlock.name}</span>
                )}
                <div className="small muted">
                  Give:{" "}
                  {b.requiredItems
                    .map((r) => `${r.count}× ${r.item.name}`)
                    .join(", ")}{" "}
                  → Get:{" "}
                  {b.rewardItems.map((r) => `${r.count}× ${r.item.name}`).join(", ")}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(item.bartersUsing?.length ?? 0) > 0 && (
        <section className="detail-section">
          <h2>Barters (this key required)</h2>
          <ul className="barter-list">
            {item.bartersUsing!.map((b) => (
              <li key={b.id}>
                <strong>{b.trader?.name ?? "?"}</strong> L{b.level ?? "?"}
                <div className="small muted">
                  {b.requiredItems.map((r) => `${r.count}× ${r.item.name}`).join(", ")}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(item.craftsFor?.length ?? 0) > 0 && (
        <section className="detail-section">
          <h2>Crafts (output)</h2>
          <ul className="barter-list">
            {item.craftsFor!.map((c) => (
              <li key={c.id}>
                {c.station?.name ?? "Station"} L{c.level ?? "?"} — {c.duration ?? "?"}s
                <div className="small muted">
                  In:{" "}
                  {c.requiredItems.map((r) => `${r.count}× ${r.item.name}`).join(", ")}{" "}
                  → Out:{" "}
                  {c.rewardItems.map((r) => `${r.count}× ${r.item.name}`).join(", ")}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(item.craftsUsing?.length ?? 0) > 0 && (
        <section className="detail-section">
          <h2>Crafts (input)</h2>
          <ul className="barter-list">
            {item.craftsUsing!.map((c) => (
              <li key={c.id}>
                {c.station?.name ?? "Station"} L{c.level ?? "?"} — {c.duration ?? "?"}s
                <div className="small muted">
                  {c.requiredItems.map((r) => `${r.count}× ${r.item.name}`).join(", ")}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(item.conflictingItems?.length ?? 0) > 0 && (
        <section className="detail-section">
          <h2>Conflicts with</h2>
          <ul className="bullet-list">
            {item.conflictingItems!.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="detail-section">
        <h2>Links</h2>
        <ul className="link-list">
          {item.link && (
            <li>
              <ExternalLink href={item.link}>tarkov.dev item page</ExternalLink>
            </li>
          )}
          {item.wikiLink && (
            <li>
              <ExternalLink href={item.wikiLink}>Wiki</ExternalLink>
            </li>
          )}
          {item.gridImageLink && (
            <li>
              <ExternalLink href={item.gridImageLink}>Grid image</ExternalLink>
            </li>
          )}
          {item.image512pxLink && (
            <li>
              <ExternalLink href={item.image512pxLink}>512px image</ExternalLink>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
