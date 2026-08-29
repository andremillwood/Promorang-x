import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCreateSocialPlan } from "@/hooks/usePeopleMoments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STARTERS = ["Dinner", "AftrHrs", "Movie", "Beach", "Somebody's house"];

export default function PlanComposer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createPlan = useCreateSocialPlan();
  const [title, setTitle] = useState("What are we doing Friday?");
  const [locationHint, setLocationHint] = useState("");
  const [options, setOptions] = useState<string[]>(["Dinner", "AftrHrs"]);
  const [draft, setDraft] = useState("");

  const addOption = (value: string) => {
    const next = value.trim();
    if (!next || options.includes(next)) return;
    setOptions((current) => [...current, next]);
    setDraft("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      navigate("/auth?next=/create/plan");
      return;
    }
    try {
      const result = await createPlan.mutateAsync({
        title,
        location_hint: locationHint || undefined,
        options,
        privacy: "invite_only",
        source: "plan_composer",
      });
      toast({ title: "Plan started", description: "Invite the crew and let them vote." });
      navigate(`/plans/${result.plan.id}`);
    } catch (error) {
      toast({
        title: "Couldn't start the Plan",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[100svh] bg-[#0D0D0E] text-white">
      <SEO title="Start a Plan | Promorang" description="Capture the crew's intent before the night is decided." />
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-[#FF5500]">Before the Moment</p>
        <h1 className="mt-2 text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em]">What are we doing?</h1>
        <p className="mt-3 text-sm text-white/55">
          Not an event page. Just the group chat, with votes and a way to turn the winner into a Moment.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-14 rounded-2xl border-white/10 bg-white/5 text-base"
          />
          <Input
            value={locationHint}
            onChange={(event) => setLocationHint(event.target.value)}
            placeholder="Kingston, New Kingston, anywhere"
            className="h-12 rounded-2xl border-white/10 bg-white/5"
          />

          <div className="space-y-2">
            <p className="text-xs font-bold text-white/70">Options</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => addOption(starter)}
                  className="min-h-10 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold"
                >
                  {starter}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Add another option"
                className="h-12 rounded-2xl border-white/10 bg-white/5"
              />
              <Button type="button" onClick={() => addOption(draft)} className="h-12 rounded-2xl bg-white/10">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold">
                  {option}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={createPlan.isPending}
            className="h-14 w-full rounded-full bg-[#FF5500] font-black"
          >
            {createPlan.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Invite the crew
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Already know what you're doing?{" "}
          <Link to="/create/moment" className="font-bold text-white/70 underline">
            Start a Moment
          </Link>
        </p>
      </main>
    </div>
  );
}
