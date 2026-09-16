import React from "react";
import { useLocation } from "react-router-dom";
import { Camera, MapPin, Ticket, ReceiptText, Layers3, FileText, ShieldCheck, UserRoundCheck } from "lucide-react";
import StakeholderNextV4 from "@/pages/stakeholder-next/StakeholderNextV4";
import { PromorangSemanticMark, type PromorangSemanticMarkKind } from "@/components/promorang/PromorangSemanticMark";
import "@/stakeholder-next-v5.css";

type RoleKey = "creator" | "host" | "merchant" | "brand" | "agency" | "admin";

type ContextCard = {
  kicker: string;
  title: string;
  detail: string;
  image?: string;
  icon?: React.ComponentType<{ className?: string }>;
  mark: PromorangSemanticMarkKind;
};

const media = {
  creator: "https://images.pexels.com/photos/274937/pexels-photo-274937.jpeg?auto=compress&dpr=1&w=1200",
  host: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&dpr=1&w=1200",
  merchant: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&dpr=1&w=1200",
  brand: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&dpr=1&w=1200",
  agency: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&dpr=1&w=1200",
} as const;

const context: Record<RoleKey, ContextCard[]> = {
  creator: [
    { kicker: "CURRENT ASSET", title: "Broken Plate · Draft 03", detail: "Vertical reel · 0:21 · reviewer note attached", image: media.creator, mark: "move" },
    { kicker: "PLACE", title: "Broken Plate · Liguanea", detail: "Where the action should land", icon: MapPin, mark: "explore" },
    { kicker: "PROOF EDGE", title: "Action evidence still missing", detail: "Published URL exists; attributable action proof does not", icon: Camera, mark: "proof" },
  ],
  host: [
    { kicker: "TONIGHT", title: "AFTRHRS · Sea Deck", detail: "Doors 9 PM · run closes at 11:45 PM", image: media.host, mark: "move" },
    { kicker: "PASS OBJECT", title: "84 RSVP intent", detail: "Demand signal only until a real arrival is written", icon: Ticket, mark: "explore" },
    { kicker: "OPEN EXCEPTION", title: "Pass mismatch · EX-91", detail: "No attendance written; source pass belongs to another Moment", icon: ShieldCheck, mark: "proof" },
  ],
  merchant: [
    { kicker: "OFFER OBJECT", title: "AFTRHRS Wing Key", detail: "23 remaining · tonight 9 PM–1 AM", image: media.merchant, mark: "move" },
    { kicker: "VALIDATION", title: "Use becomes proof", detail: "Validation is not purchase and does not create fulfillment", icon: ReceiptText, mark: "proof" },
    { kicker: "RETURN", title: "Place history grows", detail: "Repeated verified uses become retained venue history", icon: Layers3, mark: "return" },
  ],
  brand: [
    { kicker: "FIELD ACTIVITY", title: "First 50 · Manchester Hills", detail: "47 attributed · 34 verified · 13 unresolved", image: media.brand, mark: "move" },
    { kicker: "PEOPLE + PLACES", title: "4 creators · 2 hosts · 3 places", detail: "Every participant has an owner, dependency and proof responsibility", icon: UserRoundCheck, mark: "explore" },
    { kicker: "EVIDENCE PACK", title: "EP-5021", detail: "Merchant validations, creator links and host arrivals stay source-distinct", icon: FileText, mark: "proof" },
  ],
  agency: [
    { kicker: "CLIENT FOLIO", title: "Manchester Hills Foods", detail: "Client-owned truth · agency-operated work", image: media.agency, mark: "move" },
    { kicker: "MANAGED RESULT", title: "MR-117", detail: "34 verified actions · 13 unresolved · recommendation required", icon: FileText, mark: "proof" },
    { kicker: "NEXT BRIEF", title: "Montego Bay pilot", detail: "Result becomes the next test without promising projected ROI", icon: Layers3, mark: "return" },
  ],
  admin: [
    { kicker: "SOURCE RECORD", title: "GR-771 · verified attendance", detail: "Original event remains inspectable after any correction", icon: FileText, mark: "proof" },
    { kicker: "DISPUTE", title: "AC-1182 · duplicate scan", detail: "Host note + door log + device trace", icon: ShieldCheck, mark: "proof" },
    { kicker: "CORRECTION", title: "Append-only reversal", detail: "Resolution creates a new correction record; it does not erase history", icon: ReceiptText, mark: "kept" },
  ],
};

function roleFromPath(pathname: string): RoleKey {
  const first = pathname.split("/").filter(Boolean)[0] as RoleKey | undefined;
  return first && first in context ? first : "creator";
}

function surfaceFromPath(pathname: string) {
  return pathname.split("/").filter(Boolean)[1] || "today";
}

function WorldContextShelf({ role, surface }: { role: RoleKey; surface: string }) {
  const cards = context[role];
  return (
    <section className={`sn5-context-shelf sn5-context-${role}`} data-surface={surface} aria-label={`${role} world context`}>
      <div className="sn5-context-intro">
        <span>IN THE WORLD</span>
        <strong>{surface.replace(/-/g, " ")}</strong>
        <small>Work objects carry place, media, evidence and residue.</small>
      </div>
      <div className="sn5-context-cards">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={`${card.kicker}-${card.title}`} className="sn5-context-card">
              {card.image ? <img src={card.image} alt="" aria-hidden="true" /> : null}
              <div className="sn5-context-card-body">
                <div className="sn5-context-mark"><PromorangSemanticMark kind={card.mark} size={24} /></div>
                {Icon ? <Icon className="sn5-context-icon" /> : null}
                <span>{card.kicker}</span>
                <strong>{card.title}</strong>
                <small>{card.detail}</small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LifecycleResidue({ role, surface }: { role: RoleKey; surface: string }) {
  const isAdmin = role === "admin";
  const steps: Array<{ mark: PromorangSemanticMarkKind; label: string; text: string }> = isAdmin
    ? [
        { mark: "proof", label: "SOURCE", text: "Authoritative record" },
        { mark: "return", label: "CORRECT", text: "Deliberate intervention" },
        { mark: "kept", label: "ARCHIVE", text: "Original + correction remain" },
      ]
    : [
        { mark: "move", label: "MOVE", text: "Issue / publish / operate" },
        { mark: "proof", label: "PROOF", text: "Cross the evidence boundary" },
        { mark: "return", label: "RETURN", text: "Value or decision comes back" },
        { mark: "kept", label: "KEPT", text: "History becomes residue" },
      ];
  return (
    <aside className="sn5-residue" aria-label="PROMORANG lifecycle residue">
      <div className="sn5-residue-head"><span>LIFECYCLE RESIDUE</span><strong>{surface}</strong></div>
      <div className="sn5-residue-track">
        {steps.map((step) => <div key={`${step.mark}-${step.label}`} className="sn5-residue-step"><PromorangSemanticMark kind={step.mark} size={22}/><div><b>{step.label}</b><small>{step.text}</small></div></div>)}
      </div>
    </aside>
  );
}

export default function StakeholderNextV5() {
  const location = useLocation();
  const role = roleFromPath(location.pathname);
  const surface = surfaceFromPath(location.pathname);
  return (
    <div className={`sn5-worlded sn5-role-${role}`} data-role={role} data-surface={surface}>
      <WorldContextShelf role={role} surface={surface}/>
      <LifecycleResidue role={role} surface={surface}/>
      <StakeholderNextV4 />
    </div>
  );
}
