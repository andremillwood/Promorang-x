export type WorkspaceRole =
  | "participant"
  | "creator"
  | "host"
  | "brand"
  | "merchant"
  | "agency"
  | "promoter"
  | "marketing"
  | "admin";

const OPERATOR_ROLE_KEYS = new Set([
  "admin",
  "administrator",
  "master_admin",
  "moderator",
  "superadmin",
  "super_admin",
  "super-admin",
]);

const FULL_OPERATOR_KEYS = new Set(["master_admin", "superadmin", "super_admin", "super-admin"]);

const CONSUMER_NEXT_PREFIXES = [
  "/card",
  "/discover",
  "/wallet",
  "/earn",
  "/people",
  "/demand",
  "/scenes",
  "/home",
  "/moments",
  "/drop",
];

export function mapWorkspaceRole(role: string): WorkspaceRole {
  if (!role) return "participant";
  const r = role.toLowerCase().trim();
  if (r === "creator") return "creator";
  if (r === "promoter" || r === "street_activation_promoter") return "promoter";
  if (r === "marketing") return "marketing";
  if (r === "host") return "host";
  if (r === "agency") return "agency";
  if (r === "advertiser" || r === "brand") return "brand";
  if (r === "merchant" || r === "vendor") return "merchant";
  if (OPERATOR_ROLE_KEYS.has(r)) return "admin";
  return "participant";
}

export function isFullOperatorKey(role?: string | null): boolean {
  return FULL_OPERATOR_KEYS.has(String(role || "").toLowerCase().trim());
}

export function isFullOperatorIdentity(input: {
  rawRoles?: string[];
  metadataRole?: string | null;
  email?: string | null;
}): boolean {
  if ((input.rawRoles || []).some((role) => isFullOperatorKey(role))) return true;
  if (isFullOperatorKey(input.metadataRole)) return true;
  return String(input.email || "").trim().toLowerCase() === "andremillwood@gmail.com";
}

export function isConsumerPostAuthNext(next?: string | null): boolean {
  if (!next?.startsWith("/") || next.startsWith("//")) return false;
  const path = next.split("?")[0];
  return CONSUMER_NEXT_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function resolvePreferredWorkspaceRole(
  availableRoles: WorkspaceRole[],
  input: { demoRole?: string | null; savedRole?: string | null } = {},
): WorkspaceRole | null {
  const preferredCandidates = [input.demoRole, input.savedRole]
    .map((role) => (role ? mapWorkspaceRole(role) : null))
    .filter((role): role is WorkspaceRole => Boolean(role));

  for (const candidate of preferredCandidates) {
    if (availableRoles.includes(candidate)) return candidate;
  }

  return availableRoles[0] ?? null;
}
