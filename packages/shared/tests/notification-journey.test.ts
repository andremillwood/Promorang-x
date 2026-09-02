import { describe, expect, it } from "vitest";
import { resolveNotificationJourney } from "../src/notification-journey";

describe("resolveNotificationJourney", () => {
  it("opens a kept memory rather than the general Vault", () => expect(resolveNotificationJourney({ type: "memory_kept", relatedId: "memory-1" }).destination).toBe("/memory/memory-1"));
  it("opens the recognized Moment", () => expect(resolveNotificationJourney({ type: "proof_approved", relatedId: "moment-1" }).destination).toBe("/moment/moment-1"));
  it("opens a canonical Scene slug", () => expect(resolveNotificationJourney({ type: "scene_invitation", sceneSlug: "kingston-after-dark" }).destination).toBe("/scene/kingston-after-dark"));
  it("opens the memory carrying expiring access", () => expect(resolveNotificationJourney({ type: "access_expiring", relatedId: "memory-2" }).destination).toBe("/memory/memory-2"));
  it("rejects protocol-relative direct routes", () => expect(resolveNotificationJourney({ route: "//unsafe.example" }).destination).toBe("/inbox"));
  it("opens the receipt carrying a commerce resolution", () => expect(resolveNotificationJourney({ type: "commerce_case_resolved", relatedId: "receipt-1" }).destination).toBe("/receipts/receipt-1"));
  it("opens a dropped perk on the PromoCard", () => expect(resolveNotificationJourney({ type: "people_drop" })).toMatchObject({ destination: "/card", actionLabel: "Open your card" }));
  it("opens a claim on What Happened", () => expect(resolveNotificationJourney({ type: "people_claim" }).destination).toBe("/happened"));
  it("opens a show-up on What Happened", () => expect(resolveNotificationJourney({ type: "people_showed_up" }).destination).toBe("/happened"));
});
