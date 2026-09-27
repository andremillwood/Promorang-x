import type { WorkspaceRole } from "@promorang/shared";

export type PilotRoleId = "explorer" | "creator" | "host" | "merchant" | "brand" | "agency";

const PILOT_ACTIVE_KEY = "promorang_role_pilot_active";
const PILOT_ROLE_KEY = "promorang_role_pilot_role";
const PILOT_STEP_KEY = "promorang_role_pilot_step";
export const WELCOME_BACK_KEY = "promorang_welcome_back";

export function pilotRoleForWorkspaceRole(role?: string | null): PilotRoleId {
  if (role === "participant" || role === "explorer") return "explorer";
  if (role === "creator" || role === "host" || role === "merchant" || role === "brand" || role === "agency") {
    return role;
  }
  return "explorer";
}

export function startRolePilot(role?: string | null) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PILOT_ACTIVE_KEY, "true");
  sessionStorage.setItem(PILOT_ROLE_KEY, pilotRoleForWorkspaceRole(role));
  sessionStorage.setItem(PILOT_STEP_KEY, "0");
}

export function queueWelcomeBack(role?: WorkspaceRole | string | null) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(WELCOME_BACK_KEY, JSON.stringify({ role: role || "participant", queuedAt: Date.now() }));
}

export function consumeWelcomeBack(): { role: string; queuedAt: number } | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(WELCOME_BACK_KEY);
  sessionStorage.removeItem(WELCOME_BACK_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value.role === "string" ? value : null;
  } catch {
    return null;
  }
}
