import type { MomentJourneyState } from "@promorang/shared";
import { Check } from "lucide-react";
export function ParticipantJourney({journey}: {journey: MomentJourneyState}) {
 const steps = [
  {label:"Reserved",done:Boolean(journey.joined_at)},
  {label:"Arrived",done:Boolean(journey.checked_in_at)},
  {label:"Verified",done:journey.proof_state === "verified"},
  {label:"Kept",done:Boolean(journey.memory_id)},
 ];
 return <ol className="participant-journey" aria-label="Your participation trail">{steps.map((step,index) => <li key={step.label} data-done={step.done}><span>{step.done ? <Check size={13} aria-label="Recorded" /> : index+1}</span>{step.label}</li>)}</ol>;
}
