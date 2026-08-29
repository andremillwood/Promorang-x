import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  getStickyJoinCtaLabel,
  getStickyJoinStatusLine,
  getStickyJoinTactileVariant,
  shouldShowStickyMissions,
  shouldShowStickyPingSquad,
} from "./stickyJoinBarModel";

const joinBarSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "StickyJoinBar.tsx"),
  "utf8",
);
const momentDetailSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../pages/MomentDetail.tsx"),
  "utf8",
);

const guestState = {
  participantCount: 0,
  isJoined: false,
  isPast: false,
  isHost: false,
  isLoggedIn: false,
};

describe("sticky join bar model", () => {
  it("keeps the guest join CTA on the primary action", () => {
    expect(getStickyJoinCtaLabel(guestState)).toBe("Sign In to Join");
    expect(getStickyJoinTactileVariant(guestState)).toBe("primary");
    expect(getStickyJoinStatusLine({ ...guestState, accessState: {
      key: "available",
      label: "Available",
      description: "Open",
      ctaLabel: "Join This Moment",
      canAttempt: true,
    } })).toBe("0 people joined • Available");
  });

  it("sends extra squad actions out of the primary rail", () => {
    expect(shouldShowStickyMissions({ ...guestState, missionCount: 3, onExploreMissions: () => {} })).toBe(true);
    expect(shouldShowStickyPingSquad({ ...guestState, isLoggedIn: true, isJoined: true })).toBe(true);
    expect(shouldShowStickyPingSquad(guestState)).toBe(false);
  });
});

describe("Moment action components", () => {
  it("uses Drawer and TactileButton instead of a swipe row", () => {
    expect(joinBarSource).toContain('from "@/components/ui/drawer"');
    expect(joinBarSource).toContain('from "@/components/ui/TactileButton"');
    expect(joinBarSource).not.toContain("overflow-x-auto");
    expect(joinBarSource).not.toContain("touch-pan-x");
  });

  it("uses Tabs for Moment section options", () => {
    expect(momentDetailSource).toContain('from "@/components/ui/tabs"');
    expect(momentDetailSource).toContain("<TabsList");
    expect(momentDetailSource).toContain("<TabsTrigger");
  });
});
