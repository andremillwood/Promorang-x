import type { OpenedStandingGrant, StandingPackage } from "@promorang/shared";
import { grantExpiresAt } from "@promorang/shared";

const storageKey = (userId: string) => `promorang.standing-grants.${userId}`;

export function readStandingGrants(userId?: string | null): OpenedStandingGrant[] {
  if (!userId || typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStandingGrants(userId: string, grants: OpenedStandingGrant[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(grants));
}

export function openStandingPackage(userId: string, pack: StandingPackage, openedAt = new Date()): OpenedStandingGrant[] {
  const grants = readStandingGrants(userId);
  if (grants.some((grant) => grant.packageId === pack.id)) return grants;
  const next = [
    ...grants,
    {
      packageId: pack.id,
      tier: pack.tier,
      kind: pack.kind,
      openedAt: openedAt.toISOString(),
      expiresAt: grantExpiresAt(openedAt, pack.days),
    },
  ];
  writeStandingGrants(userId, next);
  return next;
}
