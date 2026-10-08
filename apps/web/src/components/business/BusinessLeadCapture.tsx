import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import type { BusinessOutcomeBrief } from "@/lib/business-outcomes";
import { trackBusinessStep } from "@/lib/business-growth";

export function BusinessLeadCapture({ brief }: { brief: BusinessOutcomeBrief }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "pending" | "saved">("idle");
  const [error, setError] = useState("");
  return <details className="mt-5 text-sm">
    <summary className="cursor-pointer">Request help with this route</summary>
    <form className="mt-3 space-y-3" onSubmit={async event => {
      event.preventDefault();
      if (!consent || state !== "idle") return;
      setState("pending"); setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/leads/capture`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          email, funnelKey: "business", contactConsent: true,
          consentText: "Contact me about this business route.",
          answers: { outcomeId: brief.outcomeId, businessType: brief.businessType, successAction: brief.successAction, programmeId: brief.programmeId },
          result: { name: "Business Outcome Brief" }, landingPath: "/business/start",
        }) });
        if (!response.ok) throw new Error("Your request could not be saved. Please retry.");
        setState("saved"); trackBusinessStep(brief.id, "lead_captured", "recommendation");
      } catch (failure) { setError((failure as Error).message); setState("idle"); }
    }}>
      <p>Your free-text planning notes stay in this browser. Only your selected outcome, business type, success action and programme are shared with this request.</p>
      <label className="block">Email<input className="mt-1 w-full rounded bg-black p-2" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="flex gap-2"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} />Contact me about this business route.</label>
      <button className="rounded border px-4 py-2" disabled={!consent || state !== "idle"}>{state === "saved" ? "Request saved" : state === "pending" ? "Saving…" : "Request contact"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  </details>;
}
