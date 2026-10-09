import type { PromoCardFaceModel } from "@promorang/shared";
import type { TranslationKey } from "./translations";
import { webEn } from "./web-copy";

type Translate = (key: TranslationKey, variables?: Record<string, string | number>) => string;

// The shared model remains language-neutral at the web boundary: translate only its
// known system copy. Merchant titles, issuer names, credentials and identifiers stay intact.
const systemKeys = [
  "web.yourCard",
  "web.faceEmpty",
  "web.faceEmptyDetail",
  "web.faceBrowse",
  "web.faceNoBenefit",
  "web.faceYourCard",
  "web.faceNearby",
  "web.faceNearbyDetail",
  "web.faceClaimFirst",
  "web.faceClaimUse",
  "web.facePlaces",
  "web.facePlace",
  "web.faceReturned",
  "web.faceEligible",
  "web.faceEligibility",
  "web.faceNoNewPerk",
  "web.faceReturnRecorded",
  "web.faceUsed",
  "web.faceMerchantRecorded",
  "web.faceComeBack",
  "web.faceRecorded",
  "web.facePunched",
  "web.faceLapsed",
  "web.faceWindowClosed",
  "web.faceFindAnother",
  "web.faceExpired",
  "web.faceExpiredDoor",
  "web.faceLivePerk",
  "web.faceIssuer",
  "web.faceOnWay",
  "web.faceTrack",
  "web.faceDeliveredUse",
  "web.facePacking",
  "web.faceAddressReceived",
  "web.faceShipNext",
  "web.faceNeedsAddress",
  "web.faceAddAddress",
  "web.faceShips",
  "web.faceCredited",
  "web.faceOnCard",
  "web.faceNoScan",
  "web.faceWaiting",
  "web.faceIssuerConfirms",
  "web.faceHandoff",
  "web.faceCodeReady",
  "web.faceCopyCode",
  "web.facePasteCode",
  "web.faceShow",
  "web.faceShowQr",
  "web.faceShowCode",
  "web.faceValidateFirst",
] as const;
const systemCopy = new Map<string, TranslationKey>(systemKeys.map(key => [webEn[key], key]));

export function localizePromoCardFace(model: PromoCardFaceModel, t: Translate): PromoCardFaceModel {
  const text = (value: string) => {
    const key = systemCopy.get(value);
    return key ? t(key) : value;
  };
  const places = model.places.match(/^(\d+) participating (place|places)$/);
  return {
    ...model,
    holder: text(model.holder),
    headline: text(model.headline),
    detail: text(model.detail),
    action: text(model.action),
    footerCue: text(model.footerCue),
    places: places ? t(Number(places[1]) === 1 ? "web.facePlace" : "web.facePlaces", { count: places[1] }) : text(model.places),
  };
}
