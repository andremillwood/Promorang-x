export type CommerceOutcomeRecord = {
  awarded?: boolean;
  id?: string | null;
  event_id?: string | null;
  asset_id?: string | null;
  quantity?: number | null;
};

export type CommerceReceiptPresentationInput = {
  receiptType?: string | null;
  status?: string | null;
  productName?: string | null;
  attribution?: {
    coupon_code?: string | null;
    commerce_outcomes?: {
      promoshare_ticket?: CommerceOutcomeRecord;
      moment_piece?: CommerceOutcomeRecord;
      content_piece?: CommerceOutcomeRecord;
    } | null;
  } | null;
};

export type ActionReceiptPresentation = {
  counted: boolean;
  eyebrow: string;
  headline: string;
  title: string;
  explanation: string;
  outcomes: Array<{ id: "commerce" | "promoshare" | "moment_piece" | "content_piece"; label: string; value: string }>;
};

export function resolveCommerceReceiptPresentation(input: CommerceReceiptPresentationInput): ActionReceiptPresentation {
  const status = input.status || "issued";
  const counted = !["cancelled", "refunded", "failed"].includes(status);
  const type = input.receiptType || "purchase";
  const title = input.productName || (type === "claim" ? "Offer claimed" : type === "redemption" ? "Offer redeemed" : type.replaceAll("_", " "));
  const outcomes = input.attribution?.commerce_outcomes;
  return {
    counted,
    eyebrow: counted ? "Promorang action receipt" : "Receipt updated",
    headline: counted ? "It counted" : status === "refunded" ? "Value returned" : "Action stopped",
    title,
    explanation: counted
      ? "This transaction is recorded and anything it opened stays connected to it."
      : "This record stays in Vault so the change remains accountable.",
    outcomes: [
      { id: "commerce", label: "Commerce", value: status },
      ...(outcomes?.promoshare_ticket?.awarded ? [{ id: "promoshare" as const, label: "PromoShare", value: `${outcomes.promoshare_ticket.quantity || 1} ticket earned` }] : []),
      ...(outcomes?.moment_piece?.awarded ? [{ id: "moment_piece" as const, label: "Moment Piece", value: `${outcomes.moment_piece.quantity || 1} added` }] : []),
      ...(outcomes?.content_piece?.awarded ? [{ id: "content_piece" as const, label: "Content Piece", value: `${outcomes.content_piece.quantity || 1} added` }] : []),
    ],
  };
}
