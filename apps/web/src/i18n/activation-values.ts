import type { TranslationKey } from "./translations";

type Translate = (key: TranslationKey) => string;

const keys: Record<string, TranslationKey> = {
  platform_revenue: "web.activationEnum.platform_revenue",
  participant_value: "web.activationEnum.participant_value",
  distribution: "web.activationEnum.distribution",
  distributor: "web.activationEnum.distributor",
  media: "web.activationEnum.media",
  service_provider: "web.activationEnum.service_provider",
  agency: "web.activationEnum.agency",
  operator: "web.activationEnum.operator",
  tax: "web.activationEnum.tax",
  other_fulfillment: "web.activationEnum.other_fulfillment",
  reservation: "web.activationEnum.reservation",
  purchase: "web.activationEnum.purchase",
  attendance: "web.activationEnum.attendance",
  redemption: "web.activationEnum.redemption",
  repeat_purchase: "web.activationEnum.repeat_purchase",
  shipping: "web.activationEnum.shipping",
  merchant_validation: "web.activationEnum.merchant_validation",
  automatic: "web.activationEnum.automatic",
  code: "web.activationEnum.code",
  qr: "web.activationEnum.qr",
  impression: "web.activationEnum.impression",
  click: "web.activationEnum.click",
  scan: "web.activationEnum.scan",
  join: "web.activationEnum.join",
  move_completed: "web.activationEnum.move_completed",
  proof_submitted: "web.activationEnum.proof_submitted",
  proof_verified: "web.activationEnum.proof_verified",
  reward_issued: "web.activationEnum.reward_issued",
  geo_interaction: "web.activationEnum.geo_interaction",
};

/** Localize known protocol values only; never alter values sent to the API. */
export function activationValueLabel(t: Translate, value: string): string {
  return Object.prototype.hasOwnProperty.call(keys, value) ? t(keys[value]) : value;
}
