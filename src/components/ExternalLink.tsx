import type { ReactNode } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function ExternalLink({ href, children, className }: Props) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noreferrer"
      onClick={async (e) => {
        e.preventDefault();
        try {
          await openUrl(href);
        } catch {
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }}
    >
      {children}
    </a>
  );
}
