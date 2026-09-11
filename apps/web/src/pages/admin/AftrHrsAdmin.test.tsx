import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AFTRHRS_ADMIN_COPY } from "@promorang/shared";

describe("AftrHrs admin page language", () => {
  const source = readFileSync(resolve(__dirname, "./AftrHrsAdmin.tsx"), "utf8");

  it("speaks in plain language instead of operator jargon", () => {
    expect(source).not.toMatch(/FAQ JSON|Claims open|Page mode|Export CSV|Reinstate|admin-editable|Digital allocation/);
    expect(source).not.toMatch(/uppercase tracking-\[0\./);
    expect(source).toContain("AFTRHRS_ADMIN_COPY");
    expect(source).toContain("guestPassType");
    expect(source).toContain("adminPassStatus");
    expect(source).toContain("copy.faqsTitle");
    expect(AFTRHRS_ADMIN_COPY.faqsTitle).toBe("Questions guests ask");
    expect(AFTRHRS_ADMIN_COPY.save).toMatch(/tonight/i);
  });
});
