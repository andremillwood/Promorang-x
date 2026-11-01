import { canActOnBenefit, isExpiredBenefit } from "@promorang/shared";

/** Read-only presentation of issued access. Eligibility and fulfillment stay server-owned. */
export type CardAccess = {
 id: string; title: string; offerId?: string | null; expiresAt?: string | null;
 status?: string | null; fulfillmentState?: string | null; fulfillmentType?: string | null;
 redemptionCode?: string | null; redemption?: {recorded?: boolean; code?: string | null} | null;
 issuance?: {id?: string; status?: string | null; expires_at?: string | null; redemption_code?: string | null; redeemed_at?: string | null; offers?: {id?: string; fulfillment_type?: string | null}} | null;
};
export type AccessState = "ready" | "saved" | "pending" | "used" | "expired" | "unavailable" | "available";
export function cardAccessState(perk: CardAccess, now=Date.now()): AccessState {
 const state=perk.fulfillmentState || perk.issuance?.status || perk.status;
 if(perk.redemption?.recorded || perk.issuance?.redeemed_at || state === "redeemed" || state === "used")return "used";
 if(isExpiredBenefit(perk.expiresAt || perk.issuance?.expires_at,now) || state === "expired")return "expired";
 if(["revoked","cancelled","canceled","rejected"].includes(state || ""))return "unavailable";
 if(["pending","fulfillment_pending","processing"].includes(state || ""))return "pending";
 const type=perk.fulfillmentType || perk.issuance?.offers?.fulfillment_type || "merchant_validation";
 if(["manual","shipping","automatic"].includes(type) && ["claimed","issued"].includes(state || ""))return "pending";
 if(type === "qr" && !perk.issuance?.redemption_code && !perk.redemptionCode && !perk.redemption?.code)return "saved";
 if(canActOnBenefit({fulfillmentState:state === "issued" ? "claimed" : state,fulfillmentType:perk.fulfillmentType || perk.issuance?.offers?.fulfillment_type,expiresAt:perk.expiresAt || perk.issuance?.expires_at,redemption:{recorded:false,code:perk.redemption?.code || perk.redemptionCode || perk.issuance?.redemption_code}},now))return "ready";
 return ["claimed","issued"].includes(state || "") ? "saved" : "available";
}
export function summarizeCardAccess(rows: CardAccess[], now=Date.now()) {
 const unique=[...new Map(rows.filter(row=>row?.id).map(row=>[row.issuance?.id || row.id,row])).values()];
 const ready=unique.filter(row=>cardAccessState(row,now)==="ready");
 const saved=unique.filter(row=>["saved","pending"].includes(cardAccessState(row,now)));
 return {ready,saved,used:unique.filter(row=>cardAccessState(row,now)==="used"),expired:unique.filter(row=>cardAccessState(row,now)==="expired")};
}
export function findOwnedOffer(rows: CardAccess[],offerId:string) {
 return rows.find(row=>[row.offerId,row.issuance?.offers?.id,row.id].includes(offerId) && cardAccessState(row)!=="available");
}
