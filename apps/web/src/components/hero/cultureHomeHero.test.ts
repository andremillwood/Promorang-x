import { describe, expect, it } from "vitest";
import {
  buildKeepRelic,
  buildProofReceipt,
  formatHeroMoney,
  nextHeroLayer,
  previousHeroLayer,
} from "./cultureHomeHero";

describe("cultureHomeHero", () => {
  it("rotates layers in a closed loop", () => {
    expect(nextHeroLayer("tonight")).toBe("spend");
    expect(nextHeroLayer("spend")).toBe("proof");
    expect(nextHeroLayer("proof")).toBe("keep");
    expect(nextHeroLayer("keep")).toBe("tonight");
    expect(previousHeroLayer("tonight")).toBe("keep");
    expect(previousHeroLayer("spend")).toBe("tonight");
  });

  it("formats spendable card amounts", () => {
    expect(formatHeroMoney(24)).toMatch(/24/);
    expect(formatHeroMoney(Number.NaN)).toMatch(/0/);
  });

  it("builds a visit receipt from a live moment", () => {
    const receipt = buildProofReceipt({
      title: "FAT Wednesday",
      detail: "Tracks & Records",
      value: "Wed 9:00 PM",
      href: "/moments/fat-wednesday",
    });

    expect(receipt.heading).toBe("Visit receipt");
    expect(receipt.lines).toEqual([
      { label: "Showed up", value: "FAT Wednesday" },
      { label: "Place", value: "Tracks & Records" },
      { label: "When", value: "Wed 9:00 PM" },
      { label: "Kept", value: "Proof of the night", strong: true },
    ]);
  });

  it("falls back to a generic night when no moment is live", () => {
    const receipt = buildProofReceipt(null);
    const relic = buildKeepRelic(null);

    expect(receipt.lines[0]?.value).toBe("A funded night");
    expect(relic.title).toBe("A piece of the night");
    expect(relic.perk).toContain("standing");
  });

  it("names a relic after the live moment", () => {
    const relic = buildKeepRelic({
      title: "Blue Mountain Flight",
      detail: "Cafe Blue",
      value: "Sat 4:00 PM",
      href: "/moments/blue-mountain",
    });

    expect(relic.title).toBe("A piece of Blue Mountain Flight");
    expect(relic.origin).toBe("Cafe Blue");
  });
});
