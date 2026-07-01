import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Link2,
  MessageCircle,
  MousePointerClick,
  Play,
  RadioTower,
  Repeat2,
  Share2,
  Sparkles,
  Ticket,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useContentDrop,
  useContentDropLeaderboard,
  useRecordContentDropAction,
} from "@/hooks/useContentDistribution";
import { useAuth } from "@/contexts/AuthContext";
import {
  ContributionReceipt,
} from "@/components/promorang/ExperiencePrimitives";
import {
  getSeededContentDrop,
  seededContentDropLeaderboards,
} from "@/data/seeded-content-drops";
import { OpportunityTerms } from "@/components/economy/OpportunityTerms";
import { ProofReceipt, type RewardItem } from "@/components/value/ValueJourney";
import { useState } from "react";
import { recordJourneyEvent } from "@/lib/value-journey";

const actionButtons = [
  { action_type: "click", label: "Open", icon: ExternalLink },
  { action_type: "share", label: "Shared", icon: Share2 },
  { action_type: "repost", label: "Reposted", icon: Repeat2 },
  { action_type: "comment", label: "Commented", icon: MessageCircle },
];

export default function ContentDropDetail() {
  const { id } = useParams();
  const { session } = useAuth();
  const dropQuery = useContentDrop(id);
  const leaderboardQuery = useContentDropLeaderboard(id);
  const recordAction = useRecordContentDropAction(id);
  const [receipt, setReceipt] = useState<{ action: string; items: RewardItem[] } | null>(null);

  const seededDrop = getSeededContentDrop(id);
  const drop = dropQuery.data || seededDrop;
  const assets = drop?.content_distribution_assets || [];
  const primary = assets[0];
  const pointsPerAction = Number(drop?.reward_config?.base_points || 0);
  const entriesPerAction = Number(drop?.promoshare_config?.entries_per_action || 1);
  const fundedGems = Math.max(...Object.values(drop?.reward_config?.gems_by_action || {}).map(Number), 0);
  const leaderboard = useMemo(() => {
    return leaderboardQuery.data || (id ? seededContentDropLeaderboards[id] : []) || [];
  }, [id, leaderboardQuery.data]);

  const totals = useMemo(() => ({
    shares: leaderboard.reduce((sum, row) => sum + Number(row.shares_count || 0), 0),
    clicks: leaderboard.reduce((sum, row) => sum + Number(row.clicks_count || 0), 0),
    entries: leaderboard.reduce((sum, row) => sum + Number(row.promoshare_entries_earned || 0), 0),
    score: leaderboard.reduce((sum, row) => sum + Number(row.distribution_score || 0), 0),
  }), [leaderboard]);

  const record = (actionType: string) => {
    recordAction.mutate({
      action_type: actionType,
      asset_id: primary?.id,
      destination_url: primary?.target_url,
      verified: ["share", "repost"].includes(actionType),
      metadata: {
        source: "content_drop_detail",
      },
    }, {
      onSuccess: (payload: any) => {
        const action = payload?.data || {};
        const items: RewardItem[] = [
          { label: "Points", value: `+${Number(action.points_awarded || pointsPerAction)} Points`, kind: "points" },
          { label: "PromoShare", value: `${Number(action.promoshare_entries_awarded || 0)} entries`, kind: "entry" },
          { label: "Attribution", value: ["share", "repost"].includes(actionType) ? "Verified movement" : "Contribution recorded", kind: "status" },
        ];
        if (fundedGems > 0 && ["share", "repost"].includes(actionType)) items.push({ label: "Funded reward", value: `Up to ${fundedGems} Gems`, kind: "gems", pending: true });
        setReceipt({ action: actionType, items });
        recordJourneyEvent(session?.access_token, {
          event_name: "content_contribution_recorded",
          journey_stage: "first_value",
          object_type: "content_drop",
          object_id: id,
          metadata: { action_type: actionType, points: action.points_awarded || pointsPerAction },
        });
      },
    });
  };

  if (dropQuery.isLoading && !seededDrop) {
    return <div className="p-8 text-muted-foreground">Loading content drop...</div>;
  }

  if (!drop) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/content-drops"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">Content drop not found.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {receipt ? (
          <div className="mb-6">
            <ProofReceipt
              title="You helped this signal move."
              description={`Your ${receipt.action} is attached to this creator drop. Attribution, reward eligibility, and visible contribution now stay with your record.`}
              items={receipt.items}
              nextHref="/content-drops"
              nextLabel="Find another signal"
              secondaryHref="/wallet"
              secondaryLabel="See what you kept"
            />
          </div>
        ) : null}
        <Button asChild variant="ghost" className="mb-5 text-white/65 hover:bg-white/10 hover:text-white">
          <Link to="/content-drops"><ArrowLeft className="mr-2 h-4 w-4" />Content Drops</Link>
        </Button>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="grid gap-5">
            <div className="relative min-h-[620px] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
                {primary?.media_url ? (
                  <img src={primary.media_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#0f172a,#f97316_58%,#fde047)]">
                    <RadioTower className="h-16 w-16 text-white" />
                  </div>
                )}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
              <div className="relative flex min-h-[620px] flex-col justify-between p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary-foreground">{drop.objective_type.replace("_", " ")}</span>
                  <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]">{drop.status}</span>
                </div>
                <div>
                  <span className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-white/35 bg-black/45"><Play className="h-5 w-5 fill-white" /></span>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Creator signal</p>
                  <h1 className="mt-3 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.86] tracking-[-0.065em] sm:text-7xl">{drop.title}</h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">{drop.description || "Back this content early, redistribute it with attribution, and turn useful movement into proof, rank, tickets, and creator upside."}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Clicks", value: totals.clicks, icon: MousePointerClick },
                { label: "Shares", value: totals.shares, icon: Share2 },
                { label: "PromoShare entries", value: totals.entries, icon: Ticket },
                { label: "Distribution score", value: totals.score, icon: Trophy },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <item.icon className="h-4 w-4 text-primary" /><p className="mt-4 text-2xl font-black">{item.value}</p><p className="mt-1 text-xs text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="grid gap-5">
            <Card className="border-primary/35 bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,.18),transparent_45%),rgba(255,255,255,.045)] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Move this drop
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <OpportunityTerms
                  dark
                  className="mb-2"
                  cost="Free"
                  reward={`${pointsPerAction} Points + ${entriesPerAction} entry${entriesPerAction === 1 ? "" : "ies"}${fundedGems > 0 ? ` + up to ${fundedGems} Gems` : ""}`}
                  funding={drop?.linked_moment_id ? "Linked Moment pool" : "Campaign allocation"}
                  proof="Attributed action"
                  settlement="After verification"
                />
                <div className="mb-2 grid grid-cols-3 gap-2">
                  {[
                    ["Open", "Original"],
                    ["Move", "Attributed"],
                    ["Earn", "Rank + entries"],
                  ].map(([label, detail], index) => (
                    <div key={label} className="rounded-xl bg-black/30 p-3">
                      <p className="text-[9px] font-black text-primary">0{index + 1}</p>
                      <p className="mt-2 text-sm font-bold">{label}</p>
                      <p className="text-[9px] text-white/35">{detail}</p>
                    </div>
                  ))}
                </div>
                {primary?.target_url && (
                  <Button asChild className="justify-between">
                    <a href={primary.target_url} target="_blank" rel="noreferrer" onClick={() => record("click")}>
                      Open original
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {session?.access_token ? actionButtons.slice(1).map((item) => (
                  <Button key={item.action_type} variant="outline" className="justify-between border-white/15 bg-black/25 text-white hover:bg-white/10 hover:text-white" onClick={() => record(item.action_type)} disabled={recordAction.isPending}>
                    {item.label}
                    <item.icon className="h-4 w-4" />
                  </Button>
                )) : (
                  <p className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-white/50">
                    Sign in to record distribution actions and build points, PromoShare entries, and visible contributor status.
                  </p>
                )}
              </CardContent>
            </Card>

            {leaderboard.length ? (
              <ContributionReceipt
                title="Distribution leaderboard"
                items={leaderboard.map((row) => ({
                  label: `#${row.rank_position} ${row.user?.display_name || row.user?.username || "Contributor"}`,
                  detail: `${row.shares_count} shares · ${row.points_earned} points`,
                  value: `${row.promoshare_entries_earned} tickets`,
                }))}
              />
            ) : (
              <Card className="border-white/10 bg-white/[0.045] text-white">
                <CardContent className="p-4 text-sm text-white/50">
                  No recorded contributors yet. Early movers can shape the first rankings and own the first proof receipts.
                </CardContent>
              </Card>
            )}

            {primary?.target_url && (
              <Card className="border-white/10 bg-white/[0.045] text-white">
                <CardContent className="flex items-center gap-3 p-4 text-sm text-white/50">
                  <Link2 className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{primary.target_url}</span>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
