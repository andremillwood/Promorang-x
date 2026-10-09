import { describe, expect, it } from "vitest";
import { resolvePromoCardFace } from "@promorang/shared";
import { localizePromoCardFace } from "./promocard-copy";
import { translations } from "./translations";

describe.each(["es-419", "pt-BR"] as const)("PromoCard presentation in %s", (locale) => {
  const t = (key: keyof typeof translations.en, variables: Record<string, string | number> = {}) =>
    translations[locale][key].replace(/\{\{(\w+)\}\}/g, (_, name) => String(variables[name] ?? ""));
  it("translates empty-card system copy", () => {
    const face = localizePromoCardFace(resolvePromoCardFace(), t);
    expect(face.headline).toBe(t("web.faceEmpty"));
    expect(face.detail).toBe(t("web.faceEmptyDetail"));
    expect(face.action).toBe(t("web.faceBrowse"));
    expect(face.holder).toBe(t("web.yourCard"));
  });
  it("translates ready controls but preserves merchant content and the redeemable credential", () => {
    const original = resolvePromoCardFace({ holder: "Maya", useThis: { title: "Coffee on us", issuer: { name: "Sea Deck" }, redemptionCode: "SAFE-1234", fulfillmentType: "code" } });
    const face = localizePromoCardFace(original, t);
    expect(face.headline).toBe(t("web.faceCodeReady"));
    expect(face.action).toBe(t("web.faceCopyCode"));
    expect(face.detail).toBe("Coffee on us");
    expect(face.issuer).toBe("Sea Deck");
    expect(face.credential).toBe(original.credential);
    expect(face.canFlip).toBe(original.canFlip);
  });
  it.each([1, 2])("uses a complete localized participating-place phrase for %s", (count) => {
    const face = localizePromoCardFace(resolvePromoCardFace({ nearbyCount: count }), t);
    expect(face.places).toBe(t(count === 1 ? "web.facePlace" : "web.facePlaces", { count }));
  });
});
