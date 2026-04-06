import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ExternalLink } from "./ExternalLink";
import { ImageLightbox } from "./ImageLightbox";
import { captionFromWikiFilename } from "../lib/wikiCaption";

export type WikiGalleryImage = {
  url: string;
  filename: string;
  caption: string;
  category: string;
};

const CATEGORY_BADGE: Record<string, string> = {
  map: "Map overview",
  spawn: "Spawn / find key",
  world: "Lock location (in raid)",
};

type Props = {
  wikiUrl: string;
};

export function WikiGallerySection({ wikiUrl }: Props) {
  const [images, setImages] = useState<WikiGalleryImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setImages(null);

    (async () => {
      try {
        const list = await invoke<WikiGalleryImage[]>("wiki_gallery_images", {
          wikiUrl: wikiUrl.trim(),
        });
        if (!cancelled) {
          setImages(list);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [wikiUrl]);

  if (loading) {
    return (
      <section className="detail-section">
        <h2>Wiki — location & lock photos</h2>
        <p className="muted small">Loading gallery from the wiki…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="detail-section">
        <h2>Wiki — location & lock photos</h2>
        <p className="error small">{error}</p>
        <p className="muted small">
          <ExternalLink href={wikiUrl}>Open wiki page in browser</ExternalLink>
        </p>
      </section>
    );
  }

  if (!images || images.length === 0) {
    return (
      <section className="detail-section">
        <h2>Wiki — location & lock photos</h2>
        <p className="muted small">
          No <code className="wiki-code">gallery</code> images found on this wiki page.{" "}
          <ExternalLink href={wikiUrl}>View the wiki page</ExternalLink> for full details.
        </p>
      </section>
    );
  }

  return (
    <section className="detail-section">
      <h2>Wiki — location & lock photos</h2>
      <p className="muted small">
        Parsed from the wiki article’s image gallery (same HTML as on Fandom). Categories are
        guessed from each image’s caption — wording varies by page.
      </p>
      <ul className="wiki-gallery-grid">
        {images.map((img) => {
          const cap = img.caption || captionFromWikiFilename(img.filename);
          return (
            <li key={img.url}>
              <figure className="wiki-gallery-figure">
                <span className="wiki-gallery-badge">
                  {CATEGORY_BADGE[img.category] ?? img.category}
                </span>
                <button
                  type="button"
                  className="wiki-gallery-thumb"
                  onClick={() => setLightbox({ src: img.url, caption: cap })}
                  aria-label={`View full screen: ${cap}`}
                >
                  <img
                    src={img.url}
                    alt={cap}
                    className="wiki-gallery-img"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </button>
                <figcaption className="wiki-gallery-caption">{cap}</figcaption>
              </figure>
            </li>
          );
        })}
      </ul>

      <ImageLightbox
        open={lightbox !== null}
        src={lightbox?.src ?? null}
        caption={lightbox?.caption}
        onClose={() => setLightbox(null)}
      />
    </section>
  );
}
