import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));

describe("homepage first viewport", () => {
  it("does not stack a guest Browse Discover next-move above PromoCard", () => {
    const home = readFileSync(resolve(here, "CinematicCultureHome.tsx"), "utf8");
    expect(home).not.toMatch(/NextMoveStrip/);
    expect(home).not.toMatch(/Browse Discover/);
    expect(home).toMatch(/<PromoCardGateway/);
  });

  it("reserves the fixed header height on the public homepage", () => {
    const header = readFileSync(resolve(here, "Header.tsx"), "utf8");
    expect(header).toMatch(/isPublicHome \? \(/);
    expect(header).toMatch(/h-14 shrink-0 sm:h-16/);
  });
});
