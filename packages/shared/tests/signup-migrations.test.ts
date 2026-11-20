import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ISO_COUNTRIES } from "../src/iso-countries";
import { LAUNCH_WINDOW_END } from "../src/launch-window";
import { completeProfileHref, COMPLETE_PROFILE_PATH, sanitizeCompleteProfileNext } from "../src/complete-profile";

const migration = (name: string) =>
  readFileSync(resolve(import.meta.dirname, "../../../supabase/migrations", name), "utf8");

describe("PromoRang signup migrations", () => {
  it("keeps the earliest redemption and rejects a second one", () => {
    const sql = migration("20261120151100_presents_one_redemption_per_user.sql");
    expect(sql).toContain("ALREADY_REDEEMED");
    expect(sql).toContain("keep the earliest redemption");
    expect(sql).toContain("presents_invite_redemptions_one_per_user_idx");
    expect(sql).toMatch(/max_uses is not null/i);
  });

  it("makes only the four founding codes unlimited", () => {
    const sql = migration("20261120151200_presents_founding_codes_unlimited.sql");
    for (const code of ["PRESENTS", "ILHH", "ENCORE", "FIRST100"]) expect(sql).toContain(code);
    expect(sql).toContain("max_uses = NULL");
    expect(sql).toContain("source_type = 'founding'");
    expect(sql).not.toMatch(/PR-/);
  });

  it("changes the new-card balance default without rewriting existing rows", () => {
    const sql = migration("20261120151400_user_promo_cards_available_balance_default_zero_new_cards_only.sql");
    expect(sql).toContain("SET DEFAULT 0.00");
    expect(sql.toLowerCase()).not.toContain("update public.user_promo_cards");
  });

  it("backfills Jamaica, leaves the US default unknown, and lists every ISO code", () => {
    const sql = migration("20261120151000_signup_country_code_and_dob.sql");
    expect(sql).toContain("IN ('US', 'USA')");
    expect(sql).toContain("JAMAICA");
    expect(sql).toContain("backfill_unverified");
    expect(sql).toContain("UNDERAGE");
    expect(sql).toContain("p_country text DEFAULT NULL");
    expect(sql).toContain("profiles.country_code where user_id");
    expect(sql).toContain("public.users.dob where id");
    for (const country of ISO_COUNTRIES) expect(sql).toContain(`'${country.code}'`);
  });

  it("seeds LAUNCH_WINDOW_END without overwriting an existing row", () => {
    const sql = migration("20261120151300_launch_window_end.sql");
    expect(sql).toContain("'LAUNCH_WINDOW_END'");
    expect(sql).toContain(`jsonb_build_object('date', '${LAUNCH_WINDOW_END}')`);
    expect(sql.toLowerCase()).toContain("on conflict (key) do nothing");
  });
});

describe("complete profile route", () => {
  it("builds /complete-profile?next= and refuses an open redirect", () => {
    expect(COMPLETE_PROFILE_PATH).toBe("/complete-profile");
    expect(completeProfileHref("/capped-drop/founding")).toBe("/complete-profile?next=%2Fcapped-drop%2Ffounding");
    expect(sanitizeCompleteProfileNext("https://evil.example")).toBeNull();
    expect(sanitizeCompleteProfileNext("//evil.example")).toBeNull();
    expect(sanitizeCompleteProfileNext("/complete-profile?next=/today")).toBeNull();
  });
});
