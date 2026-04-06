import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  src: string | null;
  caption?: string;
  onClose: () => void;
};

export function ImageLightbox({ open, src, caption, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !src) {
    return null;
  }

  return createPortal(
    <div
      className="image-lightbox-overlay"
      role="presentation"
      onClick={onClose}
    >
      <button
        type="button"
        className="image-lightbox-close"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
      <div
        className="image-lightbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Full screen image"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={caption ?? ""}
          className="image-lightbox-img"
          draggable={false}
        />
        {caption ? <p className="image-lightbox-caption">{caption}</p> : null}
      </div>
    </div>,
    document.body,
  );
}
