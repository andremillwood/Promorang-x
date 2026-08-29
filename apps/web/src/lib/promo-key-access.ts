import { PARTICIPANT_ECONOMY } from "@promorang/shared";

export type PromoKeyAccessState = {
  pointsPerKey: number;
  readyKeys: number;
  canGetKey: boolean;
  pointsNeeded: number;
  progress: number;
};

export function getPromoKeyAccessState(
  points: number,
  options?: { pointsPerKey?: number; maxDaily?: number },
): PromoKeyAccessState {
  const pointsPerKey = options?.pointsPerKey ?? PARTICIPANT_ECONOMY.pointsPerPromoKey;
  const maxDaily = options?.maxDaily ?? PARTICIPANT_ECONOMY.maxDailyPromoKeyConversions;
  const safePoints = Math.max(0, Number(points) || 0);
  const readyKeys = Math.min(maxDaily, Math.floor(safePoints / pointsPerKey));
  const remainder = safePoints % pointsPerKey;
  const canGetKey = readyKeys >= 1;
  const pointsNeeded = canGetKey ? 0 : Math.max(0, pointsPerKey - remainder);
  const progress = canGetKey ? 100 : Math.min(100, (remainder / pointsPerKey) * 100);

  return { pointsPerKey, readyKeys, canGetKey, pointsNeeded, progress };
}
