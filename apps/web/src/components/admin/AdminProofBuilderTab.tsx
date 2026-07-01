import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeDollarSign,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Gift,
  Loader2,
  MapPin,
  Megaphone,
  PackageCheck,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type CountResult = {
  value: number;
  available: boolean;
};

type ProofBuilderData = {
  moments30d: CountResult;
  moments7d: CountResult;
  rewardMoments30d: CountResult;
  joined30d: CountResult;
  checkIns30d: CountResult;
  rewards30d: CountResult;
  venues: CountResult;
  offers: CountResult;
  offerRedemptions: CountResult;
  verifiedProofs: CountResult;
};

type ProofStep = {
  label: string;
  target: number;
  value: number;
  icon: typeof CalendarPlus;
  action: string;
  href: string;
  unavailable?: boolean;
};

const thirtyDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
};

const sevenDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString();
};

async function getCount(query: PromiseLike<{ count: number | null; error: unknown }>): Promise<CountResult> {
  const { count, error } = await query;
  if (error) return { value: 0, available: false };
  return { value: count || 0, available: true };
}

function percent(value: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

function formatCount(result: CountResult) {
  return result.available ? result.value.toLocaleString() : "Setup";
}

function ProofMetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof CalendarPlus;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-2xl font-black text-foreground">{value}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function ProofLadderStep({ step }: { step: ProofStep }) {
  const progress = step.unavailable ? 0 : percent(step.value, step.target);
  const complete = progress >= 100;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className={complete ? "rounded-lg bg-emerald-500/10 p-2 text-emerald-600" : "rounded-lg bg-primary/10 p-2 text-primary"}>
            <step.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-foreground">{step.label}</p>
              {complete ? <Badge className="bg-emerald-600">Ready</Badge> : <Badge variant="outline">Build</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {step.unavailable ? "Data relation is not available in this environment." : `${step.value.toLocaleString()} of ${step.target.toLocaleString()} target`}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link to={step.href}>{step.action}</Link>
        </Button>
      </div>
      <Progress value={progress} className="mt-4 h-2" />
    </div>
  );
}

export function AdminProofBuilderTab() {
  const proofQuery = useQuery({
    queryKey: ["admin-proof-builder"],
    queryFn: async (): Promise<ProofBuilderData> => {
      const since30 = thirtyDaysAgo();
      const since7 = sevenDaysAgo();

      const [
        moments30d,
        moments7d,
        rewardMoments30d,
        joined30d,
        checkIns30d,
        rewards30d,
        venues,
        offers,
        offerRedemptions,
        verifiedProofs,
      ] = await Promise.all([
        getCount(supabase.from("moments").select("*", { count: "exact", head: true }).gte("created_at", since30)),
        getCount(supabase.from("moments").select("*", { count: "exact", head: true }).gte("created_at", since7)),
        getCount(supabase.from("moments").select("*", { count: "exact", head: true }).not("reward", "is", null).gte("created_at", since30)),
        getCount(supabase.from("moment_participants").select("*", { count: "exact", head: true }).gte("joined_at", since30)),
        getCount(supabase.from("check_ins").select("*", { count: "exact", head: true }).gte("checked_in_at", since30)),
        getCount(supabase.from("rewards").select("*", { count: "exact", head: true }).gte("earned_at", since30)),
        getCount(supabase.from("venues").select("*", { count: "exact", head: true }).eq("is_active", true)),
        getCount(supabase.from("offers" as never).select("*", { count: "exact", head: true })),
        getCount(supabase.from("offer_issuances" as never).select("*", { count: "exact", head: true }).eq("status", "redeemed")),
        getCount(supabase.from("proof_submissions" as never).select("*", { count: "exact", head: true }).eq("status", "verified")),
      ]);

      return {
        moments30d,
        moments7d,
        rewardMoments30d,
        joined30d,
        checkIns30d,
        rewards30d,
        venues,
        offers,
        offerRedemptions,
        verifiedProofs,
      };
    },
  });

  const data = proofQuery.data;
  const proofSteps = useMemo<ProofStep[]>(() => {
    if (!data) return [];

    return [
      {
        label: "Moment supply",
        target: 40,
        value: data.moments30d.value,
        icon: CalendarPlus,
        action: "Create",
        href: "/create/moment",
      },
      {
        label: "Incentive supply",
        target: 15,
        value: data.rewardMoments30d.value + data.offers.value,
        icon: Gift,
        action: "Offers",
        href: "/offers",
        unavailable: !data.offers.available,
      },
      {
        label: "Verified action",
        target: 500,
        value: data.checkIns30d.value + data.verifiedProofs.value,
        icon: QrCode,
        action: "Moments",
        href: "/admin?tab=moments",
        unavailable: !data.verifiedProofs.available && data.checkIns30d.value === 0,
      },
      {
        label: "Stakeholder proof",
        target: 50,
        value: data.offerRedemptions.value + data.rewards30d.value,
        icon: PackageCheck,
        action: "Rewards",
        href: "/offers",
        unavailable: !data.offerRedemptions.available,
      },
    ];
  }, [data]);

  const proofScore = proofSteps.length
    ? Math.round(proofSteps.reduce((sum, step) => sum + percent(step.value, step.target), 0) / proofSteps.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Proof Builder</h2>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Use this superadmin workspace to move Promorang from product capability into visible market proof: moment supply, funded incentives, verified participation, and stakeholder reports.
          </p>
        </div>
        <Button variant="outline" onClick={() => proofQuery.refetch()} disabled={proofQuery.isFetching}>
          {proofQuery.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden border-primary/20">
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
          <div>
            <Badge variant="outline" className="border-primary/30 text-primary">Activation bridge</Badge>
            <h3 className="mt-4 font-serif text-3xl font-bold text-foreground">Build the proof that makes Promorang obvious.</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The target is not more abstract features. The target is a repeatable evidence packet: people showed up, value was issued, rewards were redeemed, and a venue or brand can see what happened.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/create/moment">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Create proof moment
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/offers">
                  <Gift className="mr-2 h-4 w-4" />
                  Attach incentive
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin?tab=promopush">
                  <Megaphone className="mr-2 h-4 w-4" />
                  Drive traffic
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">Proof readiness</p>
                <p className="mt-2 text-4xl font-black text-foreground">{proofQuery.isLoading ? "--" : `${proofScore}%`}</p>
              </div>
              <Target className="h-10 w-10 text-primary" />
            </div>
            <Progress value={proofQuery.isLoading ? 0 : proofScore} className="mt-4 h-3" />
            <p className="mt-4 text-sm text-muted-foreground">
              First critical mass target: 40 moments, 15 funded incentives, 500 verified actions, and 50 reward or redemption outcomes in a 30-day window.
            </p>
          </div>
        </CardContent>
      </Card>

      {proofQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ProofMetricCard label="Moments in 30d" value={formatCount(data.moments30d)} helper={`${data.moments7d.value} created in the last 7 days`} icon={CalendarPlus} tone="bg-blue-500/10 text-blue-600" />
            <ProofMetricCard label="Joins in 30d" value={formatCount(data.joined30d)} helper="Intent before physical proof" icon={Users} tone="bg-emerald-500/10 text-emerald-600" />
            <ProofMetricCard label="Check-ins in 30d" value={formatCount(data.checkIns30d)} helper="Verified attendance signal" icon={QrCode} tone="bg-primary/10 text-primary" />
            <ProofMetricCard label="Rewards in 30d" value={formatCount(data.rewards30d)} helper="Issued value participants can feel" icon={BadgeDollarSign} tone="bg-amber-500/10 text-amber-700" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Proof Ladder</CardTitle>
                <CardDescription>Work these four constraints until the story becomes self-evident.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {proofSteps.map((step) => <ProofLadderStep key={step.label} step={step} />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operator Playbook</CardTitle>
                <CardDescription>Use these actions to stop the loop from depending on you manually keeping events alive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: CalendarPlus, title: "Seed 10 claimable moments", text: "Create simple public moments for real venues or hosts, then invite owners to claim and repeat them." },
                  { icon: Gift, title: "Attach one offer to each priority moment", text: "Start with low-cost rewards: discount, free add-on, early entry, raffle entry, or Gems from a small pool." },
                  { icon: QrCode, title: "Force every activation through check-in", text: "QR or code check-in must be the proof spine. No report is useful if attendance is not verified." },
                  { icon: ClipboardList, title: "Package the Monday proof report", text: "For every real activation, capture check-ins, redemptions, UGC, referrals, repeat visitors, and estimated spend." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 rounded-xl border border-border bg-background p-4">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <MapPin className="mb-3 h-5 w-5 text-orange-600" />
                <p className="text-2xl font-black">{formatCount(data.venues)}</p>
                <p className="mt-1 font-semibold">Active venues</p>
                <p className="mt-1 text-xs text-muted-foreground">Venue supply available for proof moments.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <Gift className="mb-3 h-5 w-5 text-pink-600" />
                <p className="text-2xl font-black">{formatCount(data.offers)}</p>
                <p className="mt-1 font-semibold">Configured offers</p>
                <p className="mt-1 text-xs text-muted-foreground">Coupons, rewards, access, products, or custom value.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-600" />
                <p className="text-2xl font-black">{formatCount(data.offerRedemptions)}</p>
                <p className="mt-1 font-semibold">Offer redemptions</p>
                <p className="mt-1 text-xs text-muted-foreground">The strongest venue/brand proof signal.</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">Proof data could not be loaded.</CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminProofBuilderTab;
