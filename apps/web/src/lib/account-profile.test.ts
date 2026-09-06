import { describe, expect, it } from "vitest";
import { mergeAccountProfile } from "./account-profile";

describe("account profile identity", () => {
  it("prefers display_name when full_name is empty", () => {
    const merged = mergeAccountProfile({
      profile: { display_name: "Adam Flash", full_name: null },
      authUser: { id: "u1", email: "dev@flashcreate.co", user_metadata: {} } as any,
    });
    expect(merged.full_name).toBe("Adam Flash");
    expect(merged.display_name).toBe("Adam Flash");
  });

  it("does not let Member hide auth metadata", () => {
    const merged = mergeAccountProfile({
      profile: { display_name: "Member", full_name: "Member" },
      authUser: {
        id: "u1",
        email: "dev@flashcreate.co",
        user_metadata: { full_name: "Adam Flash" },
      } as any,
    });
    expect(merged.full_name).toBe("Adam Flash");
  });

  it("falls back to a human email local part", () => {
    const merged = mergeAccountProfile({
      profile: null,
      authUser: { id: "u1", email: "dev@flashcreate.co", user_metadata: {} } as any,
    });
    expect(merged.full_name).toBe("Dev");
  });
});
