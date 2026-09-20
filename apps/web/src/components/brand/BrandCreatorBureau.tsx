import { ArrowRight, FileCheck2, Megaphone, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function BrandCreatorBureau() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#ff6500]/25 bg-[linear-gradient(135deg,rgba(255,101,0,.10),rgba(0,0,0,.88))] p-5 sm:p-7">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#ff8a47]">
            <Users className="h-4 w-4" />
            Brand · Distribution
          </div>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Put creator work into motion without inventing a roster.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            PROMORANG does not currently expose one brand-scoped creator submission queue with authoritative payout and approval state.
            Use the real Content Drops workspace to commission and distribute work, then use attributed evidence to decide what counted.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Megaphone,
            eyebrow: "Commission",
            title: "Create or manage a content drop",
            copy: "Define the real brief, linked Moment or offer, distribution assets and any funded value in the content-distribution workspace.",
            href: "/content-drops?role=brand",
            cta: "Open Content Drops",
          },
          {
            icon: Users,
            eyebrow: "Discover",
            title: "Browse real creator profiles",
            copy: "Use the creator directory for recorded creator identity. Do not infer fit, reach or availability from fabricated match scores.",
            href: "/creators",
            cta: "Browse creators",
          },
          {
            icon: FileCheck2,
            eyebrow: "Evidence",
            title: "Review what actually moved",
            copy: "Attribution, verification, approval and settlement remain separate. Use the Proof and Economics surfaces for recorded outcomes.",
            href: "/dashboard?view=studio&tab=correlation",
            cta: "Review evidence",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="flex min-h-[250px] flex-col rounded-3xl border border-white/10 bg-white/[.025] p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff6500]/10 text-[#ff8a47]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-6 text-[9px] font-black uppercase tracking-[.18em] text-white/30">{item.eyebrow}</p>
              <h3 className="mt-2 text-lg font-black text-white">{item.title}</h3>
              <p className="mt-3 flex-1 text-xs leading-5 text-white/45">{item.copy}</p>
              <Button asChild variant="outline" className="mt-5 w-full rounded-xl border-white/10 bg-white/[.03] text-white">
                <Link to={item.href}>{item.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-dashed border-white/12 p-5 text-sm leading-6 text-white/45">
        <strong className="text-white">Not claimed here:</strong> creator availability, audience fit, media reach, bounty approval, payout,
        or content approval. Those require their own authoritative records before they appear as Brand operating state.
      </section>
    </div>
  );
}

export default BrandCreatorBureau;
