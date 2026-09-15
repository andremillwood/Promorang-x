import { beforeEach, describe, expect, it } from "vitest";
import {
  getStartPageOptions,
  isValidWorkspaceStartPage,
  readWorkspaceStartPage,
  writeWorkspaceStartPage,
} from "./workspace-start-page";

describe("workspace start page preferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exposes only role-valid options", () => {
    const merchantRoutes = getStartPageOptions("merchant").map((option) => option.route);
    expect(merchantRoutes).toContain("/dashboard?view=studio&tab=promotions");
    expect(merchantRoutes).not.toContain("/admin?tab=command");
  });

  it("rejects an invalid cross-role start page", () => {
    expect(isValidWorkspaceStartPage("participant", "/admin?tab=command")).toBe(false);
    expect(writeWorkspaceStartPage("user-1", "participant", "/admin?tab=command")).toBe(false);
    expect(readWorkspaceStartPage("user-1", "participant")).toBeNull();
  });

  it("stores the preference separately by user and role", () => {
    expect(writeWorkspaceStartPage("user-1", "participant", "/card")).toBe(true);
    expect(writeWorkspaceStartPage("user-1", "merchant", "/dashboard?view=studio&tab=results")).toBe(true);

    expect(readWorkspaceStartPage("user-1", "participant")).toBe("/card");
    expect(readWorkspaceStartPage("user-1", "merchant")).toBe("/dashboard?view=studio&tab=results");
  });
});
