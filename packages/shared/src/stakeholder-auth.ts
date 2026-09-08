/**
 * Remember which stakeholder workspace the person was entering
 * when they were sent to login or signup.
 *
 * Role is not only a picker on the auth form. The path that brought
 * them there is the registration: /stock is a merchant, /create/campaign
 * is a brand, /create/moment is a host.
 */

import { normalizeStakeholderRole, type StakeholderNavRole } from "./stakeholder-lens";

export const INTENDED_STAKEHOLDER_ROLE_KEY = "promorang_intended_role";
export const POST_AUTH_NEXT_KEY = "promorang_post_auth_next";

const PATH_ROLES: Array<{ test: (path: string, search: string) => boolean; role: StakeholderNavRole }> = [
  { test: (path) => path.startsWith("/staff/scanner") || path.startsWith("/dashboard/venues"), role: "merchant" },
  { test: (path) => path === "/stock" || path.startsWith("/stock/"), role: "merchant" },
  { test: (path) => path.startsWith("/create/campaign") || path.startsWith("/dashboard/campaigns") || path.startsWith("/offers"), role: "brand" },
  { test: (path) => path.startsWith("/create/moment") || path.startsWith("/organizer"), role: "host" },
  { test: (path, search) => path.startsWith("/content-drops") || search.includes("tab=publish"), role: "creator" },
  { test: (path) => path.startsWith("/admin"), role: "admin" },
];

function splitPath(raw?: string | null): { path: string; search: string } {
  const value = String(raw || "").trim();
  if (!value.startsWith("/")) return { path: "", search: "" };
  const [path, query = ""] = value.split("?");
  return { path, search: query };
}

export function inferStakeholderRoleFromPath(raw?: string | null): StakeholderNavRole | null {
  const { path, search } = splitPath(raw);
  if (!path) return null;
  const fromQuery = new URLSearchParams(search).get("role");
  if (fromQuery) return normalizeStakeholderRole(fromQuery);
  const match = PATH_ROLES.find((item) => item.test(path, search));
  return match?.role || null;
}

export function resolveIntendedStakeholderRole(input: {
  role?: string | null;
  next?: string | null;
  fromPath?: string | null;
} = {}): StakeholderNavRole | null {
  if (input.role) return normalizeStakeholderRole(input.role);
  return inferStakeholderRoleFromPath(input.next) || inferStakeholderRoleFromPath(input.fromPath);
}

export function rememberIntendedStakeholder(
  storage: Pick<Storage, "setItem" | "removeItem"> | null | undefined,
  input: { role?: string | null; next?: string | null },
): void {
  if (!storage) return;
  const role = resolveIntendedStakeholderRole(input);
  if (role) storage.setItem(INTENDED_STAKEHOLDER_ROLE_KEY, role);
  const next = input.next;
  if (next?.startsWith("/") && !next.startsWith("//")) {
    storage.setItem(POST_AUTH_NEXT_KEY, next);
  }
}

export function readIntendedStakeholderRole(
  storage: Pick<Storage, "getItem"> | null | undefined,
): StakeholderNavRole | null {
  if (!storage) return null;
  const stored = storage.getItem(INTENDED_STAKEHOLDER_ROLE_KEY);
  return stored ? normalizeStakeholderRole(stored) : null;
}

export function readIntendedStakeholderNext(
  storage: Pick<Storage, "getItem"> | null | undefined,
): string | null {
  if (!storage) return null;
  const next = storage.getItem(POST_AUTH_NEXT_KEY);
  if (next?.startsWith("/") && !next.startsWith("//")) return next;
  return null;
}

export function clearIntendedStakeholder(
  storage: Pick<Storage, "removeItem"> | null | undefined,
): void {
  if (!storage) return;
  storage.removeItem(INTENDED_STAKEHOLDER_ROLE_KEY);
  storage.removeItem(POST_AUTH_NEXT_KEY);
}

export function authEntryHref(input: {
  next?: string | null;
  role?: string | null;
  mode?: "login" | "signup";
} = {}): string {
  const role = resolveIntendedStakeholderRole(input);
  const params = new URLSearchParams();
  if (input.mode) params.set("mode", input.mode);
  if (role) params.set("role", role);
  if (input.next?.startsWith("/") && !input.next.startsWith("//")) params.set("next", input.next);
  const qs = params.toString();
  return qs ? `/auth?${qs}` : "/auth";
}
