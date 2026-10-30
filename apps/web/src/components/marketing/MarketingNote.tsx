import type { ReactNode } from "react";

/** Narrative information is open content, not a replica of an issued ticket. */
export function MarketingNote({ kicker, title, detail }: { kicker: string; title: ReactNode; detail: ReactNode; stub?: string; stubLabel?: string }) {
  return <article className="marketing-note"><p>{kicker}</p><h3>{title}</h3><p>{detail}</p></article>;
}
