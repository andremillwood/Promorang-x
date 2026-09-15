export type AdminExperienceLevel = "support" | "reviewer" | "operations" | "owner";

export type AdminAccessProfile = {
  level: AdminExperienceLevel;
  label: string;
  purpose: string;
  capabilities: string[];
};

const LEVEL_DETAILS: Record<AdminExperienceLevel, Omit<AdminAccessProfile, "level" | "capabilities">> = {
  support: {
    label: "Support",
    purpose: "Help people resolve account and product questions.",
  },
  reviewer: {
    label: "Reviewer",
    purpose: "Review identity, evidence, applications, and content.",
  },
  operations: {
    label: "Operations Manager",
    purpose: "Run Promorang's day-to-day platform operations.",
  },
  owner: {
    label: "Platform Owner",
    purpose: "Govern platform access, money, policy, and system controls.",
  },
};

const LEVEL_RANK: Record<AdminExperienceLevel, number> = {
  support: 10,
  reviewer: 20,
  operations: 30,
  owner: 40,
};

const ROLE_LEVEL: Record<string, AdminExperienceLevel> = {
  support: "support",
  support_agent: "support",
  moderator: "reviewer",
  admin: "operations",
  administrator: "operations",
  platform_admin: "operations",
  master_admin: "owner",
};

const TAB_MINIMUM_LEVEL: Record<string, AdminExperienceLevel> = {
  command: "support",
  support: "support",
  users: "support",

  "verification-hub": "reviewer",
  applications: "reviewer",
  pioneer: "reviewer",
  "enrichment-review": "reviewer",
  "event-review": "reviewer",
  moderation: "reviewer",
  moments: "reviewer",

  overview: "operations",
  growth: "operations",
  discovery: "operations",
  leads: "operations",
  "claimable-pages": "operations",
  operations: "operations",
  aftrhrs: "operations",
  promopush: "operations",
  catalog: "operations",
  commerce: "operations",
  compiler: "operations",
  "proof-builder": "operations",
  "create-moment": "operations",

  payouts: "owner",
  economy: "owner",
  access: "owner",
  audit: "owner",
  config: "owner",
  "team-access": "owner",
};

const TAB_CAPABILITIES: Record<string, readonly string[]> = {
  support: ["support.read"],
  users: ["users.read"],
  "verification-hub": ["identity.review", "proof.review", "content.review"],
  applications: ["applications.review"],
  pioneer: ["proof.review"],
  "enrichment-review": ["proof.review"],
  "event-review": ["proof.review"],
  moderation: ["content.review"],
  moments: ["moments.read"],
  overview: ["reports.read"],
  growth: ["reports.read"],
  discovery: ["campaigns.manage"],
  leads: ["campaigns.manage"],
  "claimable-pages": ["moments.manage"],
  operations: ["operations.read"],
  aftrhrs: ["operations.read"],
  promopush: ["broadcasts.manage"],
  catalog: ["catalog.manage"],
  commerce: ["orders.manage"],
  compiler: ["campaigns.manage"],
  "proof-builder": ["moments.manage"],
  "create-moment": ["moments.manage"],
  payouts: ["payouts.read"],
  economy: ["economy.read"],
  access: ["access_rules.manage"],
  audit: ["audit.read"],
  config: ["system_config.manage"],
  "team-access": ["admin_access.manage"],
};

export function resolveAdminAccessProfile(
  rawRoles: readonly string[],
  capabilities: readonly string[] = [],
): AdminAccessProfile | null {
  const levels = rawRoles
    .map((role) => ROLE_LEVEL[String(role || "").toLowerCase().trim()])
    .filter((level): level is AdminExperienceLevel => Boolean(level));

  if (!levels.length) return null;

  const level = levels.reduce((highest, candidate) =>
    LEVEL_RANK[candidate] > LEVEL_RANK[highest] ? candidate : highest,
  );

  return { level, ...LEVEL_DETAILS[level], capabilities: [...new Set(capabilities)] };
}

export function canAccessAdminTab(
  level: AdminExperienceLevel,
  tab: string,
  capabilities: readonly string[] = [],
): boolean {
  const minimumLevel = TAB_MINIMUM_LEVEL[tab];
  if (!minimumLevel) return false;
  if (LEVEL_RANK[level] >= LEVEL_RANK[minimumLevel]) return true;
  const required = TAB_CAPABILITIES[tab] || [];
  return required.some((capability) => capabilities.includes(capability));
}

export function firstAdminTab(level: AdminExperienceLevel): string {
  if (level === "reviewer") return "verification-hub";
  return "command";
}

export function getAdminTabMinimumLevel(tab: string): AdminExperienceLevel | null {
  return TAB_MINIMUM_LEVEL[tab] ?? null;
}
