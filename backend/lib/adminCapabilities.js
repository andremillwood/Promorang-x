const ADMIN_CAPABILITIES = Object.freeze({
  ADMIN_ACCESS_MANAGE: 'admin_access.manage',
  AUDIT_READ: 'audit.read',
  USERS_READ: 'users.read',
  USERS_RESTRICT: 'users.restrict',
  SUPPORT_READ: 'support.read',
  SUPPORT_RESPOND: 'support.respond',
  IDENTITY_READ: 'identity.read',
  IDENTITY_REVIEW: 'identity.review',
  CONTENT_REVIEW: 'content.review',
  PROOF_REVIEW: 'proof.review',
  APPLICATIONS_REVIEW: 'applications.review',
  MOMENTS_READ: 'moments.read',
  MOMENTS_MANAGE: 'moments.manage',
  CAMPAIGNS_MANAGE: 'campaigns.manage',
  CATALOG_READ: 'catalog.read',
  CATALOG_MANAGE: 'catalog.manage',
  ORDERS_READ: 'orders.read',
  ORDERS_MANAGE: 'orders.manage',
  BROADCASTS_MANAGE: 'broadcasts.manage',
  REPORTS_READ: 'reports.read',
  OPERATIONS_READ: 'operations.read',
  PAYOUTS_READ: 'payouts.read',
  PAYOUTS_APPROVE: 'payouts.approve',
  ECONOMY_READ: 'economy.read',
  ECONOMY_MANAGE: 'economy.manage',
  ACCESS_RULES_MANAGE: 'access_rules.manage',
  SYSTEM_CONFIG_MANAGE: 'system_config.manage',
});

const SUPPORT_CAPABILITIES = [
  ADMIN_CAPABILITIES.USERS_READ,
  ADMIN_CAPABILITIES.SUPPORT_READ,
  ADMIN_CAPABILITIES.SUPPORT_RESPOND,
  ADMIN_CAPABILITIES.IDENTITY_READ,
  ADMIN_CAPABILITIES.CATALOG_READ,
  ADMIN_CAPABILITIES.ORDERS_READ,
];

const REVIEWER_CAPABILITIES = [
  ...SUPPORT_CAPABILITIES,
  ADMIN_CAPABILITIES.IDENTITY_REVIEW,
  ADMIN_CAPABILITIES.CONTENT_REVIEW,
  ADMIN_CAPABILITIES.PROOF_REVIEW,
  ADMIN_CAPABILITIES.APPLICATIONS_REVIEW,
  ADMIN_CAPABILITIES.MOMENTS_READ,
  ADMIN_CAPABILITIES.OPERATIONS_READ,
];

const OPERATIONS_CAPABILITIES = [
  ...REVIEWER_CAPABILITIES,
  ADMIN_CAPABILITIES.USERS_RESTRICT,
  ADMIN_CAPABILITIES.MOMENTS_MANAGE,
  ADMIN_CAPABILITIES.CAMPAIGNS_MANAGE,
  ADMIN_CAPABILITIES.CATALOG_MANAGE,
  ADMIN_CAPABILITIES.ORDERS_MANAGE,
  ADMIN_CAPABILITIES.BROADCASTS_MANAGE,
  ADMIN_CAPABILITIES.REPORTS_READ,
  ADMIN_CAPABILITIES.PAYOUTS_READ,
  ADMIN_CAPABILITIES.ECONOMY_READ,
];

const ALL_CAPABILITIES = Object.freeze(Object.values(ADMIN_CAPABILITIES));

const ROLE_CAPABILITIES = Object.freeze({
  support: SUPPORT_CAPABILITIES,
  support_agent: SUPPORT_CAPABILITIES,
  moderator: REVIEWER_CAPABILITIES,
  admin: OPERATIONS_CAPABILITIES,
  administrator: OPERATIONS_CAPABILITIES,
  platform_admin: OPERATIONS_CAPABILITIES,
  master_admin: ALL_CAPABILITIES,
});

function normalizeRoles(roles = []) {
  return Array.from(new Set(
    roles
      .map((role) => String(role || '').toLowerCase().trim())
      .filter(Boolean),
  ));
}

function isAdminRole(role) {
  return Object.prototype.hasOwnProperty.call(ROLE_CAPABILITIES, String(role || '').toLowerCase().trim());
}

function capabilitiesForRoles(roles = []) {
  const capabilities = new Set();
  for (const role of normalizeRoles(roles)) {
    for (const capability of ROLE_CAPABILITIES[role] || []) {
      capabilities.add(capability);
    }
  }
  return capabilities;
}

function rolesHaveCapability(roles, capability) {
  if (!ALL_CAPABILITIES.includes(capability)) return false;
  return capabilitiesForRoles(roles).has(capability);
}

module.exports = {
  ADMIN_CAPABILITIES,
  ALL_CAPABILITIES,
  ROLE_CAPABILITIES,
  capabilitiesForRoles,
  isAdminRole,
  normalizeRoles,
  rolesHaveCapability,
};

