import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AFTRHRS_MOMENT_ID, AFTRHRS_PATHS } from "@promorang/shared";
import {
  ADMIN_AFTRHRS_TAB_HREF,
  AFTRHRS_FUNNEL_LABELS,
  adminChromePageMeta,
  isAftrHrsMoment,
} from "./admin-surface";

describe("admin surface helpers", () => {
  it("recognizes AftrHrs from id, slug, or title", () => {
    expect(isAftrHrsMoment({ id: AFTRHRS_MOMENT_ID })).toBe(true);
    expect(isAftrHrsMoment({ slug: "aftrhrs" })).toBe(true);
    expect(isAftrHrsMoment({ title: "AftrHrs" })).toBe(true);
    expect(isAftrHrsMoment({ title: "CPL T20 | WCPL T20 - 2026" })).toBe(false);
  });

  it("labels AftrHrs in admin chrome without a raw deep link", () => {
    expect(adminChromePageMeta("/admin", "tab=aftrhrs")?.label).toBe("AftrHrs");
    expect(adminChromePageMeta(AFTRHRS_PATHS.admin)?.label).toBe("AftrHrs");
    expect(adminChromePageMeta("/admin", "tab=moments")?.label).toBe("Moments");
    expect(adminChromePageMeta("/admin", "tab=command")).toBeNull();
    expect(ADMIN_AFTRHRS_TAB_HREF).toBe("/admin?tab=aftrhrs");
    expect(AFTRHRS_FUNNEL_LABELS.pass_secured).toBe("RSVPs secured");
  });

  it("wires AftrHrs RSVPs into mobile admin navigation", () => {
    const app = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");
    const moments = readFileSync(resolve(__dirname, "../components/admin/AdminMomentsTab.tsx"), "utf8");
    const layout = readFileSync(resolve(__dirname, "../components/DashboardLayout.tsx"), "utf8");
    const dashboard = readFileSync(resolve(__dirname, "../pages/AdminDashboard.tsx"), "utf8");
    expect(app).toContain('Navigate to="/admin?tab=aftrhrs"');
    expect(moments).toContain("ADMIN_AFTRHRS_TAB_HREF");
    expect(moments).toContain("RSVPs");
    expect(layout).toContain("AftrHrs RSVPs");
    expect(dashboard).toContain("AdminMobileToolSwitch");
  });
});
