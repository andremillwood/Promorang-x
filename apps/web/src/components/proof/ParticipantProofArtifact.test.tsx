import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveMomentJourney } from "@promorang/shared";
import { ParticipantProofArtifact } from "./ParticipantProofArtifact";

let root: Root;
let container: HTMLDivElement;
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); container = document.createElement("div"); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
const momentId = "8f562782-b44a-4d4d-8e32-16b5a201fef7";
function show(proof_state: "pending" | "verified" | "rejected") {
  act(() => root.render(<MemoryRouter><ParticipantProofArtifact journey={resolveMomentJourney({ moment_id: momentId, joined_at: "2026-09-17", proof_state, proof_submission_id: "evidence-123" })} /></MemoryRouter>));
}
describe("participant proof decision", () => {
  it("keeps pending evidence distinct from approval and issued rewards", () => {
    show("pending");
    expect(container.querySelector("h2")).toHaveTextContent("under review");
    expect(container.querySelector("a")).not.toBeInTheDocument();
    expect(container).toHaveTextContent("Attendance and any rewards await a decision");
    expect(document.querySelector('[data-proof-state="pending"]')).toBeInTheDocument();
  });
  it("links approval to retained history without claiming a reward was issued", () => {
    show("verified");
    expect(container.querySelector("h2")).toHaveTextContent("approved");
    expect(container.querySelector("a")).toHaveAttribute("href", "/vault");
    expect(document.body).not.toHaveTextContent("Reward unlocked");
  });
  it("gives rejected proof a recovery path", () => {
    show("rejected");
    expect(container.querySelector("h2")).toHaveTextContent("needs attention");
    expect(container.querySelector("a")).toHaveAttribute("href", `/moments/${momentId}/checkin`);
  });
});
