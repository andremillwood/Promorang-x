import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import StakeholderNextV5 from "@/pages/stakeholder-next/StakeholderNextV5";
import MerchantCommercialReview from "@/pages/stakeholder-next/MerchantCommercialReview";
import OperatorProofEvidenceReview, { type ProofRole } from "@/pages/stakeholder-next/OperatorProofEvidenceReview";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import "@/stakeholder-next-v6.css";

type RoleKey = "creator" | "host" | "merchant" | "brand" | "agency" | "admin";
type LocalNavItem = readonly [key: string, label: string];

const roleOrder: RoleKey[] = ["creator", "host", "merchant", "brand", "agency", "admin"];
const roleLabels: Record<RoleKey, string> = {
  creator: "Creator",
  host: "Host",
  merchant: "Merchant / Venue",
  brand: "Brand",
  agency: "Agency",
  admin: "Admin",
};

const roleNav: Record<RoleKey, readonly LocalNavItem[]> = {
  creator: [["today","Today"],["work","Briefs"],["create","Studio"],["proof","Proof"],["value","Value"]],
  host: [["today","Tonight"],["moments","Moments"],["live","Door"],["proof","Proof"],["results","Return"]],
  merchant: [["today","Now"],["offers","Offers"],["verify","Validate"],["orders","Orders"],["places","Places"]],
  brand: [["today","Today"],["activations","Activations"],["people","Network"],["evidence","Evidence"],["decisions","Decisions"]],
  agency: [["today","Today"],["clients","Clients"],["work","Work"],["proof","Proof"],["growth","Growth"]],
  admin: [["today","Today"],["cases","Cases"],["review","Review"],["economy","Economy"],["health","Health"]],
};

const proofRoutes: Record<string, { role: ProofRole; activeKey: string; context: string; boundary: string }> = {
  "/merchant/validation-slip": { role: "merchant", activeKey: "verify", context: "Sea Deck · validation evidence", boundary: "Validation slip" },
  "/host/proof-close": { role: "host", activeKey: "proof", context: "AFTRHRS · proof close", boundary: "Moment close" },
  "/creator/proof-dossier": { role: "creator", activeKey: "proof", context: "Broken Plate · CB-0421", boundary: "Proof dossier" },
  "/brand/evidence-pack": { role: "brand", activeKey: "evidence", context: "First 50 · EP-5021", boundary: "Evidence pack" },
  "/agency/result-pack": { role: "agency", activeKey: "proof", context: "Manchester Hills · MR-117", boundary: "Managed result" },
  "/admin/archive": { role: "admin", activeKey: "review", context: "AC-1182 · source + correction", boundary: "Archive" },
};

function OperatorShell({ role, children, activeKey, context, boundary }: { role: RoleKey; children: React.ReactNode; activeKey?: string; context?: string; boundary?: string }) {
  const navigate = useNavigate();

  function switchRole(nextRole: RoleKey) {
    navigate(`/${nextRole}/today`);
  }

  return (
    <div className={`min-h-screen bg-[#080809] text-white sn6-operator-shell sn6-role-${role}`}>
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080809]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center gap-5 px-5 sm:px-7 lg:px-8">
          <button type="button" onClick={() => navigate(`/${role}/today`)} className="flex min-w-0 items-center gap-3 text-left lg:min-w-[250px]" aria-label="Open current operator workspace home">
            <PromorangMark size={32} />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff6a00]">PROMORANG</p>
              <p className="truncate text-[11px] font-semibold text-white/42">Operator workspace · {roleLabels[role]}</p>
            </div>
          </button>

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Switch operator role">
            {roleOrder.map((item) => (
              <button key={item} type="button" onClick={() => switchRole(item)} aria-current={item === role ? "page" : undefined} className={`rounded-full px-3.5 py-2 text-[11px] font-black transition ${item === role ? "bg-[#eadcc6] text-black" : "text-white/45 hover:bg-white/[.05] hover:text-white"}`}>{roleLabels[item]}</button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:min-w-[250px] lg:justify-end">
            <span className="hidden rounded-full border border-[#ff6a00]/20 bg-[#ff6a00]/[.05] px-3 py-2 text-[9px] font-black uppercase tracking-[.14em] text-[#ff9a4d] sm:inline-flex">Operator mode</span>
            <a href="/participant-next.html#/today" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-3.5 text-[10px] font-black text-white/62 transition hover:border-white/20 hover:text-white">Participant <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </div>
        </div>

        <div className="border-t border-white/[0.05] xl:hidden"><div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-5 py-2 sm:px-7">{roleOrder.map((item) => <button key={item} type="button" onClick={() => switchRole(item)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-black ${item === role ? "bg-[#eadcc6] text-black" : "text-white/45"}`}>{roleLabels[item]}</button>)}</div></div>
      </header>

      <div className="border-b border-white/[0.07] bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-[1500px] items-center gap-5 px-5 sm:px-7 lg:px-8">
          <div className="hidden min-w-[250px] items-center gap-2 py-3 lg:flex"><MapPin className="h-3.5 w-3.5 text-[#d8a74b]" /><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#d8a74b]">{roleLabels[role]}</p><p className="mt-0.5 text-[11px] font-bold text-white/52">{context || "Operator workspace"}</p></div></div>
          <nav className="flex flex-1 overflow-x-auto" aria-label={`${roleLabels[role]} workspace`}>
            {roleNav[role].map(([key, label]) => <NavLink key={key} to={`/${role}/${key}`} className={`shrink-0 border-b-2 px-4 py-4 text-[10px] font-black uppercase tracking-[.12em] transition ${activeKey === key ? "border-[#d8a74b] text-[#f0cf89]" : "border-transparent text-white/35 hover:text-white/70"}`}>{label}</NavLink>)}
          </nav>
          {boundary ? <span className="hidden text-[9px] font-black uppercase tracking-[.15em] text-white/24 lg:block">{boundary}</span> : null}
        </div>
      </div>

      {children}
    </div>
  );
}

export default function StakeholderNextV6() {
  const location = useLocation();

  if (location.pathname === "/merchant/commercial") {
    return <OperatorShell role="merchant" activeKey="verify" context="Sea Deck · Counter 01" boundary="Canonical commercial boundary"><MerchantCommercialReview /></OperatorShell>;
  }

  const proofRoute = proofRoutes[location.pathname];
  if (proofRoute) {
    return <OperatorShell role={proofRoute.role} activeKey={proofRoute.activeKey} context={proofRoute.context} boundary={proofRoute.boundary}><OperatorProofEvidenceReview role={proofRoute.role} /></OperatorShell>;
  }

  return <div className="sn6-object-world"><StakeholderNextV5 /></div>;
}
