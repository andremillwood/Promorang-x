const {
  ADMIN_CAPABILITIES: C,
  ALL_CAPABILITIES,
  capabilitiesForRoles,
  isAdminRole,
  normalizeRoles,
  rolesHaveCapability,
} = require('../../lib/adminCapabilities');

describe('admin capability policy', () => {
  test('normalizes and de-duplicates role records', () => {
    expect(normalizeRoles([' Admin ', 'admin', 'MODERATOR', null])).toEqual(['admin', 'moderator']);
  });

  test('recognizes only platform administration roles', () => {
    expect(isAdminRole('support')).toBe(true);
    expect(isAdminRole('moderator')).toBe(true);
    expect(isAdminRole('master_admin')).toBe(true);
    expect(isAdminRole('merchant')).toBe(false);
  });

  test('gives support only the context needed to help people', () => {
    expect(rolesHaveCapability(['support'], C.SUPPORT_RESPOND)).toBe(true);
    expect(rolesHaveCapability(['support'], C.USERS_READ)).toBe(true);
    expect(rolesHaveCapability(['support'], C.IDENTITY_REVIEW)).toBe(false);
    expect(rolesHaveCapability(['support'], C.PAYOUTS_READ)).toBe(false);
  });

  test('allows reviewers to decide evidence but not operate money or broadcasts', () => {
    expect(rolesHaveCapability(['moderator'], C.IDENTITY_REVIEW)).toBe(true);
    expect(rolesHaveCapability(['moderator'], C.PROOF_REVIEW)).toBe(true);
    expect(rolesHaveCapability(['moderator'], C.BROADCASTS_MANAGE)).toBe(false);
    expect(rolesHaveCapability(['moderator'], C.PAYOUTS_APPROVE)).toBe(false);
    expect(rolesHaveCapability(['moderator'], C.ECONOMY_MANAGE)).toBe(false);
  });

  test('allows operations managers to run work without owner controls', () => {
    expect(rolesHaveCapability(['admin'], C.ORDERS_MANAGE)).toBe(true);
    expect(rolesHaveCapability(['admin'], C.PAYOUTS_READ)).toBe(true);
    expect(rolesHaveCapability(['admin'], C.PAYOUTS_APPROVE)).toBe(false);
    expect(rolesHaveCapability(['admin'], C.ADMIN_ACCESS_MANAGE)).toBe(false);
    expect(rolesHaveCapability(['admin'], C.SYSTEM_CONFIG_MANAGE)).toBe(false);
  });

  test('gives the Platform Owner every declared capability', () => {
    expect(capabilitiesForRoles(['master_admin']).size).toBe(ALL_CAPABILITIES.length);
    for (const capability of ALL_CAPABILITIES) {
      expect(rolesHaveCapability(['master_admin'], capability)).toBe(true);
    }
  });

  test('takes the union when a person has more than one role', () => {
    const capabilities = capabilitiesForRoles(['support', 'moderator']);
    expect(capabilities.has(C.SUPPORT_RESPOND)).toBe(true);
    expect(capabilities.has(C.CONTENT_REVIEW)).toBe(true);
    expect(capabilities.has(C.ACCESS_RULES_MANAGE)).toBe(false);
  });

  test('fails closed for unknown capabilities and roles', () => {
    expect(rolesHaveCapability(['admin'], 'made_up.manage')).toBe(false);
    expect(rolesHaveCapability(['made_up_role'], C.USERS_READ)).toBe(false);
  });
});
