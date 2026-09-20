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

function recordedQuantity(record?: CommerceOutcomeRecord | null, singular = "recorded", plural = "recorded") {
  const quantity = Number(record?.quantity);
  if (Number.isFinite(quantity) && quantity > 0) return `${quantity} ${quantity === 1 ? singular : plural}`;
  return singular;
}

export function resolveCommerceReceiptPresentation(input: CommerceReceiptPresentationInput): ActionReceiptPresentation {
  const status = input.status || "issued";
  const stopped = ["cancelled", "refunded", "failed"].includes(status);
  const complete = ["fulfilled", "redeemed"].includes(status);
  const counted = !stopped;
  const type = input.receiptType || "purchase";
  const title = input.productName || (type === "claim" ? "Offer claim" : type === "redemption" ? "Offer redemption" : type.replaceAll("_", " "));
  const outcomes = input.attribution?.commerce_outcomes;

  let headline = "Recorded, not complete";
  let explanation = "This commerce record exists, but later payment, redemption or fulfillment states are not implied.";

  if (status === "refunded") {
    headline = "Value returned";
    explanation = "The refund is recorded. The original commerce history remains attached for accountability.";
  } else if (status === "cancelled" || status === "failed") {
    headline = "Action stopped";
    explanation = "This record remains in history, but it does not represent a completed purchase or fulfillment.";
  } else if (complete) {
    headline = type === "redemption" ? "Redemption recorded" : "Completed";
    explanation = type === "redemption"
      ? "The redemption is recorded. It does not by itself prove a separate purchase."
      : "The recorded commerce journey reached its completed state.";
  } else if (type === "claim") {
    headline = "Claim recorded";
    explanation = "The offer claim is recorded. Redemption, purchase and fulfillment are separate downstream states.";
  } else if (type === "reservation") {
    headline = "Reservation recorded";
    explanation = "The reservation is recorded. Payment, purchase and fulfillment are not implied.";
  } else if (type === "purchase") {
    headline = "Purchase recorded";
    explanation = "The purchase record exists. Fulfillment remains separate until the receipt reaches a fulfilled state.";
  }

  return {
    counted,
    eyebrow: stopped ? "Receipt updated" : "Promorang action receipt",
    headline,
    title,
    explanation,
    outcomes: [
      { id: "commerce", label: "Commerce", value: status },
      ...(outcomes?.promoshare_ticket?.awarded ? [{ id: "promoshare" as const, label: "PromoShare", value: recordedQuantity(outcomes.promoshare_ticket, "ticket recorded", "tickets recorded") }] : []),
      ...(outcomes?.moment_piece?.awarded ? [{ id: "moment_piece" as const, label: "Moment Piece", value: recordedQuantity(outcomes.moment_piece, "Piece recorded", "Pieces recorded") }] : []),
      ...(outcomes?.content_piece?.awarded ? [{ id: "content_piece" as const, label: "Content Piece", value: recordedQuantity(outcomes.content_piece, "Piece recorded", "Pieces recorded") }] : []),
    ],
  };
}
