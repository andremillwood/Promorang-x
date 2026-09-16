export type StakeholderSuccessRole =
  | "participant"
  | "creator"
  | "host"
  | "merchant"
  | "brand"
  | "agency";

export type StakeholderValueKind =
  | "utility"
  | "access"
  | "reputation"
  | "economic"
  | "relationship";

export type StakeholderSuccessStageStatus = "done" | "current" | "todo";

export type StakeholderSuccessSignal =
  | "participant_opportunity_selected"
  | "participant_committed"
  | "participant_action_verified"
  | "participant_value_received"
  | "participant_returned"
  | "creator_opportunity_selected"
  | "creator_deliverable_approved"
  | "creator_attributed_action_verified"
  | "creator_reward_settled"
  | "creator_repeat_opportunity"
  | "host_moment_live"
  | "host_commitment_recorded"
  | "host_attendance_verified"
  | "host_repeat_attendance_verified"
  | "host_partner_reinvestment"
  | "merchant_business_ready"
  | "merchant_offer_live"
  | "merchant_customer_action_verified"
  | "merchant_value_realized"
  | "merchant_repeat_customer_verified"
  | "merchant_positive_unit_economics"
  | "brand_outcome_defined"
  | "brand_activation_live"
  | "brand_attributed_action_verified"
  | "brand_incremental_value_verified"
  | "brand_reinvestment_decision"
  | "agency_client_connected"
  | "agency_activation_live"
  | "agency_client_outcome_verified"
  | "agency_proof_delivered"
  | "agency_repeat_work";

export type StakeholderSuccessStep = {
  id: string;
  label: string;
  signal: StakeholderSuccessSignal;
  actorContribution: string;
  counterpartyAction: string;
  verifiedOutcome: string;
  valueReceived: string;
  valueKinds: StakeholderValueKind[];
  primaryMetric: string;
  nextHref: string;
};

export type StakeholderSuccessContract = {
  role: StakeholderSuccessRole;
  purpose: string;
  outcome: string;
  nextIfWorks: string;
  northStarMetric: string;
  steps: StakeholderSuccessStep[];
};

export type StakeholderSuccessState = {
  role: StakeholderSuccessRole;
  contract: StakeholderSuccessContract;
  completedSignals: StakeholderSuccessSignal[];
  isComplete: boolean;
  currentStep: StakeholderSuccessStep;
  stages: Array<StakeholderSuccessStep & { status: StakeholderSuccessStageStatus }>;
};

const CONTRACTS: Record<StakeholderSuccessRole, StakeholderSuccessContract> = {
  participant: {
    role: "participant",
    purpose: "Use Promorang to find worthwhile opportunities, act on them, and build a history that gives you better access and value over time.",
    outcome: "Complete one useful action that was worth your time.",
    nextIfWorks: "Keep what was useful, return when it matters, and let proven preferences improve what opens next.",
    northStarMetric: "Verified useful actions per active participant",
    steps: [
      {
        id: "select",
        label: "Choose something worthwhile",
        signal: "participant_opportunity_selected",
        actorContribution: "Attention and intent.",
        counterpartyAction: "A merchant, host, creator, or brand supplies a real opportunity.",
        verifiedOutcome: "The participant selects a live opportunity with a clear next action.",
        valueReceived: "A concrete reason to act, not another feed impression.",
        valueKinds: ["utility"],
        primaryMetric: "opportunity selection rate",
        nextHref: "/discover",
      },
      {
        id: "commit",
        label: "Commit",
        signal: "participant_committed",
        actorContribution: "A claim, RSVP, booking, purchase intent, or other explicit commitment.",
        counterpartyAction: "The supply owner reserves or recognizes the commitment.",
        verifiedOutcome: "A durable commitment record exists.",
        valueReceived: "Reserved access, a pass, an offer, or a clear place in the experience.",
        valueKinds: ["utility", "access"],
        primaryMetric: "selection-to-commit conversion",
        nextHref: "/card",
      },
      {
        id: "act",
        label: "Do the thing",
        signal: "participant_action_verified",
        actorContribution: "Presence, purchase, redemption, content, referral, review, or another required action.",
        counterpartyAction: "The merchant, host, platform, or connected system verifies what happened.",
        verifiedOutcome: "The promised action is recorded as verified rather than merely clicked.",
        valueReceived: "Recognition that the action counted.",
        valueKinds: ["utility", "reputation"],
        primaryMetric: "commit-to-verified-action conversion",
        nextHref: "/activity",
      },
      {
        id: "receive-value",
        label: "Receive the value",
        signal: "participant_value_received",
        actorContribution: "A completed, verified action.",
        counterpartyAction: "The responsible stakeholder fulfills the promised benefit, access, recognition, or reward.",
        verifiedOutcome: "Fulfillment or entitlement is recorded.",
        valueReceived: "Utility, access, reputation, funded reward value, or relationship value.",
        valueKinds: ["utility", "access", "reputation", "economic", "relationship"],
        primaryMetric: "verified-action-to-fulfillment rate",
        nextHref: "/card",
      },
      {
        id: "return",
        label: "Return because it worked",
        signal: "participant_returned",
        actorContribution: "Repeat participation without needing the product explained again.",
        counterpartyAction: "The network serves a better next opportunity based on proven history.",
        verifiedOutcome: "A second verified useful action occurs in a relevant relationship or category.",
        valueReceived: "Better fit, stronger access, familiarity, and compounding relationship value.",
        valueKinds: ["access", "reputation", "relationship"],
        primaryMetric: "verified participant repeat rate",
        nextHref: "/discover",
      },
    ],
  },
  creator: {
    role: "creator",
    purpose: "Use creative work and distribution to produce attributable actions for brands, places, and communities — and be rewarded when the agreed outcome is proven.",
    outcome: "Cause one verified supporter or customer action through approved creator work.",
    nextIfWorks: "Turn the result into portable reputation, earn the agreed value, and qualify for stronger repeat opportunities.",
    northStarMetric: "Verified attributable actions per active creator",
    steps: [
      {
        id: "choose-work",
        label: "Choose useful work",
        signal: "creator_opportunity_selected",
        actorContribution: "Audience fit, judgment, and willingness to take the brief.",
        counterpartyAction: "A demand owner publishes a real opportunity with terms and a success definition.",
        verifiedOutcome: "The creator accepts an opportunity they are eligible to perform.",
        valueReceived: "Clear work with a defined outcome and compensation path.",
        valueKinds: ["utility", "economic"],
        primaryMetric: "eligible-opportunity acceptance rate",
        nextHref: "/dashboard?view=studio&tab=missions",
      },
      {
        id: "deliver",
        label: "Create and get approved",
        signal: "creator_deliverable_approved",
        actorContribution: "Content, curation, distribution, or another agreed deliverable.",
        counterpartyAction: "The demand owner reviews rights, quality, and brief compliance.",
        verifiedOutcome: "The deliverable is approved and attributable distribution is live.",
        valueReceived: "A valid path from creative work to measurable audience action.",
        valueKinds: ["utility", "reputation"],
        primaryMetric: "accepted-work approval rate",
        nextHref: "/dashboard?view=studio&tab=studio",
      },
      {
        id: "cause-action",
        label: "Cause a verified action",
        signal: "creator_attributed_action_verified",
        actorContribution: "Distribution and audience trust.",
        counterpartyAction: "A participant acts and the fulfilling stakeholder verifies the action.",
        verifiedOutcome: "At least one qualified action is attributed to the creator.",
        valueReceived: "Evidence that the creator moves people, not only impressions.",
        valueKinds: ["reputation", "economic"],
        primaryMetric: "verified attributed conversion rate",
        nextHref: "/dashboard?view=studio&tab=attribution",
      },
      {
        id: "settle",
        label: "Settle the agreed value",
        signal: "creator_reward_settled",
        actorContribution: "A verified attributed outcome.",
        counterpartyAction: "The funded demand owner or platform settlement rail releases the approved value.",
        verifiedOutcome: "The payout, credit, or contracted benefit is settled.",
        valueReceived: "Predictable economic return for proven work.",
        valueKinds: ["economic"],
        primaryMetric: "verified-outcome settlement rate",
        nextHref: "/dashboard?view=studio&tab=earnings",
      },
      {
        id: "compound",
        label: "Win stronger repeat work",
        signal: "creator_repeat_opportunity",
        actorContribution: "A reusable record of audience fit and verified conversion.",
        counterpartyAction: "Demand owners rehire, invite, or offer better-fit opportunities.",
        verifiedOutcome: "The creator receives or completes repeat work based on prior performance.",
        valueReceived: "Higher trust, better opportunities, and a stronger creator demand passport.",
        valueKinds: ["reputation", "economic", "relationship"],
        primaryMetric: "creator repeat-work rate",
        nextHref: "/dashboard?view=studio&tab=reputation",
      },
    ],
  },
  host: {
    role: "host",
    purpose: "Use Promorang to fill and operate experiences with the right people, verify who participated, and build an audience that returns.",
    outcome: "Run one Moment with verified attendance and useful participant action.",
    nextIfWorks: "Improve the next Moment from attendance and return evidence, then grow repeat audience and partner confidence.",
    northStarMetric: "Verified attendance and repeat attendance per active host",
    steps: [
      {
        id: "publish",
        label: "Put a real Moment live",
        signal: "host_moment_live",
        actorContribution: "A real place, time, promise, capacity, and operating plan.",
        counterpartyAction: "Participants can discover and understand what they are joining.",
        verifiedOutcome: "A live, actionable Moment exists.",
        valueReceived: "A demand surface that can be filled and measured.",
        valueKinds: ["utility"],
        primaryMetric: "live Moments per active host",
        nextHref: "/create/moment",
      },
      {
        id: "fill",
        label: "Create qualified commitment",
        signal: "host_commitment_recorded",
        actorContribution: "Distribution, programming, and a reason to attend.",
        counterpartyAction: "Participants RSVP, claim, book, or otherwise commit.",
        verifiedOutcome: "At least one qualified commitment is recorded.",
        valueReceived: "Visible demand before the experience happens.",
        valueKinds: ["utility", "relationship"],
        primaryMetric: "qualified commitments per Moment",
        nextHref: "/dashboard?view=studio&tab=moments",
      },
      {
        id: "verify-attendance",
        label: "Prove who came",
        signal: "host_attendance_verified",
        actorContribution: "Door operations and an experience worth attending.",
        counterpartyAction: "Participants arrive and check in or complete another approved attendance proof.",
        verifiedOutcome: "Attendance is verified rather than inferred from RSVPs.",
        valueReceived: "A real audience record and defensible partner proof.",
        valueKinds: ["reputation", "relationship", "economic"],
        primaryMetric: "commit-to-attendance conversion",
        nextHref: "/dashboard?view=studio&tab=review",
      },
      {
        id: "return",
        label: "Bring people back",
        signal: "host_repeat_attendance_verified",
        actorContribution: "Programming and relationship quality that earns a second visit.",
        counterpartyAction: "Prior participants return to another Moment.",
        verifiedOutcome: "Repeat attendance is verified.",
        valueReceived: "Lower acquisition dependence and a stronger owned audience.",
        valueKinds: ["reputation", "relationship", "economic"],
        primaryMetric: "verified repeat-attendance rate",
        nextHref: "/dashboard?view=studio&tab=impact",
      },
      {
        id: "reinvest",
        label: "Earn partner reinvestment",
        signal: "host_partner_reinvestment",
        actorContribution: "Repeatable verified demand and reliable operations.",
        counterpartyAction: "A sponsor, merchant, venue, or other partner renews or expands support.",
        verifiedOutcome: "A partner commits value based on prior evidence.",
        valueReceived: "Commercial leverage around a proven audience.",
        valueKinds: ["economic", "relationship", "reputation"],
        primaryMetric: "host partner renewal rate",
        nextHref: "/dashboard?view=studio&tab=sponsorships",
      },
    ],
  },
  merchant: {
    role: "merchant",
    purpose: "Use Promorang to turn attention into measurable visits, claims, purchases, redemptions, reviews, and repeat customer behavior.",
    outcome: "Create one verified incremental customer action for the business.",
    nextIfWorks: "Bring that customer back, improve the offer, and scale only when the economics remain positive.",
    northStarMetric: "Incremental verified demand per active merchant",
    steps: [
      {
        id: "ready",
        label: "Make the business fulfillable",
        signal: "merchant_business_ready",
        actorContribution: "Accurate business, location, fulfillment, and staff context.",
        counterpartyAction: "The platform can route a customer to a place or fulfillment path that can honor the promise.",
        verifiedOutcome: "At least one valid fulfillment path is ready.",
        valueReceived: "A trustworthy destination for demand.",
        valueKinds: ["utility"],
        primaryMetric: "time to business readiness",
        nextHref: "/dashboard?tab=business",
      },
      {
        id: "supply",
        label: "Put up a real customer reason to act",
        signal: "merchant_offer_live",
        actorContribution: "Inventory, an offer, access, service capacity, or another real customer benefit.",
        counterpartyAction: "Participants, creators, hosts, and channels can discover or distribute it.",
        verifiedOutcome: "A live offer exists with quantity, terms, fulfillment, and proof rules.",
        valueReceived: "Demand can now be generated against real supply.",
        valueKinds: ["utility"],
        primaryMetric: "time from ready business to live offer",
        nextHref: "/dashboard?tab=promotions",
      },
      {
        id: "verified-customer",
        label: "Create a verified customer action",
        signal: "merchant_customer_action_verified",
        actorContribution: "A compelling offer and correct fulfillment.",
        counterpartyAction: "A participant visits, buys, redeems, books, reviews, refers, or completes another qualified action.",
        verifiedOutcome: "The customer action is verified and attributable.",
        valueReceived: "Evidence of customer movement rather than exposure.",
        valueKinds: ["economic", "relationship"],
        primaryMetric: "verified customer actions",
        nextHref: "/dashboard?tab=results",
      },
      {
        id: "realize-value",
        label: "Realize business value",
        signal: "merchant_value_realized",
        actorContribution: "Fulfillment and sufficient customer economics.",
        counterpartyAction: "The customer completes the revenue or relationship event the business values.",
        verifiedOutcome: "Revenue, qualified lead value, booking value, or another approved business-value measure is recorded.",
        valueReceived: "Measurable commercial return.",
        valueKinds: ["economic", "relationship"],
        primaryMetric: "value per verified customer action",
        nextHref: "/dashboard?tab=results",
      },
      {
        id: "retain",
        label: "Bring the customer back",
        signal: "merchant_repeat_customer_verified",
        actorContribution: "A reason for the relationship to continue beyond the initial incentive.",
        counterpartyAction: "A prior verified customer returns or buys again.",
        verifiedOutcome: "A repeat customer action is verified.",
        valueReceived: "Lower acquisition cost and higher customer lifetime value.",
        valueKinds: ["economic", "relationship"],
        primaryMetric: "verified customer repeat rate",
        nextHref: "/dashboard?tab=customers",
      },
      {
        id: "sustain",
        label: "Prove positive unit economics",
        signal: "merchant_positive_unit_economics",
        actorContribution: "Accurate margin, incentive, distribution, fulfillment, and platform cost data.",
        counterpartyAction: "Promorang measures value created against total activation cost.",
        verifiedOutcome: "Incremental value exceeds the cost required to create it.",
        valueReceived: "Confidence to repeat or scale without buying unprofitable activity.",
        valueKinds: ["economic"],
        primaryMetric: "net incremental contribution per activation",
        nextHref: "/dashboard?tab=results",
      },
    ],
  },
  brand: {
    role: "brand",
    purpose: "Use Promorang to turn marketing activity into attributable customer movement and evidence that improves investment decisions.",
    outcome: "Create one measurable customer outcome that can be tied to the activation.",
    nextIfWorks: "Separate observed from attributable and incremental value, then repeat or scale only what the evidence supports.",
    northStarMetric: "Incremental verified customer outcomes per active brand",
    steps: [
      {
        id: "define",
        label: "Define the customer outcome",
        signal: "brand_outcome_defined",
        actorContribution: "A clear objective, audience, budget boundary, and success definition.",
        counterpartyAction: "The platform can construct an activation around an outcome instead of vague reach.",
        verifiedOutcome: "The campaign has an explicit qualified-action definition.",
        valueReceived: "A measurable decision frame.",
        valueKinds: ["utility"],
        primaryMetric: "time to approved outcome contract",
        nextHref: "/create/campaign",
      },
      {
        id: "launch",
        label: "Launch funded, fulfillable supply",
        signal: "brand_activation_live",
        actorContribution: "Budget, inventory, access, creative approval, or another funded benefit.",
        counterpartyAction: "Creators, merchants, hosts, and channels distribute and fulfill the activation.",
        verifiedOutcome: "A live activation exists with funded obligations and proof rules.",
        valueReceived: "A real mechanism capable of causing customer movement.",
        valueKinds: ["utility"],
        primaryMetric: "time from outcome definition to live activation",
        nextHref: "/dashboard?view=studio",
      },
      {
        id: "attribute",
        label: "Capture attributable action",
        signal: "brand_attributed_action_verified",
        actorContribution: "Funded demand and approved distribution.",
        counterpartyAction: "Customers act and fulfillment/proof systems record the result.",
        verifiedOutcome: "At least one verified action is attributable to the activation.",
        valueReceived: "Evidence beyond passive impressions.",
        valueKinds: ["reputation", "economic"],
        primaryMetric: "cost per verified attributable action",
        nextHref: "/dashboard?view=studio&tab=attribution",
      },
      {
        id: "incremental",
        label: "Estimate incremental value",
        signal: "brand_incremental_value_verified",
        actorContribution: "Spend, baseline, margin/value, and experiment context.",
        counterpartyAction: "Promorang distinguishes observed and attributed activity from activity likely caused by the activation.",
        verifiedOutcome: "An approved incremental-value measure or defensible proxy is available.",
        valueReceived: "A stronger basis for budget allocation.",
        valueKinds: ["economic"],
        primaryMetric: "cost per incremental verified outcome",
        nextHref: "/dashboard?view=studio&tab=intelligence",
      },
      {
        id: "decide",
        label: "Make the reinvestment decision",
        signal: "brand_reinvestment_decision",
        actorContribution: "A decision based on evidence, not dashboard activity.",
        counterpartyAction: "The organization stops, adjusts, repeats, or scales the activation.",
        verifiedOutcome: "A documented next investment decision is attached to the result.",
        valueReceived: "Learning that compounds across future demand creation.",
        valueKinds: ["economic", "relationship", "reputation"],
        primaryMetric: "brand campaign repeat rate after verified outcomes",
        nextHref: "/dashboard?view=studio&tab=intelligence",
      },
    ],
  },
  agency: {
    role: "agency",
    purpose: "Use Promorang to operate client demand, create measurable customer movement, and return with evidence rather than activity reports alone.",
    outcome: "Produce one verified client outcome end to end.",
    nextIfWorks: "Package the proof into a client decision, improve the next activation, and expand only around demonstrated outcomes.",
    northStarMetric: "Verified client outcomes per active agency account",
    steps: [
      {
        id: "connect-client",
        label: "Connect the client",
        signal: "agency_client_connected",
        actorContribution: "A real client relationship, permissions, and operating context.",
        counterpartyAction: "The client grants the agency the ability to operate the appropriate workspace.",
        verifiedOutcome: "The client relationship is active and scoped.",
        valueReceived: "A governed account the agency can operate.",
        valueKinds: ["utility", "relationship"],
        primaryMetric: "time to connected client",
        nextHref: "/dashboard?view=studio&tab=clients",
      },
      {
        id: "launch-client-work",
        label: "Launch client work",
        signal: "agency_activation_live",
        actorContribution: "Strategy, setup, supply coordination, distribution, and execution.",
        counterpartyAction: "The client approves obligations and counterparties execute them.",
        verifiedOutcome: "A client activation is live under the correct organization context.",
        valueReceived: "A measurable account workflow rather than disconnected campaign tasks.",
        valueKinds: ["utility", "economic"],
        primaryMetric: "time from client connection to live activation",
        nextHref: "/dashboard?view=studio&tab=activations",
      },
      {
        id: "prove-client-outcome",
        label: "Prove the client outcome",
        signal: "agency_client_outcome_verified",
        actorContribution: "Execution and optimization around the client success definition.",
        counterpartyAction: "Customers and fulfilling stakeholders complete verifiable actions.",
        verifiedOutcome: "At least one qualified client outcome is verified and attributable.",
        valueReceived: "Evidence of agency effectiveness.",
        valueKinds: ["reputation", "economic", "relationship"],
        primaryMetric: "verified client outcomes",
        nextHref: "/dashboard?view=studio&tab=impact",
      },
      {
        id: "package-proof",
        label: "Package proof into a client decision",
        signal: "agency_proof_delivered",
        actorContribution: "Interpretation, recommendation, and a defensible outcome artifact.",
        counterpartyAction: "The client reviews what happened and what should change next.",
        verifiedOutcome: "A result artifact and recommendation are delivered to the client.",
        valueReceived: "A stronger client conversation based on outcomes rather than activity volume.",
        valueKinds: ["reputation", "relationship", "economic"],
        primaryMetric: "verified outcomes converted to client reviews",
        nextHref: "/dashboard?view=studio&tab=impact",
      },
      {
        id: "retain-client",
        label: "Earn repeat work",
        signal: "agency_repeat_work",
        actorContribution: "A proven operating record and next-step recommendation.",
        counterpartyAction: "The client renews, expands, or authorizes another outcome cycle.",
        verifiedOutcome: "Repeat client work is recorded after a proven result.",
        valueReceived: "Retention, account expansion, and compounding agency reputation.",
        valueKinds: ["reputation", "relationship", "economic"],
        primaryMetric: "client repeat-work rate after verified outcome",
        nextHref: "/dashboard?view=studio&tab=clients",
      },
    ],
  },
};

export function normalizeStakeholderSuccessRole(role?: string | null): StakeholderSuccessRole | null {
  const key = String(role || "").toLowerCase();
  if (["participant", "explorer", "member", "people", "guest"].includes(key)) return "participant";
  if (["creator", "promoter"].includes(key)) return "creator";
  if (key === "host") return "host";
  if (key === "merchant") return "merchant";
  if (["brand", "marketing"].includes(key)) return "brand";
  if (key === "agency") return "agency";
  return null;
}

export function getStakeholderSuccessContract(role?: string | null): StakeholderSuccessContract | null {
  const normalized = normalizeStakeholderSuccessRole(role);
  return normalized ? CONTRACTS[normalized] : null;
}

export function resolveStakeholderSuccess(
  role: string | null | undefined,
  observedSignals: Iterable<StakeholderSuccessSignal> = [],
): StakeholderSuccessState | null {
  const contract = getStakeholderSuccessContract(role);
  if (!contract) return null;

  const observed = new Set(observedSignals);
  const firstIncompleteIndex = contract.steps.findIndex((step) => !observed.has(step.signal));
  const isComplete = firstIncompleteIndex === -1;
  const currentIndex = isComplete ? contract.steps.length - 1 : firstIncompleteIndex;
  const currentStep = contract.steps[currentIndex];

  return {
    role: contract.role,
    contract,
    completedSignals: contract.steps.filter((step) => observed.has(step.signal)).map((step) => step.signal),
    isComplete,
    currentStep,
    stages: contract.steps.map((step, index) => ({
      ...step,
      status: observed.has(step.signal)
        ? "done"
        : index === currentIndex
          ? "current"
          : "todo",
    })),
  };
}

export type ActivationEconomicsInput = {
  incrementalValue?: number | null;
  incentiveCost?: number | null;
  distributionCost?: number | null;
  platformFee?: number | null;
  fulfillmentCost?: number | null;
  otherVariableCost?: number | null;
};

export type ActivationEconomicHealth = "unknown" | "positive" | "break_even" | "negative";

export type ActivationEconomicsResult = {
  status: ActivationEconomicHealth;
  incrementalValue: number | null;
  totalActivationCost: number;
  netIncrementalContribution: number | null;
  contributionMargin: number | null;
  economicallySustainable: boolean | null;
  explanation: string;
};

const finiteOrZero = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export function evaluateActivationEconomics(input: ActivationEconomicsInput): ActivationEconomicsResult {
  const totalActivationCost =
    finiteOrZero(input.incentiveCost) +
    finiteOrZero(input.distributionCost) +
    finiteOrZero(input.platformFee) +
    finiteOrZero(input.fulfillmentCost) +
    finiteOrZero(input.otherVariableCost);

  if (typeof input.incrementalValue !== "number" || !Number.isFinite(input.incrementalValue)) {
    return {
      status: "unknown",
      incrementalValue: null,
      totalActivationCost,
      netIncrementalContribution: null,
      contributionMargin: null,
      economicallySustainable: null,
      explanation: "Incremental value is not known yet, so the activation cannot be judged as economically sustainable.",
    };
  }

  const netIncrementalContribution = input.incrementalValue - totalActivationCost;
  const contributionMargin = input.incrementalValue === 0
    ? null
    : netIncrementalContribution / input.incrementalValue;
  const status: ActivationEconomicHealth = netIncrementalContribution > 0
    ? "positive"
    : netIncrementalContribution < 0
      ? "negative"
      : "break_even";

  return {
    status,
    incrementalValue: input.incrementalValue,
    totalActivationCost,
    netIncrementalContribution,
    contributionMargin,
    economicallySustainable: netIncrementalContribution > 0,
    explanation: status === "positive"
      ? "Incremental value exceeds incentive, distribution, platform, fulfillment, and other variable activation costs."
      : status === "break_even"
        ? "Incremental value equals the measured activation costs. There is no contribution left to justify scaling yet."
        : "Measured activation costs exceed incremental value. Scaling this activation would scale a loss unless the economics change.",
  };
}

export const PROMORANG_DEMAND_NORTH_STAR = "Weekly incremental verified demand generated per active organization";
