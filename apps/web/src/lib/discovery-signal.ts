export type DiscoverySignalKind = "question" | "demand" | "live_offer";

export function pollSignalKind(
  poll?: { signalKind?: DiscoverySignalKind } | null,
): DiscoverySignalKind {
  if (poll?.signalKind === "question") return "question";
  return poll?.signalKind === "live_offer" ? "live_offer" : "demand";
}

export function pollHasRedeemablePerk(
  poll?: { signalKind?: DiscoverySignalKind } | null,
): boolean {
  return pollSignalKind(poll) === "live_offer";
}
