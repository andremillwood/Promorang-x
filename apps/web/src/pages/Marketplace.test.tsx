import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { translations } from "@/i18n/translations";

const shopCopyKeys = [
  "market.title",
  "market.eyebrow",
  "market.copy",
  "market.buy",
  "market.buyCopy",
  "market.earn",
  "market.earnCopy",
  "market.unlock",
  "market.unlockCopy",
] as const;

describe("Marketplace mobile copy", () => {
  it("keeps shop headline and body words separated", () => {
    expect(translations.en["market.title"]).toBe("Curated Passes. Guaranteed Value.");
    expect(translations.en["market.copy"]).toContain("Promorang curates experience packages with local partners.");
    expect(translations.en["market.buy"]).toBe("Buy or book");
    expect(translations.en["market.earn"]).toBe("Earn signal");
    expect(translations.en["market.unlock"]).toBe("Unlock more");

    for (const key of shopCopyKeys) {
      expect(translations.en[key]).toMatch(/ /);
      expect(translations.en[key].replace(/\s+/g, "")).not.toBe(translations.en[key]);
    }
  });

  it("does not load the opsz font axis that collapses spaces on iOS", () => {
    const css = readFileSync(path.join(process.cwd(), "src/index.css"), "utf8");
    expect(css).not.toMatch(/opsz,wght/);
    expect(css).toMatch(/font-optical-sizing:\s*none/);
    expect(css).toMatch(/font-family: "Promorang Space"/);
    expect(css).toMatch(/unicode-range: U\+0020/);
  });
});
