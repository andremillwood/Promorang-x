export const RESUMABLE_INTENT_KEY = "promorang_resumable_intent";

export type ResumableIntentKind =
  | "moment_join"
  | "offer_claim"
  | "commerce_purchase"
  | "commerce_save";

export type ResumableIntent = {
  kind: ResumableIntentKind;
  returnPath: string;
  targetId?: string | null;
  createdAt: number;
};

const MAX_AGE_MS = 45 * 60 * 1000;

function safePath(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function comparablePath(value: string) {
  try {
    const url = new URL(value, "https://promorang.local");
    return `${url.pathname}${url.search}`;
  } catch {
    return value.split("#")[0];
  }
}

export function rememberResumableIntent(input: Omit<ResumableIntent, "createdAt">) {
  if (typeof window === "undefined") return;
  const returnPath = safePath(input.returnPath);
  if (!returnPath) return;
  const intent: ResumableIntent = { ...input, returnPath, createdAt: Date.now() };
  sessionStorage.setItem(RESUMABLE_INTENT_KEY, JSON.stringify(intent));
}

export function readResumableIntent(currentPath?: string | null): ResumableIntent | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESUMABLE_INTENT_KEY);
  if (!raw) return null;
  try {
    const intent = JSON.parse(raw) as ResumableIntent;
    if (!intent?.kind || !safePath(intent.returnPath) || !Number.isFinite(intent.createdAt)) {
      sessionStorage.removeItem(RESUMABLE_INTENT_KEY);
      return null;
    }
    if (Date.now() - intent.createdAt > MAX_AGE_MS) {
      sessionStorage.removeItem(RESUMABLE_INTENT_KEY);
      return null;
    }
    if (currentPath && comparablePath(intent.returnPath) !== comparablePath(currentPath)) return null;
    return intent;
  } catch {
    sessionStorage.removeItem(RESUMABLE_INTENT_KEY);
    return null;
  }
}

export function clearResumableIntent(match?: { kind?: ResumableIntentKind; targetId?: string | null }) {
  if (typeof window === "undefined") return;
  if (!match) {
    sessionStorage.removeItem(RESUMABLE_INTENT_KEY);
    return;
  }
  const intent = readResumableIntent();
  if (!intent) return;
  if (match.kind && intent.kind !== match.kind) return;
  if (match.targetId && intent.targetId && intent.targetId !== match.targetId) return;
  sessionStorage.removeItem(RESUMABLE_INTENT_KEY);
}

export function inferredResumableIntentForPath(returnPath: string): Omit<ResumableIntent, "createdAt"> | null {
  const path = comparablePath(returnPath).split("?")[0];
  const moment = path.match(/^\/moments\/([^/]+)\/?$/);
  if (moment) {
    return {
      kind: "moment_join",
      returnPath,
      targetId: decodeURIComponent(moment[1]),
    };
  }
  return null;
}

export function resumableIntentCopy(kind: ResumableIntentKind) {
  switch (kind) {
    case "moment_join":
      return { title: "Continue your RSVP", detail: "You’re back on the same Moment. Nothing was submitted while you signed in.", needles: ["join", "rsvp", "reserve"] };
    case "offer_claim":
      return { title: "Continue your claim", detail: "You’re back on the same offer. Eligibility and issuance still happen only when you claim.", needles: ["claim"] };
    case "commerce_purchase":
      return { title: "Continue your reservation", detail: "You’re back on the same item. No purchase or reservation was created during sign-in.", needles: ["reserve", "buy", "pay", "purchase"] };
    case "commerce_save":
      return { title: "Continue saving this", detail: "You’re back where you started. Saving still requires your explicit action.", needles: ["save", "bookmark"] };
  }
}
