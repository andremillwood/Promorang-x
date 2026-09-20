import { Building2, Megaphone, Store, Ticket, Users, Workflow } from "lucide-react";

export type CommerceStakeholderRole = "participant" | "merchant" | "brand" | "creator" | "host" | "community" | "agency";

const roles = [
  { id: "participant", icon: Users, title: "Participant", responsibility: "Choose, reserve, buy, receive, use, review, refer and return.", boundary: "Interest is not purchase." },
  { id: "merchant", icon: Store, title: "Merchant", responsibility: "Own price, stock, payment acceptance, fulfillment, refunds and customer commerce cases.", boundary: "The seller / fulfiller boundary." },
  { id: "brand", icon: Building2, title: "Brand", responsibility: "Commission demand, fund approved value, supply product/creative and select participating sellers.", boundary: "Brand is not automatically the seller." },
  { id: "creator", icon: Megaphone, title: "Creator", responsibility: "Distribute attributable paths and create approved work around something real.", boundary: "Share or click is not a sale." },
  { id: "host", icon: Ticket, title: "Host", responsibility: "Create the Moment or context in which access and commerce can happen.", boundary: "Hosting does not transfer seller responsibility." },
  { id: "community", icon: Users, title: "Community", responsibility: "Create relevance, trusted context and distribution around member interests.", boundary: "Interest does not create inventory." },
  { id: "agency", icon: Workflow, title: "Agency", responsibility: "Coordinate client, merchant, creator and host execution with ownership kept explicit.", boundary: "Agency operation does not rewrite client truth." },
] as const;

export function CommerceResponsibilityMap({ highlight, compact = false }: { highlight?: CommerceStakeholderRole; compact?: boolean }) {
  const visible = compact && highlight ? roles.filter((role) => role.id === highlight || role.id === "merchant" || role.id === "participant") : roles;
  return (
    <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Commerce responsibility</p>
      <h3 className="mt-2 font-serif text-2xl font-bold text-white">{compact ? "Know your role in the transaction." : "Many stakeholders can move commerce. The Merchant owns the commercial truth."}</h3>
      <div className={`mt-5 grid gap-3 ${compact ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`}>
        {visible.map((role) => {
          const Icon = role.icon;
          const active = role.id === highlight;
          return (
            <article key={role.id} className={`rounded-2xl border p-4 ${role.id === "merchant" ? "border-emerald-400/30 bg-emerald-400/[0.06]" : active ? "border-orange-300/30 bg-orange-300/[0.06]" : "border-white/10 bg-black/20"}`}>
              <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${role.id === "merchant" ? "text-emerald-300" : "text-orange-300"}`} /><h4 className="text-sm font-black text-white">{role.title}</h4></div>
              <p className="mt-3 text-xs leading-5 text-white/50">{role.responsibility}</p>
              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.1em] text-white/28">{role.boundary}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default CommerceResponsibilityMap;
