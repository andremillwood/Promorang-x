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
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/I18nContext";

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

function formatCount(result: CountResult, setup: string) {
  return result.available ? result.value.toLocaleString() : setup;
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
  const { t, formatNumber } = useI18n();
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
              {complete ? <Badge className="bg-emerald-600">{t("proofBld.ready")}</Badge> : <Badge variant="outline">{t("proofBld.build")}</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {step.unavailable ? t("proofBld.unavailable") : t("proofBld.ofTarget", { value: formatNumber(step.value), target: formatNumber(step.target) })}
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
  const { t } = useI18n();
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
        label: t("proofBld.stepSupply"),
        target: 40,
        value: data.moments30d.value,
        icon: CalendarPlus,
        action: t("proofBld.actCreate"),
        href: "/create/moment",
      },
      {
        label: t("proofBld.stepIncentive"),
        target: 15,
        value: data.rewardMoments30d.value + data.offers.value,
        icon: Gift,
        action: t("proofBld.actOffers"),
        href: "/offers",
        unavailable: !data.offers.available,
      },
      {
        label: t("proofBld.stepAction"),
        target: 500,
        value: data.checkIns30d.value + data.verifiedProofs.value,
        icon: QrCode,
        action: t("proofBld.actMoments"),
        href: "/admin?tab=moments",
        unavailable: !data.verifiedProofs.available && data.checkIns30d.value === 0,
      },
      {
        label: t("proofBld.stepStake"),
        target: 50,
        value: data.offerRedemptions.value + data.rewards30d.value,
        icon: PackageCheck,
        action: t("proofBld.actRewards"),
        href: "/offers",
        unavailable: !data.offerRedemptions.available,
      },
    ];
  }, [data, t]);

  const proofScore = proofSteps.length
    ? Math.round(proofSteps.reduce((sum, step) => sum + percent(step.value, step.target), 0) / proofSteps.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{t("proofBld.title")}</h2>
          </div>
          <GuidanceDisclosure
            id="admin-proof-builder:workspace-context"
            eyebrow={t("proofBld.guideEyebrow")}
            title={t("proofBld.guideTitle")}
            summary={t("proofBld.guideSum")}
            className="mt-3 max-w-3xl"
            tone="light"
          >
            <p className="text-sm text-muted-foreground">
              {t("proofBld.guideBody")}
            </p>
          </GuidanceDisclosure>
        </div>
        <Button variant="outline" onClick={() => proofQuery.refetch()} disabled={proofQuery.isFetching}>
          {proofQuery.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {t("proofBld.refresh")}
        </Button>
      </div>

      <Card className="overflow-hidden border-primary/20">
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
          <div>
            <Badge variant="outline" className="border-primary/30 text-primary">{t("proofBld.bridge")}</Badge>
            <h3 className="mt-4 font-serif text-3xl font-bold text-foreground">{t("proofBld.hero")}</h3>
            <GuidanceDisclosure
              id="admin-proof-builder:activation-bridge"
              eyebrow={t("proofBld.actEyebrow")}
              title={t("proofBld.actTitle")}
              summary={t("proofBld.actSum")}
              className="mt-3"
              tone="light"
            >
              <p className="text-sm leading-6 text-muted-foreground">
                {t("proofBld.actBody")}
              </p>
            </GuidanceDisclosure>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/create/moment">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  {t("proofBld.createMom")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/offers">
                  <Gift className="mr-2 h-4 w-4" />
                  {t("proofBld.attach")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin?tab=promopush">
                  <Megaphone className="mr-2 h-4 w-4" />
                  {t("proofBld.traffic")}
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">{t("proofBld.readiness")}</p>
                <p className="mt-2 text-4xl font-black text-foreground">{proofQuery.isLoading ? "--" : `${proofScore}%`}</p>
              </div>
              <Target className="h-10 w-10 text-primary" />
            </div>
            <Progress value={proofQuery.isLoading ? 0 : proofScore} className="mt-4 h-3" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("proofBld.target")}
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
            <ProofMetricCard label={t("proofBld.mom30")} value={formatCount(data.moments30d, t("proofBld.setup"))} helper={t("proofBld.mom7", { count: data.moments7d.value })} icon={CalendarPlus} tone="bg-blue-500/10 text-blue-600" />
            <ProofMetricCard label={t("proofBld.joins30")} value={formatCount(data.joined30d, t("proofBld.setup"))} helper={t("proofBld.joinsHelp")} icon={Users} tone="bg-emerald-500/10 text-emerald-600" />
            <ProofMetricCard label={t("proofBld.check30")} value={formatCount(data.checkIns30d, t("proofBld.setup"))} helper={t("proofBld.checkHelp")} icon={QrCode} tone="bg-primary/10 text-primary" />
            <ProofMetricCard label={t("proofBld.rew30")} value={formatCount(data.rewards30d, t("proofBld.setup"))} helper={t("proofBld.rewHelp")} icon={BadgeDollarSign} tone="bg-amber-500/10 text-amber-700" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>{t("proofBld.ladder")}</CardTitle>
                <CardDescription>{t("proofBld.ladderCopy")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {proofSteps.map((step) => <ProofLadderStep key={step.label} step={step} />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("proofBld.playbook")}</CardTitle>
                <GuidanceDisclosure
                  id="admin-proof-builder:operator-playbook"
                  eyebrow={t("proofBld.playEyebrow")}
                  title={t("proofBld.playTitle")}
                  summary={t("proofBld.playSum")}
                  className="mt-3"
                  tone="light"
                >
                  <CardDescription>{t("proofBld.playBody")}</CardDescription>
                </GuidanceDisclosure>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: CalendarPlus, title: t("proofBld.seedTitle"), text: t("proofBld.seedText") },
                  { icon: Gift, title: t("proofBld.offerTitle"), text: t("proofBld.offerText") },
                  { icon: QrCode, title: t("proofBld.qrTitle"), text: t("proofBld.qrText") },
                  { icon: ClipboardList, title: t("proofBld.reportTitle"), text: t("proofBld.reportText") },
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
                <p className="text-2xl font-black">{formatCount(data.venues, t("proofBld.setup"))}</p>
                <p className="mt-1 font-semibold">{t("proofBld.venues")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("proofBld.venuesHelp")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <Gift className="mb-3 h-5 w-5 text-pink-600" />
                <p className="text-2xl font-black">{formatCount(data.offers, t("proofBld.setup"))}</p>
                <p className="mt-1 font-semibold">{t("proofBld.offers")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("proofBld.offersHelp")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-600" />
                <p className="text-2xl font-black">{formatCount(data.offerRedemptions, t("proofBld.setup"))}</p>
                <p className="mt-1 font-semibold">{t("proofBld.redemptions")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("proofBld.redemptionsHelp")}</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">{t("proofBld.loadFail")}</CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminProofBuilderTab;
