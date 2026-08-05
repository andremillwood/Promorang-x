import { ArrowRight, BadgeCheck, Circle, Crown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRoleSuccessProgress } from "@/hooks/useRoleSuccessProgress";

type SuccessProgram = {
  name: string;
  promise: string;
  metric: string;
  action: string;
  href: string;
};

const programs: Record<string, SuccessProgram> = {
  participant: { name: "First 5", promise: "Complete five verified moves and establish a reputation that unlocks more valuable opportunities.", metric: "5 verified moves", action: "Find a move", href: "/discover" },
  creator: { name: "Creator 25", promise: "Activate 25 verified supporters around your next content drop, Moment, or creative project.", metric: "25 verified supporters", action: "Build momentum", href: "/momentum" },
  host: { name: "Full House", promise: "Fill a Moment, verify attendance, and retain a community you can reactivate next time.", metric: "Attendance + retention", action: "Create a Moment", href: "/create/moment" },
  merchant: { name: "Customer 50", promise: "Turn an offer or quiet period into verified visits, redemptions, content, and repeat customers.", metric: "50 customer actions", action: "Create an activation", href: "/create/moment" },
  brand: { name: "Promorang 100", promise: "Generate 100 verified customer actions within a defined budget, proof standard, and timeframe.", metric: "100 verified actions", action: "Create an activation", href: "/create/campaign" },
  promoter: { name: "Champion 10", promise: "Help ten people achieve a first verified success and make your downstream contribution visible.", metric: "10 people activated", action: "Open promoter tools", href: "/promopush/promoter" },
  marketing: { name: "Campaign 100", promise: "Turn distribution into 100 attributable actions with transparent contribution and return.", metric: "100 attributed actions", action: "Open PromoPush", href: "/promopush" },
  agency: { name: "Client Growth 3", promise: "Produce a repeatable verified-action result across three client campaigns.", metric: "3 proven campaigns", action: "Create an activation", href: "/create/campaign" },
  admin: { name: "Market Health", promise: "Keep participation, proof, reward delivery, Pieces, and commercial return working as one trusted system.", metric: "Healthy value loops", action: "Open command center", href: "/admin" },
};

export function RoleSuccessProgram({ role }: { role: string }) {
  const program = programs[role] || programs.participant;
  const { data: progress, isLoading } = useRoleSuccessProgress(role);
  const nextAction = progress?.nextAction || { label: program.action, href: program.href };
  const completed = progress?.milestones?.filter((milestone) => milestone.complete) || [];
  const waiting = progress?.milestones?.filter((milestone) => !milestone.complete) || [];
  const latestChange = completed.at(-1)?.label;
  const attention = waiting[0]?.label;

  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-[#1F140E] via-[#0D0D0E] to-[#120B07] text-white shadow-2xl">
      <div className="relative p-6 sm:p-9 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,85,0,0.25),transparent_42%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/40 bg-primary/20 text-primary hover:bg-primary/20 font-bold px-3 py-1">
                <Crown className="mr-1.5 h-3.5 w-3.5" /> Your Perks Journey
              </Badge>
            </div>
            <h2 className="mt-4 font-sans text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">{program.name}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">{program.promise}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-primary font-black text-white hover:bg-primary/90 shadow-[0_12px_35px_rgba(255,85,0,0.35)] px-6">
                <Link to={nextAction.href}>{nextAction.label} 🚀<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          <div className="grid border-t border-white/10 sm:grid-cols-3 lg:border-l lg:border-t-0">
            {[
              { eyebrow: "Completed Perks", title: latestChange || "Your 1st win awaits", detail: progress?.sourceLabel || "Active Promorang perks & moves", state: "done" },
              { eyebrow: "Next Perk Goal", title: attention || "Grab your next perk", detail: waiting.length ? "Your next $12 perk or free drink is waiting." : "Ready for your next reward drop.", state: "waiting" },
              { eyebrow: "Your Move", title: nextAction.label, detail: `Unlock your ${program.metric.toLowerCase()} milestone.`, state: "next" },
            ].map((item) => (
              <div key={item.eyebrow} className="min-h-48 border-b border-white/10 px-5 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:px-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : item.state === "done" ? <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Circle className={`h-3.5 w-3.5 ${item.state === "next" ? "fill-primary text-primary" : "text-white/30"}`} />}
                  {item.eyebrow}
                </div>
                <p className="mt-6 font-sans text-xl font-bold leading-snug text-white">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
