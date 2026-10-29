import { ArrowRight, FileCheck2, Megaphone, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function BrandCreatorBureau() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#ff8a47]">
            <Users className="h-4 w-4" />
            Brand · Distribution
          </div>
          <h2 className="font-sans mt-3 font-sans text-2xl font-semibold tracking-tight text-white">Work with creators.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Commission content, find creators and review the activity linked to their work.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Megaphone,
            eyebrow: "Commission",
            title: "Create or manage a content drop",
            copy: "Set the brief, link an event or offer and manage distribution.",
            href: "/content-drops?role=brand",
            cta: "Open Content Drops",
          },
          {
            icon: Users,
            eyebrow: "Discover",
            title: "Browse real creator profiles",
            copy: "Explore profiles and published work before choosing a creator.",
            href: "/creators",
            cta: "Browse creators",
          },
          {
            icon: FileCheck2,
            eyebrow: "Evidence",
            title: "Review campaign evidence",
            copy: "Review linked activity and campaign results before commissioning more work.",
            href: "/dashboard?view=studio&tab=correlation",
            cta: "Review evidence",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="flex min-w-0 flex-col rounded-3xl border border-white/10 bg-white/[.025] p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff6500]/10 text-[#ff8a47]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[9px] font-black uppercase tracking-[.18em] text-white/30">{item.eyebrow}</p>
              <h3 className="font-sans mt-2 text-lg font-black text-white">{item.title}</h3>
              <p className="mt-3 flex-1 text-xs leading-5 text-white/45">{item.copy}</p>
              <Button asChild variant="outline" className="mt-5 w-full rounded-xl border-white/10 bg-white/[.03] text-white">
                <Link to={item.href}>{item.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </article>
          );
        })}
      </section>


    </div>
  );
}

export default BrandCreatorBureau;
