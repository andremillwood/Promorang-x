export type AccessQuote = {
  rule_id: string | null;
  object_type: string;
  object_id: string;
  access_type: string;
  tier_key: string;
  base_key_cost: number;
  raw_key_cost: number;
  final_key_cost: number;
  key_cost_multiplier: number;
  allowed: boolean;
  denial_reason: string | null;
  already_unlocked: boolean;
  fallback_applied?: boolean;
};

export type AccessStateKey = "available" | "needs_keys" | "requires_plus" | "full" | "unlocked" | "blocked";

export type AccessState = {
  key: AccessStateKey;
  label: "Available" | "Needs Keys" | "Requires Plus" | "Full" | "Unlocked" | "Unavailable";
  description: string;
  ctaLabel: string;
  canAttempt: boolean;
};

export function getAccessState(quote: AccessQuote | null | undefined): AccessState {
  if (!quote) {
    return {
      key: "available",
      label: "Available",
      description: "This moment is open. Join when you are ready to be part of it.",
      ctaLabel: "Join This Moment",
      canAttempt: true,
    };
  }

  if (quote.already_unlocked) {
    return {
      key: "unlocked",
      label: "Unlocked",
      description: "Your access is secured. The next step is to show up and leave a verified mark.",
      ctaLabel: "Open Access",
      canAttempt: true,
    };
  }

  if (!quote.allowed) {
    if (quote.denial_reason === "capacity_full") {
      return {
        key: "full",
        label: "Full",
        description: "This room is at capacity, so the value of the experience stays protected for the people already inside.",
        ctaLabel: "Full",
        canAttempt: false,
      };
    }

    if (quote.denial_reason === "tier_required" || quote.denial_reason === "cash_gem_eligible_tier_required") {
      return {
        key: "requires_plus",
        label: "Requires Plus",
        description: "This opportunity is reserved for people with Plus or earned Plus standing.",
        ctaLabel: "Requires Plus",
        canAttempt: false,
      };
    }

    return {
      key: "blocked",
      label: "Unavailable",
      description: "Access is not open right now. The host may be protecting timing, capacity, or eligibility.",
      ctaLabel: "Unavailable",
      canAttempt: false,
    };
  }

  if (Number(quote.final_key_cost || 0) > 0) {
    const keys = Number(quote.final_key_cost || 0);
    return {
      key: "needs_keys",
      label: "Needs Keys",
      description: `${keys} ${keys === 1 ? "Key" : "Keys"} required. Keys help protect limited access for people who are ready to show up.`,
      ctaLabel: `Spend ${keys} ${keys === 1 ? "Key" : "Keys"}`,
      canAttempt: true,
    };
  }

  return {
    key: "available",
    label: "Available",
    description: "No Keys required. This moment is open for participation.",
    ctaLabel: "Join This Moment",
    canAttempt: true,
  };
}
