import type { WorkspaceRole } from "@/lib/auth-roles";

export const ROLE_DEFAULT_LANDING_ID = "role-default";

export type LandingPageOption = {
  id: string;
  label: string;
  description: string;
  path: string | null;
  role: WorkspaceRole | null;
};

const COMMERCIAL_ROLES: WorkspaceRole[] = ["creator", "host", "brand", "merchant", "agency"];

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  participant: "Participant",
  creator: "Creator",
  host: "Host",
  brand: "Brand",
  merchant: "Merchant",
  agency: "Agency",
  promoter: "Promoter",
  marketing: "Marketing",
  admin: "Admin",
};

export function getLandingPageOptions(
  roles: WorkspaceRole[],
  activeRole: WorkspaceRole | null,
): LandingPageOption[] {
  const options: LandingPageOption[] = [
    {
      id: ROLE_DEFAULT_LANDING_ID,
      label: "Use my role default",
      description: activeRole
        ? `Open the default ${ROLE_LABELS[activeRole]} workspace.`
        : "Open the default workspace for your active role.",
      path: null,
      role: null,
    },
    {
      id: "home",
      label: "People home",
      description: "Start with your Promorang people and participation home.",
      path: "/home",
      role: null,
    },
    {
      id: "promocard",
      label: "PromoCard",
      description: "Open your PromoCard first.",
      path: "/card",
      role: null,
    },
    {
      id: "discover",
      label: "Discover",
      description: "Start by discovering Moments, places and opportunities.",
      path: "/discover",
      role: null,
    },
    {
      id: "wallet",
      label: "Wallet",
      description: "Open balances, rewards and account value first.",
      path: "/wallet",
      role: null,
    },
  ];

  for (const role of COMMERCIAL_ROLES) {
    if (!roles.includes(role)) continue;
    options.push({
      id: `studio:${role}`,
      label: `${ROLE_LABELS[role]} studio`,
      description: `Open Promorang in the ${ROLE_LABELS[role].toLowerCase()} operating workspace.`,
      path: "/dashboard?view=studio",
      role,
    });
  }

  if (roles.includes("promoter")) {
    options.push({
      id: "promoter-portal",
      label: "Promoter portal",
      description: "Open your PromoPush promoter assignments and tools.",
      path: "/promopush/promoter",
      role: "promoter",
    });
  }

  if (roles.includes("marketing")) {
    options.push({
      id: "marketing-promopush",
      label: "PromoPush",
      description: "Open campaign distribution and marketing operations.",
      path: "/promopush",
      role: "marketing",
    });
  }

  if (roles.includes("admin")) {
    options.push({
      id: "admin-command",
      label: "Admin command",
      description: "Open the platform command center.",
      path: "/admin?tab=command",
      role: "admin",
    });
  }

  return options;
}

export function resolveSavedLandingPreference(input: {
  path?: unknown;
  role?: unknown;
  roles: WorkspaceRole[];
  activeRole: WorkspaceRole | null;
}): LandingPageOption | null {
  const path = typeof input.path === "string" ? input.path : null;
  const role = typeof input.role === "string" ? input.role as WorkspaceRole : null;
  if (!path) return null;

  const options = getLandingPageOptions(input.roles, input.activeRole);
  return options.find((option) => option.path === path && option.role === role)
    || options.find((option) => option.path === path && option.role === null)
    || null;
}

export function selectedLandingPageId(input: {
  path?: unknown;
  role?: unknown;
  roles: WorkspaceRole[];
  activeRole: WorkspaceRole | null;
}): string {
  return resolveSavedLandingPreference(input)?.id || ROLE_DEFAULT_LANDING_ID;
}
