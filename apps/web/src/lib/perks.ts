import { Perk } from '@/types/perk';

export const CURATED_PERKS: Perk[] = [];

export function getLocalClaimedPerkIds(): string[] {
  return [];
}

export function getLocalSavedPerkIds(): string[] {
  return [];
}

export function getLocalRedeemedPerkIds(): string[] {
  return [];
}

export function getLocalMerchantPerks(): Perk[] {
  return [];
}

export function saveMerchantPerk(_perk: Perk): void {
  throw new Error('Put the perk up at /stock. Local drafts are not live inventory.');
}

export function toggleSavePerk(_perkId: string): boolean {
  return false;
}

export function claimPerk(_perk: Perk, _userId?: string) {
  throw new Error('Claim a live drop. Simulated perk claims do not count.');
}

export function redeemPerk(_perkId: string, _code?: string): boolean {
  throw new Error('Only a merchant-recorded redemption completes a perk.');
}

export async function fetchAllPerks(): Promise<Perk[]> {
  return [];
}
