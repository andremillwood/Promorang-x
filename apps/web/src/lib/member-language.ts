/** Forbidden jargon in member-facing product copy. See DESIGN.md and object-surfaces. */
export const FORBIDDEN_MEMBER_WORDS = [
  "amm",
  "capital allocator",
  "dau",
  "deflationary",
  "escrow",
  "flywheel",
  "mint",
  "on-chain",
  "on chain",
  "primitive",
  "roas",
  "stake",
  "sybil",
  "telemetry",
  "yield",
] as const;

/** Keys and prefixes that members actually read on product surfaces. */
export const MEMBER_COPY_SELECTORS = [
  "dest.",
  "todayPage.",
  "nextMove.",
  "empty.",
  "promoCardPage.",
  "discover.path",
  "demand.",
  "createHub.",
  "receipt.",
  "promoshare.heroEyebrow",
  "promoshare.yieldMultiplier",
  "promoshare.noReceipts",
  "piecePortfolio.heroTitle",
  "piecePortfolio.heroSubtitle",
  "growthHub.benefitCard4Title",
  "growthHub.benefitCard4Text",
  "growthHub.tileKickstartText",
  "vaultPage.verifiedOnChain",
] as const;

export function isMemberCopyKey(key: string): boolean {
  return MEMBER_COPY_SELECTORS.some((selector) => key.startsWith(selector));
}

export function forbiddenMemberWordsIn(text: string): string[] {
  const lower = text.toLowerCase();
  return FORBIDDEN_MEMBER_WORDS.filter((word) => {
    if (word.includes(" ")) return lower.includes(word);
    const pattern = new RegExp(`(^|[^a-z])${word}([^a-z]|$)`, "i");
    return pattern.test(lower);
  });
}
