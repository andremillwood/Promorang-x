/** Forbidden jargon in member-facing product copy. See DESIGN.md and object-surfaces. */
export const FORBIDDEN_MEMBER_WORDS = [
  "amm",
  "apy",
  "capital allocator",
  "coupon",
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
  "nextMove.",
  "empty.",
  "receipt.proved",
  "receipt.unlocked",
  "receipt.next",
  "promoshare.heroEyebrow",
  "promoshare.yieldMultiplier",
  "promoshare.noReceipts",
  "piecePortfolio.heroTitle",
  "piecePortfolio.heroSubtitle",
  "growthHub.benefitCard4Title",
  "growthHub.benefitCard4Text",
  "growthHub.tileKickstartText",
  "vaultPage.title",
  "vaultPage.subtitle",
  "momentDetail.giftAPass",
  "rsvp.giftIntro",
  "guestPassPage.giftCopy",
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
