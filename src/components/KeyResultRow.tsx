import type { KeySearchHit } from "../api/types";
import { formatRub } from "../lib/format";

type Props = {
  hit: KeySearchHit;
  onSelect: () => void;
  /** Search results: show which maps use this key. Omit on single-map browse. */
  mapNames?: string[];
};

export function KeyResultRow({ hit, onSelect, mapNames }: Props) {
  return (
    <button type="button" className="result-row" onClick={onSelect}>
      {hit.iconLink ? (
        <img
          src={hit.iconLink}
          alt=""
          className="result-icon"
          width={48}
          height={48}
        />
      ) : (
        <span className="result-icon placeholder" aria-hidden />
      )}
      <span className="result-text">
        <span className="result-name">{hit.name}</span>
        <span className="result-meta">
          {hit.shortName}
          {hit.basePrice != null && (
            <span className="result-price">
              {" · "}
              {formatRub(hit.basePrice)} base
            </span>
          )}
        </span>
        {mapNames !== undefined && (
          <span className="result-maps">
            {mapNames.length > 0
              ? `Maps: ${mapNames.join(" · ")}`
              : "No map locks listed"}
          </span>
        )}
      </span>
    </button>
  );
}
