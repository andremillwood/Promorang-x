import React from "react";
import { useLocation } from "react-router-dom";
import StakeholderNextV3 from "@/pages/stakeholder-next/StakeholderNextV3";
import { PromorangSemanticMark, type PromorangSemanticMarkKind } from "@/components/promorang/PromorangSemanticMark";
import "@/stakeholder-next-v4.css";

type RoleKey = "creator" | "host" | "merchant" | "brand" | "agency" | "admin";

type GrammarStep = {
  kind: PromorangSemanticMarkKind;
  label: string;
  copy: string;
};

const grammar: Record<RoleKey, { world: string; object: string; steps: GrammarStep[] }> = {
  creator: {
    world: "Studio field kit",
    object: "Commission → proof folio",
    steps: [
      { kind: "move", label: "MOVE", copy: "Make and publish" },
      { kind: "proof", label: "PROOF", copy: "Show what moved" },
      { kind: "return", label: "RETURN", copy: "Approved value comes back" },
      { kind: "kept", label: "KEPT", copy: "Work becomes provenance" },
    ],
  },
  host: {
    world: "Backstage field ops",
    object: "Run sheet → arrival trail",
    steps: [
      { kind: "explore", label: "EXPLORE", copy: "Demand forms" },
      { kind: "move", label: "MOVE", copy: "Open the Moment" },
      { kind: "proof", label: "PROOF", copy: "Attendance becomes evidence" },
      { kind: "kept", label: "KEPT", copy: "Run history remains" },
    ],
  },
  merchant: {
    world: "Counter instruments",
    object: "Key → validation → return",
    steps: [
      { kind: "move", label: "MOVE", copy: "Issue the offer" },
      { kind: "proof", label: "PROOF", copy: "Validate the use" },
      { kind: "return", label: "RETURN", copy: "Customer comes back" },
      { kind: "kept", label: "KEPT", copy: "Place history compounds" },
    ],
  },
  brand: {
    world: "Activation fieldbook",
    object: "Market move → evidence pack",
    steps: [
      { kind: "move", label: "MOVE", copy: "Launch into market" },
      { kind: "explore", label: "EXPLORE", copy: "Signals reveal response" },
      { kind: "proof", label: "PROOF", copy: "Evidence earns strength" },
      { kind: "return", label: "RETURN", copy: "Decision shapes next move" },
    ],
  },
  agency: {
    world: "Client operating folio",
    object: "Brief → managed result",
    steps: [
      { kind: "move", label: "MOVE", copy: "Operate the work" },
      { kind: "proof", label: "PROOF", copy: "Package client truth" },
      { kind: "return", label: "RETURN", copy: "Result becomes next brief" },
      { kind: "kept", label: "KEPT", copy: "Client history remains owned" },
    ],
  },
  admin: {
    world: "Evidence archive",
    object: "Case → correction record",
    steps: [
      { kind: "proof", label: "PROOF", copy: "Inspect authoritative evidence" },
      { kind: "return", label: "RETURN", copy: "Correct state deliberately" },
      { kind: "kept", label: "KEPT", copy: "Original history survives" },
    ],
  },
};

function roleFromPath(pathname: string): RoleKey {
  const role = pathname.split("/").filter(Boolean)[0] as RoleKey | undefined;
  return role && role in grammar ? role : "creator";
}

function surfaceFromPath(pathname: string) {
  return pathname.split("/").filter(Boolean)[1] || "today";
}

function WorldGrammar({ role, surface }: { role: RoleKey; surface: string }) {
  const config = grammar[role];
  return (
    <aside className={`sn4-world-band sn4-world-${role}`} aria-label={`${role} PROMORANG world grammar`}>
      <div className="sn4-world-intro">
        <span>PROMORANG WORLD</span>
        <strong>{config.world}</strong>
        <small>{config.object}</small>
      </div>
      <div className="sn4-world-path" aria-hidden="true">
        <span className="sn4-world-line" />
        {config.steps.map((step, index) => (
          <div className="sn4-world-step" key={`${step.kind}-${step.label}`}>
            <PromorangSemanticMark kind={step.kind} size={30} />
            <div>
              <b>{step.label}</b>
              <small>{step.copy}</small>
            </div>
            {index < config.steps.length - 1 ? <span className="sn4-world-dot" /> : null}
          </div>
        ))}
      </div>
      <div className="sn4-surface-tag">
        <span>NOW</span>
        <strong>{surface.replace(/-/g, " ")}</strong>
      </div>
    </aside>
  );
}

export default function StakeholderNextV4() {
  const location = useLocation();
  const role = roleFromPath(location.pathname);
  const surface = surfaceFromPath(location.pathname);

  return (
    <div className={`sn4-personality sn4-role-${role}`} data-role={role} data-surface={surface}>
      <WorldGrammar role={role} surface={surface} />
      <StakeholderNextV3 />
    </div>
  );
}
