export const DEMAND_PLAN_VERSION = "2026-08-06" as const;

export type DemandGoal =
  | "bring_people"
  | "drive_sales"
  | "create_content"
  | "grow_referrals"
  | "build_loyalty"
  | "mobilize_community";

export type DemandActionType =
  | "discover"
  | "save"
  | "join"
  | "visit"
  | "purchase"
  | "create"
  | "review"
  | "refer"
  | "return";

export type DemandProofType = "link" | "receipt" | "photo" | "qr" | "check_in" | "api" | "human_review";

export type SharedValueType = "gems" | "promopoints" | "piece" | "promokey" | "memory" | "promoshare";
export type DistributionChannel = "pulse" | "promopush" | "creator" | "community" | "whatsapp" | "qr" | "email" | "referral";

export interface DemandIntent {
  statement: string;
  goal: DemandGoal;
  businessName?: string;
  targetCount?: number;
  timeframe?: string;
  location?: string;
  audience?: string;
  constraints: string[];
}

export interface DemandPlanAction {
  id: string;
  type: DemandActionType;
  label: string;
  required: boolean;
  proof?: DemandProofType;
}

export interface DemandPlanValue {
  type: SharedValueType;
  reason: string;
  amount?: number;
  unit?: string;
  fundingRequired: boolean;
  optional?: boolean;
  enabled?: boolean;
}

export interface DemandPlanMeasurement {
  primaryOutcome: string;
  successEvent: string;
  supportingEvents: string[];
  guardrails: string[];
  forecast: {
    low: number | null;
    expected: number | null;
    high: number | null;
    unit: string;
    confidence: "low" | "medium" | "high";
    basis: string;
  };
}

export interface DemandPlan {
  version: typeof DEMAND_PLAN_VERSION;
  id?: string;
  status: "draft" | "ready" | "active" | "paused" | "completed" | "archived";
  title: string;
  promise: string;
  intent: DemandIntent;
  people: {
    audience: string;
    participantLimit: number | null;
    eligibility: string[];
  };
  experience: {
    publicType: "moment" | "offer" | "event" | "place" | "mission" | "program";
    invitation: string;
    actions: DemandPlanAction[];
  };
  sharedValue: DemandPlanValue[];
  distribution: Array<{ channel: DistributionChannel; reason: string; enabled: boolean }>;
  returnPath: {
    reviewPrompt: boolean;
    referralPrompt: boolean;
    loyaltyFollowUp: boolean;
    nextInvitation: string;
  };
  measurement: DemandPlanMeasurement;
  readiness: {
    state: "needs_details" | "needs_funding" | "needs_approval" | "ready";
    missing: string[];
    warnings: string[];
  };
  generatedAt: string;
}

export function validateDemandPlan(plan: DemandPlan): string[] {
  const errors: string[] = [];
  if (plan.version !== DEMAND_PLAN_VERSION) errors.push("Unsupported demand plan version");
  if (!plan.title.trim()) errors.push("A plan title is required");
  if (!plan.intent.statement.trim()) errors.push("A human intent statement is required");
  if (!plan.people.audience.trim()) errors.push("An audience is required");
  if (!plan.experience.actions.some((action) => action.required)) errors.push("At least one required action is required");
  if (!plan.experience.actions.some((action) => action.proof)) errors.push("At least one action must define proof");
  if (!plan.measurement.primaryOutcome.trim()) errors.push("A primary outcome is required");
  if (!plan.measurement.successEvent.trim()) errors.push("A measurable success event is required");
  if (plan.sharedValue.some((value) => value.amount !== undefined && value.amount < 0)) errors.push("Shared value cannot be negative");
  return errors;
}

export function getDemandPlanReadiness(plan: DemandPlan) {
  const errors = validateDemandPlan(plan);
  const missing = [...errors];
  if (!plan.intent.businessName) missing.push("Confirm the organization running this campaign");
  if (!plan.intent.timeframe) missing.push("Confirm when this should happen");
  if (!plan.intent.location && ["bring_people", "drive_sales"].includes(plan.intent.goal)) missing.push("Confirm where people should go");
  if (plan.sharedValue.some((value) => value.fundingRequired)) missing.push("Secure funded campaign value");

  return {
    state: errors.length > 0 ? "needs_details" : missing.includes("Secure funded campaign value") ? "needs_funding" : missing.length > 0 ? "needs_approval" : "ready",
    missing: Array.from(new Set(missing)),
  } as const;
}

export type CommercialVertical =
  | "fmcg_retail"
  | "hospitality_dining"
  | "events_experiences"
  | "dtc_ecommerce"
  | "fitness_studios"
  | "city_hubs";

export interface CommercialVerticalConfig {
  id: CommercialVertical;
  defaultGoal: DemandGoal;
  primaryProof: DemandProofType;
  keyMetric: string;
  defaultActionSequence: DemandActionType[];
  defaultSharedValue: SharedValueType;
}

export const COMMERCIAL_VERTICALS: Record<CommercialVertical, CommercialVerticalConfig> = {
  fmcg_retail: {
    id: "fmcg_retail",
    defaultGoal: "drive_sales",
    primaryProof: "receipt",
    keyMetric: "Verified In-Cart Conversion & Retail Velocity",
    defaultActionSequence: ["visit", "purchase", "create", "review"],
    defaultSharedValue: "gems",
  },
  hospitality_dining: {
    id: "hospitality_dining",
    defaultGoal: "bring_people",
    primaryProof: "check_in",
    keyMetric: "Off-Peak Covers & Foot-Traffic Attribution",
    defaultActionSequence: ["discover", "visit", "review", "refer"],
    defaultSharedValue: "promopoints",
  },
  events_experiences: {
    id: "events_experiences",
    defaultGoal: "mobilize_community",
    primaryProof: "qr",
    keyMetric: "Referral Ticket Conversions & Proof of Presence",
    defaultActionSequence: ["join", "visit", "create", "refer"],
    defaultSharedValue: "piece",
  },
  dtc_ecommerce: {
    id: "dtc_ecommerce",
    defaultGoal: "drive_sales",
    primaryProof: "link",
    keyMetric: "Zero-Risk Affiliate ROAS & Verified UGC",
    defaultActionSequence: ["discover", "purchase", "create", "refer"],
    defaultSharedValue: "promoshare",
  },
  fitness_studios: {
    id: "fitness_studios",
    defaultGoal: "build_loyalty",
    primaryProof: "check_in",
    keyMetric: "90-Day Retention Lift & Buddy Referral Volume",
    defaultActionSequence: ["join", "visit", "return", "refer"],
    defaultSharedValue: "promokey",
  },
  city_hubs: {
    id: "city_hubs",
    defaultGoal: "mobilize_community",
    primaryProof: "qr",
    keyMetric: "Cross-Merchant Economic Circulation & Hub Velocity",
    defaultActionSequence: ["discover", "visit", "purchase", "refer"],
    defaultSharedValue: "gems",
  },
};

