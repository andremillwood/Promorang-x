export type MasterKeyStatus = "locked" | "qualifying" | "active" | "cooling" | "dormant";

export type MasterKeyProgress = {
  earned: boolean;
  status: MasterKeyStatus;
  qualificationCredits: number;
  behaviourCategories: number;
  verifiedMoves: number;
  downstreamActions: number;
  momentum: number;
  daysSinceMeaningfulMove?: number | null;
};

export const MASTER_KEY_RULES = {
  qualificationCredits: 100,
  behaviourCategories: 4,
  verifiedMoves: 3,
  downstreamActions: 1,
  activeMomentum: 40,
  coolingMomentum: 20,
  windowDays: 30,
} as const;

export function masterKeyQualificationPercent(progress: MasterKeyProgress) {
  if (progress.earned) return 100;
  const credits = Math.min(1, progress.qualificationCredits / MASTER_KEY_RULES.qualificationCredits);
  const categories = Math.min(1, progress.behaviourCategories / MASTER_KEY_RULES.behaviourCategories);
  const verified = Math.min(1, progress.verifiedMoves / MASTER_KEY_RULES.verifiedMoves);
  const downstream = Math.min(1, progress.downstreamActions / MASTER_KEY_RULES.downstreamActions);
  return Math.round(((credits + categories + verified + downstream) / 4) * 100);
}

export function resolveMasterKeyStatus(progress: Omit<MasterKeyProgress, "status">): MasterKeyStatus {
  if (!progress.earned) {
    return masterKeyQualificationPercent({ ...progress, status: "qualifying" }) > 0 ? "qualifying" : "locked";
  }
  if (progress.momentum >= MASTER_KEY_RULES.activeMomentum) return "active";
  if (progress.momentum >= MASTER_KEY_RULES.coolingMomentum) return "cooling";
  return "dormant";
}

export function masterKeyCanTakeFundedWork(progress: MasterKeyProgress) {
  return progress.earned && progress.status !== "dormant";
}

export function momentumNeeded(progress: MasterKeyProgress) {
  return Math.max(0, MASTER_KEY_RULES.activeMomentum - progress.momentum);
}
