import type { MomentJourneyState } from "@promorang/shared";
import { Link } from "react-router-dom";

type Props = { journey: MomentJourneyState; showAction?: boolean };

/** A personal evidence artifact. Only the authoritative journey supplies its state. */
export function ParticipantProofArtifact({ journey, showAction = true }: Props) {
  const pending = journey.proof_state === "pending";
  const rejected = journey.proof_state === "rejected" || journey.proof_state === "expired";
  const verified = journey.proof_state === "verified";
  const title = pending ? "Your proof is under review." : rejected ? "Your proof needs attention." : verified ? "Your proof was approved." : journey.title;
  const body = pending ? "Your evidence was received. Attendance and any rewards await a decision."
    : rejected ? "This submission did not verify your participation. Review the requirements before submitting again."
    : verified ? "Your participation is verified. Open your Vault to see what has been retained."
    : journey.body;
  return (
    <section className="pr-proof-artifact" data-proof-state={pending ? "pending" : rejected ? "rejected" : verified ? "verified" : "ready"} aria-label="Your participation status">
      <p className="pr-proof-stamp">{pending ? "Awaiting decision" : rejected ? "Review required" : verified ? "Approved" : journey.eyebrow}</p>
      <h2 className="mt-4 font-serif text-3xl font-bold leading-tight">{title}</h2>
      <p className="mt-3 text-sm leading-6 opacity-75">{body}</p>
      {journey.proof_submission_id ? <p className="mt-5 break-all border-t border-current/20 pt-3 font-mono text-xs">Submission · {journey.proof_submission_id}</p> : null}
      {showAction && !pending ? <Link to={rejected ? `/moments/${journey.moment_id}/checkin` : journey.action.href} className="mt-5 inline-flex min-h-12 items-center border-b border-current font-bold">{rejected ? "Review requirements" : journey.action.label} →</Link> : null}
    </section>
  );
}
