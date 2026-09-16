import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import StakeholderNextV5 from "@/pages/stakeholder-next/StakeholderNextV5";
import MerchantCommercialReview from "@/pages/stakeholder-next/MerchantCommercialReview";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import "@/stakeholder-next-v6.css";

/**
 * V6 — Object-Embedded World
 *
 * V5 proved that world/context helps, but the right rail should not carry the
 * personality of the product. V6 keeps V5's truthful operating model and moves
 * PROMORANG identity into the work objects themselves through role-specific
 * materials, embedded media, native navigation language and lifecycle residue.
 *
 * Canonical convergence reviews can replace an individual review route without
 * changing the shared stakeholder shell. Deep canonical routes still live
 * inside an explicit operator shell so brand, role identity and switching never
 * disappear just because the work becomes more specialized.
 */

type RoleKey = "creator" | "host" | "merchant" | "brand" | "agency" | "admin";

const roleOrder: RoleKey[] = ["creator", "host", "merchant", "brand", "agency", "admin"];
const roleLabels: Record<RoleKey, string> = {
  creator: "Creator",
  host: "Host",
  merchant: "Merchant / Venue",
  brand: "Brand",
  agency: "Agency",
  admin: "Admin",
};

const merchantNav = [
  ["today", "Now"],
  ["offers", "Offers"],
  ["verify", "Validate"],
  ["orders", "Orders"],
  ["places", "Places"],
] as const;

function OperatorShell({ role, children, deepSurface }: { role: RoleKey; children: React.ReactNode; deepSurface?: string }) {
  const navigate = useNavigate();

  function switchRole(nextRole: RoleKey) {
    // Deep-object parity is intentionally not assumed. Until a canonical object
    // has a real lens in the destination role, switching roles lands on Today.
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
              <button
                key={item}
                type="button"
                onClick={() => switchRole(item)}
                aria-current={item === role ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-[11px] font-black transition ${item === role ? "bg-[#eadcc6] text-black" : "text-white/45 hover:bg-white/[.05] hover:text-white"}`}
              >
                {roleLabels[item]}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:min-w-[250px] lg:justify-end">
            <span className="hidden rounded-full border border-[#ff6a00]/20 bg-[#ff6a00]/[.05] px-3 py-2 text-[9px] font-black uppercase tracking-[.14em] text-[#ff9a4d] sm:inline-flex">Operator mode</span>
            <a href="/participant-next.html#/today" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-3.5 text-[10px] font-black text-white/62 transition hover:border-white/20 hover:text-white">
              Participant <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="border-t border-white/[0.05] xl:hidden">
          <div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-5 py-2 sm:px-7">
            {roleOrder.map((item) => (
              <button key={item} type="button" onClick={() => switchRole(item)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-black ${item === role ? "bg-[#eadcc6] text-black" : "text-white/45"}`}>{roleLabels[item]}</button>
            ))}
          </div>
        </div>
      </header>

      {role === "merchant" && deepSurface === "commercial" ? (
        <div className="border-b border-white/[0.07] bg-[#0b0b0b]">
          <div className="mx-auto flex max-w-[1500px] items-center gap-5 px-5 sm:px-7 lg:px-8">
            <div className="hidden min-w-[240px] items-center gap-2 py-3 lg:flex">
              <MapPin className="h-3.5 w-3.5 text-[#d8a74b]" />
              <div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#d8a74b]">Merchant / Venue</p><p className="mt-0.5 text-[11px] font-bold text-white/52">Sea Deck · Counter 01</p></div>
            </div>
            <nav className="flex flex-1 overflow-x-auto" aria-label="Merchant workspace">
              {merchantNav.map(([key, label]) => {
                const active = key === "verify";
                return (
                  <NavLink key={key} to={`/merchant/${key}`} className={`shrink-0 border-b-2 px-4 py-4 text-[10px] font-black uppercase tracking-[.12em] transition ${active ? "border-[#d8a74b] text-[#f0cf89]" : "border-transparent text-white/35 hover:text-white/70"}`}>
                    {label}
                  </NavLink>
                );
              })}
            </nav>
            <span className="hidden text-[9px] font-black uppercase tracking-[.15em] text-white/24 lg:block">Canonical commercial boundary</span>
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}

export default function StakeholderNextV6() {
  const location = useLocation();

  if (location.pathname === "/merchant/commercial") {
    return (
      <OperatorShell role="merchant" deepSurface="commercial">
        <MerchantCommercialReview />
      </OperatorShell>
    );
  }

  return <div className="sn6-object-world"><StakeholderNextV5 /></div>;
}
