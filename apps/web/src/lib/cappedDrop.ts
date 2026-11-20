import { DEFAULT_CAPPED_DROP_CAP } from "@promorang/shared";

/** Poll while the tab is visible. Hidden tabs wait. */
export const CAPPED_DROP_POLL_MS = 5_000;

export function cappedDropPollInterval(visible: boolean): number | false {
  return visible ? CAPPED_DROP_POLL_MS : false;
}

export type CappedDropCounts = {
  cap: number;
  remaining: number;
  status?: string | null;
  sold_out?: boolean | null;
};

/**
 * Remaining comes from the server. This only decides which true sentence to show.
 * "Almost gone" is allowed only when remaining is at most 10% of the cap.
 */
export function cappedDropView(drop: CappedDropCounts) {
  const cap = Number(drop.cap);
  const remaining = Math.max(0, Number(drop.remaining));
  const full = drop.status === "full" || drop.sold_out === true || remaining <= 0;
  const almostGone = !full && cap > 0 && remaining > 0 && remaining * 10 <= cap;
  return { cap, remaining, full, almostGone };
}

export { DEFAULT_CAPPED_DROP_CAP };
