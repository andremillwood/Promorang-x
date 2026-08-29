import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useInviteToMoment, usePlanActions, useSocialPlan } from "@/hooks/usePeopleMoments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sharePathForPlan } from "@promorang/shared";

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: plan, isLoading } = useSocialPlan(id);
  const actions = usePlanActions(id || "");
  const invite = useInviteToMoment();
  const [optionTitle, setOptionTitle] = useState("");

  const options = (plan?.options as Array<{ id: string; title: string }> | undefined) || [];
  const votes = (plan?.votes as Array<{ option_id: string; user_id: string }> | undefined) || [];
  const members = (plan?.members as Array<{ user_id: string; status: string }> | undefined) || [];

  const voteCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const vote of votes) counts.set(vote.option_id, (counts.get(vote.option_id) || 0) + 1);
    return counts;
  }, [votes]);

  const sharePlan = async () => {
    if (!id) return;
    const url = `${window.location.origin}${sharePathForPlan(id, user?.id)}`;
    try {
      await invite.mutateAsync({
        target_type: "plan",
        plan_id: id,
        source: "plan_share",
        referral_code: searchParams.get("ref"),
      });
    } catch {
      // Sharing still works even if invite ledger is unavailable.
    }
    if (navigator.share) {
      await navigator.share({ title: String(plan?.title || "Plan"), url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Invite link copied" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0D0D0E] text-white/50">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-[60vh] bg-[#0D0D0E] px-5 py-16 text-center text-white">
        <p>This Plan is gone or private.</p>
        <Button asChild className="mt-4 rounded-full bg-[#FF5500]">
          <Link to="/create/plan">Start one</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#0D0D0E] text-white">
      <SEO title={`${String(plan.title)} | Plan`} description="Vote on what the crew is doing." />
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-[#FF5500]">Plan</p>
        <h1 className="mt-2 text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em]">{String(plan.title)}</h1>
        <p className="mt-3 text-sm text-white/55">
          {members.length} in the crew · {votes.length} votes · {String(plan.status)}
        </p>

        <div className="mt-6 space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (!user) {
                  navigate(`/auth?next=/plans/${id}`);
                  return;
                }
                actions.vote.mutate(option.id);
              }}
              className="flex min-h-16 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-left"
            >
              <span className="font-bold">{option.title}</span>
              <span className="text-sm text-[#FF5500]">{voteCounts.get(option.id) || 0}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <Input
            value={optionTitle}
            onChange={(event) => setOptionTitle(event.target.value)}
            placeholder="Suggest something else"
            className="h-12 rounded-2xl border-white/10 bg-white/5"
          />
          <Button
            type="button"
            disabled={!optionTitle.trim()}
            onClick={() => {
              actions.addOption.mutate({ title: optionTitle.trim() });
              setOptionTitle("");
            }}
            className="h-12 rounded-2xl bg-white/10"
          >
            Add
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button type="button" onClick={sharePlan} className="h-12 rounded-2xl bg-white/10">
            <Share2 className="mr-2 h-4 w-4" /> Invite
          </Button>
          {user && user.id === plan.creator_user_id && (
            <Button
              type="button"
              disabled={actions.convert.isPending}
              onClick={async () => {
                const result = await actions.convert.mutateAsync({ here_now: true });
                navigate(`/moments/${result.moment.id}`);
              }}
              className="h-12 rounded-2xl bg-[#FF5500]"
            >
              Make it a Moment
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
