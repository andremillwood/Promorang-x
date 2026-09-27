import { afterEach, describe, expect, it } from "vitest";
import { consumeWelcomeBack, pilotRoleForWorkspaceRole, queueWelcomeBack, startRolePilot, WELCOME_BACK_KEY } from "./auth-journey";

describe("auth journey", () => {
  it("maps workspace roles to supported first-use guides", () => {
    expect(pilotRoleForWorkspaceRole("participant")).toBe("explorer");
    expect(pilotRoleForWorkspaceRole("agency")).toBe("agency");
    expect(pilotRoleForWorkspaceRole("brand")).toBe("brand");
    expect(pilotRoleForWorkspaceRole("admin")).toBe("explorer");
  });

  it("starts the participant guide with the explorer configuration", () => {
    startRolePilot("participant");
    expect(sessionStorage.getItem("promorang_role_pilot_active")).toBe("true");
    expect(sessionStorage.getItem("promorang_role_pilot_role")).toBe("explorer");
    expect(sessionStorage.getItem("promorang_role_pilot_step")).toBe("0");
  });

  it("shows a queued welcome only once", () => {
    queueWelcomeBack("merchant");
    expect(consumeWelcomeBack()?.role).toBe("merchant");
    expect(consumeWelcomeBack()).toBeNull();
  });
});

afterEach(() => {
  sessionStorage.clear();
  sessionStorage.removeItem(WELCOME_BACK_KEY);
});
