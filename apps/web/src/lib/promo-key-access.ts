import { PARTICIPANT_ECONOMY } from "@promorang/shared";

export type PromoKeyAccessState = {
  readyCount: number;
  pointsNeeded: number;
  progress: number;
  canConvert: boolean;
};

export function getPromoKeyAccessState(points: number): PromoKeyAccessState {
  const perKey = PARTICIPANT_ECONOMY.pointsPerPromoKey;
  const dailyCap = PARTICIPANT_ECONOMY.maxDailyPromoKeyConversions;
  const safePoints = Math.max(0, Number(points) || 0);
  const readyCount = Math.min(dailyCap, Math.floor(safePoints / perKey));
  const remainder = safePoints % perKey;
  const pointsNeeded = readyCount > 0 ? 0 : Math.max(0, perKey - remainder);
  return {
    readyCount,
    pointsNeeded,
    progress: readyCount > 0 ? 100 : Math.min(100, (remainder / perKey) * 100),
    canConvert: readyCount > 0,
  };
}
