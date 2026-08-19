export type MomentJourneyStage = "choose" | "arrive" | "contribute" | "review" | "recognized" | "kept" | "return";
export type MomentProofState = "not_required" | "needed" | "pending" | "verified" | "rejected" | "expired";

export type MomentExperiencePhase = "before" | "during" | "after";
export type MomentExperienceStepStatus = "complete" | "current" | "upcoming";

export type MomentExperienceStep = {
  phase: MomentExperiencePhase;
  label: string;
  instruction: string;
  status: MomentExperienceStepStatus;
};

export type MomentExperiencePresentation = {
  phase: MomentExperiencePhase;
  eyebrow: string;
  title: string;
  body: string;
  actionLabel: string;
  steps: MomentExperienceStep[];
  receipt: null | {
    eyebrow: "It counted";
    title: string;
    lines: Array<{ label: string; value: string }>;
  };
};

export type MomentExperienceInput = {
  momentTitle?: string | null;
  participationState: "not_joined" | "joined" | "checked_in" | "completed";
  commerceCount?: number;
  moveCount?: number;
  ticketCount?: number;
  pieceQuantity?: number;
};

/** One cross-platform presentation model for the Moment's before/during/after journey. */
export function resolveMomentExperience(input: MomentExperienceInput): MomentExperiencePresentation {
  const phase: MomentExperiencePhase = input.participationState === "not_joined" || input.participationState === "joined"
    ? "before"
    : input.participationState === "checked_in" ? "during" : "after";
  const stepStatus = (step: MomentExperiencePhase): MomentExperienceStepStatus => {
    const order: MomentExperiencePhase[] = ["before", "during", "after"];
    const comparison = order.indexOf(step) - order.indexOf(phase);
    return comparison < 0 ? "complete" : comparison === 0 ? "current" : "upcoming";
  };
  const steps: MomentExperienceStep[] = [
    { phase: "before", label: "Before", instruction: input.participationState === "not_joined" ? "Join the Moment" : "Your place is held", status: stepStatus("before") },
    { phase: "during", label: "During", instruction: "Check in, buy or complete a mission", status: stepStatus("during") },
    { phase: "after", label: "After", instruction: "Keep the receipt and what it opened", status: stepStatus("after") },
  ];
  const copy = {
    before: input.participationState === "joined"
      ? { eyebrow: "Your place is held", title: "Know what to do when you arrive.", body: "Check in at the venue to open live offers, purchases and missions.", actionLabel: "Check in when you arrive" }
      : { eyebrow: "Your next move", title: "Join this Moment.", body: "Hold your place now. Check-in and everything available at the venue will follow from here.", actionLabel: "Join Moment" },
    during: { eyebrow: "You are here", title: "What can you do right now?", body: "Buy from connected merchants, redeem offers and complete missions without leaving the Moment.", actionLabel: "Show what is available" },
    after: { eyebrow: "It counted", title: "Keep what happened.", body: "Your verified action, attached value and next opening now travel with you in Vault.", actionLabel: "Open Vault" },
  }[phase];
  const receipt = phase === "after" ? {
    eyebrow: "It counted" as const,
    title: input.momentTitle || "This Moment",
    lines: [
      { label: "Participation", value: "Verified" },
      ...(input.ticketCount ? [{ label: "PromoShare", value: `${input.ticketCount} ${input.ticketCount === 1 ? "ticket" : "tickets"}` }] : []),
      ...(input.pieceQuantity ? [{ label: "Moment Piece", value: `${input.pieceQuantity} kept` }] : []),
    ],
  } : null;
  return { phase, ...copy, steps, receipt };
}

export type MomentJourneyFacts = {
  moment_id: string;
  joined_at?: string | null;
  checked_in_at?: string | null;
  participation_status?: string | null;
  proof_required?: boolean;
  proof_submission_id?: string | null;
  proof_state?: MomentProofState;
  memory_id?: string | null;
  reward_id?: string | null;
  return_opening_id?: string | null;
  return_destination?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  blocker?: { code: string; human_message: string; recover_href?: string | null } | null;
};

export type MomentJourneyState = MomentJourneyFacts & {
  stage: MomentJourneyStage;
  completed: MomentJourneyStage[];
  eyebrow: string;
  title: string;
  body: string;
  action: { label: string; href: string };
  success_destination: { label: string; href: string };
};

export function resolveMomentJourney(facts: MomentJourneyFacts): MomentJourneyState {
  const momentHref = `/moments/${facts.moment_id}`;
  const checkinHref = `${momentHref}/checkin`;
  const vaultHref = facts.memory_id ? `/vault?memory=${encodeURIComponent(facts.memory_id)}` : "/vault";
  const joined = Boolean(facts.joined_at || facts.participation_status);
  const arrived = Boolean(facts.checked_in_at);
  const proof = facts.proof_state || (facts.proof_required ? "needed" : "not_required");
  const recognized = proof === "verified" || (proof === "not_required" && arrived);
  const kept = Boolean(facts.memory_id);
  const hasReturn = Boolean(facts.return_opening_id || facts.return_destination);
  let stage: MomentJourneyStage = "choose";
  if (joined) stage = "arrive";
  if (arrived && proof === "needed") stage = "contribute";
  if (proof === "pending") stage = "review";
  if (recognized) stage = "recognized";
  if (kept) stage = "kept";
  if (kept && hasReturn) stage = "return";
  const completed: MomentJourneyStage[] = [];
  if (joined) completed.push("choose");
  if (arrived) completed.push("arrive");
  if (["pending", "verified"].includes(proof)) completed.push("contribute");
  if (recognized) completed.push("review", "recognized");
  if (kept) completed.push("kept");
  const copy: Record<MomentJourneyStage, Pick<MomentJourneyState, "eyebrow" | "title" | "body" | "action">> = {
    choose: { eyebrow: "Your next move", title: "Decide if this feels like your room.", body: "See the people, place and expectations before you say you’re coming.", action: { label: "I’m going", href: momentHref } },
    arrive: { eyebrow: "Your place is held", title: "Check in when you arrive.", body: "Let the host know you made it. Promorang will keep the rest of the journey connected.", action: { label: "Check in", href: checkinHref } },
    contribute: { eyebrow: "You made it", title: "Leave the trace this Moment asks for.", body: "Add only what is needed so your participation can count.", action: { label: "Add your trace", href: checkinHref } },
    review: { eyebrow: "We received it", title: "The host is taking a look.", body: "Your contribution is safe. Recognition and attached value will settle after review.", action: { label: "See what you shared", href: momentHref } },
    recognized: { eyebrow: "You were part of this", title: "Your presence counted.", body: "The Moment can now become part of your story and open whatever follows.", action: { label: "See what changed", href: vaultHref } },
    kept: { eyebrow: "What stayed with you", title: "The memory is in your Vault.", body: "Keep the Moment close and see whether it opens another invitation.", action: { label: "Open your memory", href: vaultHref } },
    return: { eyebrow: "What opens next", title: "Your next invitation is ready.", body: "This recommendation comes from a Scene and Moment you already chose.", action: { label: "See the invitation", href: facts.return_destination || "/discover" } },
  };
  return { ...facts, stage, completed: [...new Set(completed)], ...copy[stage], success_destination: { label: "Vault", href: vaultHref } };
}
