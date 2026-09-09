export type DiscoverySignalKind = "demand" | "live_offer";

export function pollSignalKind(
  poll?: { signalKind?: DiscoverySignalKind } | null,
): DiscoverySignalKind {
  return poll?.signalKind === "live_offer" ? "live_offer" : "demand";
}

export function pollHasRedeemablePerk(
  poll?: { signalKind?: DiscoverySignalKind } | null,
): boolean {
  return pollSignalKind(poll) === "live_offer";
}
