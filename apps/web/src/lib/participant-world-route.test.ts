import { describe, expect, it } from "vitest";
import { isParticipantWorldRoute } from "./participant-world-route";

describe("isParticipantWorldRoute", () => {
  it("uses the participant shell for the participant journey", () => {
    expect(isParticipantWorldRoute("/dashboard", "", "participant")).toBe(true);
    expect(isParticipantWorldRoute("/discover", "", "participant")).toBe(true);
    expect(isParticipantWorldRoute("/scenes/kingston", "", "participant")).toBe(true);
    expect(isParticipantWorldRoute("/moments/123/checkin", "", "participant")).toBe(true);
    expect(isParticipantWorldRoute("/card", "", "participant")).toBe(true);
    expect(isParticipantWorldRoute("/vault", "", "participant")).toBe(true);
    expect(isParticipantWorldRoute("/profile", "", "participant")).toBe(true);
    expect(isParticipantWorldRoute("/profile/person-123", "", "participant")).toBe(true);
    expect(isParticipantWorldRoute("/wallet", "", "participant")).toBe(true);
    expect(isParticipantWorldRoute("/growth/referrals", "", "participant")).toBe(true);
  });

  it("keeps participant account destinations out of the participant shell for operator roles", () => {
    expect(isParticipantWorldRoute("/profile", "", "brand")).toBe(false);
    expect(isParticipantWorldRoute("/growth/referrals", "", "merchant")).toBe(false);
  });

  it("keeps studio dashboards in the operator shell", () => {
    expect(isParticipantWorldRoute("/dashboard", "?view=studio", "participant")).toBe(false);
    expect(isParticipantWorldRoute("/dashboard", "", "brand")).toBe(false);
  });

  it("honors an explicit people view without changing the active role", () => {
    expect(isParticipantWorldRoute("/dashboard", "?view=people", "brand")).toBe(true);
    expect(isParticipantWorldRoute("/home", "", "creator")).toBe(true);
  });
});
