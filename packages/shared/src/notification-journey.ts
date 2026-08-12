export type NotificationJourneyKind = "recognition" | "memory" | "scene" | "return" | "value" | "growth" | "moment" | "general";

export type NotificationJourneyInput = {
  type?: string | null;
  relatedId?: string | null;
  route?: string | null;
  momentId?: string | null;
  memoryId?: string | null;
  sceneSlug?: string | null;
  receiptId?: string | null;
  proposalId?: string | null;
  productId?: string | null;
};

export type NotificationJourneyPresentation = {
  kind: NotificationJourneyKind;
  eyebrow: string;
  destination: string;
  actionLabel: string;
};

const safeDirectRoute = (route?: string | null) => route?.startsWith("/") && !route.startsWith("//") ? route : null;

export function resolveNotificationJourney(input: NotificationJourneyInput): NotificationJourneyPresentation {
  const type = input.type || "";
  const direct = safeDirectRoute(input.route);
  if (direct) return { kind: "general", eyebrow: "FOR YOU", destination: direct, actionLabel: "Open update" };
  if (input.memoryId || (/memory|memorized|kept|access_expiring/i.test(type) && input.relatedId)) return { kind: "memory", eyebrow: /access_expiring/i.test(type) ? "USEFUL WHILE IT LASTS" : "KEPT FOR YOU", destination: `/memory/${input.memoryId || input.relatedId}`, actionLabel: "Open memory" };
  if (input.sceneSlug) return { kind: "scene", eyebrow: "YOUR SCENE", destination: `/scene/${input.sceneSlug}`, actionLabel: "Step into the Scene" };
  if (/scene|invitation|membership/i.test(type)) return { kind: "scene", eyebrow: "YOUR SCENE", destination: input.relatedId ? `/scene/${input.relatedId}` : "/scenes", actionLabel: "See the Scene" };
  if (input.receiptId) return { kind: "value", eyebrow: "WHAT RETURNED", destination: `/receipts/${input.receiptId}`, actionLabel: "Open receipt" };
  if (/commerce_(case|appeal)|purchase_refund|reward_restored/i.test(type) && input.relatedId) return { kind: "value", eyebrow: "WHAT RETURNED", destination: `/receipts/${input.relatedId}`, actionLabel: "Open outcome" };
  if (/reward|unlock|payout|ticket|value/i.test(type)) return { kind: "value", eyebrow: "WHAT RETURNED", destination: "/vault", actionLabel: "See what opened" };
  if (/proof_approved|recognized|recognition|verified/i.test(type)) return { kind: "recognition", eyebrow: "IT COUNTED", destination: input.momentId || input.relatedId ? `/moment/${input.momentId || input.relatedId}` : "/progress", actionLabel: "See what changed" };
  if (/return|reminder|starting|upcoming|check.?in/i.test(type)) return { kind: "return", eyebrow: "COMING BACK INTO VIEW", destination: input.momentId || input.relatedId ? `/moment/${input.momentId || input.relatedId}` : "/discover", actionLabel: "See what is next" };
  if (/moment|proof/i.test(type) || input.momentId) return { kind: "moment", eyebrow: "YOUR MOMENT", destination: input.momentId || input.relatedId ? `/moment/${input.momentId || input.relatedId}` : "/discover", actionLabel: "Open Moment" };
  if (/share|growth|distribution|referral/i.test(type)) return { kind: "growth", eyebrow: "YOUR STORY TRAVELLED", destination: "/promoshare", actionLabel: "See what moved" };
  if (input.proposalId) return { kind: "general", eyebrow: "YOUR PROPOSAL", destination: `/proposal/${input.proposalId}`, actionLabel: "Open proposal" };
  if (input.productId) return { kind: "general", eyebrow: "FOR YOU", destination: `/product/${input.productId}`, actionLabel: "Open offer" };
  return { kind: "general", eyebrow: "FOR YOU", destination: "/inbox", actionLabel: "Open update" };
}
