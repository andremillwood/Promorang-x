import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ArrowRight, FlaskConical, Target, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const JOURNEY_LABEL: Record<string, TranslationKey> = {
  all: "growTab.jAll",
  participant: "growTab.jPart",
  commercial: "growTab.jComm",
  shared: "growTab.jShare",
};

async function growthRequest(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${API_BASE_URL}/growth-ops${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${data.session?.access_token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Growth request failed");
  return payload.data;
}

export function AdminGrowthTab() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [journey, setJourney] = useState("all");
  const [experiment, setExperiment] = useState({ key: "", name: "", hypothesis: "" });
  const scorecard = useQuery({
    queryKey: ["growth-scorecard", journey],
    queryFn: () => growthRequest(`/scorecard${journey === "all" ? "" : `?journey=${journey}`}`),
  });
  const experiments = useQuery({ queryKey: ["growth-experiments"], queryFn: () => growthRequest("/experiments") });
  const createExperiment = useMutation({
    mutationFn: () => growthRequest("/experiments", {
      method: "POST",
      body: JSON.stringify({
        experimentKey: experiment.key.trim(), name: experiment.name.trim(), hypothesis: experiment.hypothesis.trim(),
        journey: journey === "all" ? "participant" : journey,
        primaryEvent: "verified_outcome", guardrailEvent: "signup_completed",
        variants: [{ key: "control", weight: 1 }, { key: "treatment", weight: 1 }], status: "draft",
      }),
    }),
    onSuccess: () => {
      setExperiment({ key: "", name: "", hypothesis: "" });
      queryClient.invalidateQueries({ queryKey: ["growth-experiments"] });
    },
  });
  const updateExperiment = useMutation({
    mutationFn: ({ key, status }: { key: string; status: string }) => growthRequest(`/experiments/${key}`, {
      method: "PATCH", body: JSON.stringify({ status }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["growth-experiments"] }),
  });

  if (scorecard.isLoading) return <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}</div>;
  if (scorecard.error) return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">{(scorecard.error as Error).message}. Apply the growth operating-system migration before using this dashboard.</div>;

  const data = scorecard.data;
  const cards = [
    { label: t("growTab.verified"), value: data?.northStar?.verifiedOutcomes || 0, icon: Target },
    { label: t("growTab.activeMom"), value: data?.northStar?.activeMoments || 0, icon: Activity },
    { label: t("growTab.perMom"), value: data?.northStar?.outcomesPerActiveMoment || 0, icon: TrendingUp },
    { label: t("growTab.signupAct"), value: `${data?.funnel?.signupToActivationRate || 0}%`, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t("growTab.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold">{t("growTab.title")}</h2>
          <GuidanceDisclosure
            id="admin-growth:north-star"
            eyebrow={t("growTab.guideEyebrow")}
            title={t("growTab.guideTitle")}
            summary={t("growTab.guideSum")}
            className="mt-3 max-w-2xl"
            tone="light"
          >
            <p className="text-sm text-muted-foreground">{t("growTab.guideBody")}</p>
          </GuidanceDisclosure>
        </div>
        <div className="flex rounded-xl border bg-muted/40 p-1">
          {["all", "participant", "commercial", "shared"].map((item) => (
            <button
              key={item}
              onClick={() => setJourney(item)}
              className={`rounded-lg px-3 py-2 text-xs font-bold ${journey === item ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              {t(JOURNEY_LABEL[item])}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => <div key={card.label} className="rounded-2xl border bg-card p-5"><card.icon className="h-5 w-5 text-primary" /><p className="mt-7 text-3xl font-black">{card.value}</p><p className="mt-1 text-xs text-muted-foreground">{card.label}</p></div>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border bg-card p-5">
          <h3 className="font-bold">{t("growTab.funnel")}</h3>
          <div className="mt-5 grid gap-2 sm:grid-cols-5">
            {[
              [t("growTab.visitors"), data?.funnel?.visitors],
              [t("growTab.signups"), data?.funnel?.signups],
              [t("growTab.activated"), data?.funnel?.activated],
              [t("growTab.amplified"), data?.funnel?.amplified],
              [t("growTab.retained"), data?.funnel?.retained],
            ].map(([label, value], index) => (
              <div key={String(label)} className="relative rounded-xl bg-muted/40 p-4">
                <p className="text-2xl font-black">{value || 0}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
                {index < 4 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 text-muted-foreground sm:block" />}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <p className="rounded-xl border p-3 text-sm"><strong>{data?.funnel?.visitorToSignupRate || 0}%</strong><br /><span className="text-muted-foreground">{t("growTab.visToSign")}</span></p>
            <p className="rounded-xl border p-3 text-sm"><strong>{data?.funnel?.activationToAmplificationRate || 0}%</strong><br /><span className="text-muted-foreground">{t("growTab.actToShare")}</span></p>
            <p className="rounded-xl border p-3 text-sm"><strong>{data?.funnel?.repeatOutcomeRate || 0}%</strong><br /><span className="text-muted-foreground">{t("growTab.repeat")}</span></p>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h3 className="font-bold">{t("growTab.sources")}</h3>
          <div className="mt-4 space-y-2">
            {(data?.sources || []).slice(0, 6).map((source: any) => (
              <div key={`${source.source}-${source.medium}-${source.campaign}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl bg-muted/40 p-3 text-sm">
                <div>
                  <p className="font-bold">{source.source} / {source.medium}</p>
                  <p className="text-xs text-muted-foreground">{source.campaign}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{source.signups}</p>
                  <p className="text-[10px] text-muted-foreground">{t("growTab.signupsLbl")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{source.outcomes}</p>
                  <p className="text-[10px] text-muted-foreground">{t("growTab.outcomesLbl")}</p>
                </div>
              </div>
            ))}
            {!data?.sources?.length && <p className="py-10 text-center text-sm text-muted-foreground">{t("growTab.noSources")}</p>}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t("growTab.pioneerEyebrow")}</p>
            <h3 className="mt-2 text-xl font-bold">{t("growTab.pioneerTitle")}</h3>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t("growTab.pioneerCopy")}</p>
          </div>
          {data?.pioneer?.season && <span className="rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-bold">{data.pioneer.season.name} · {data.pioneer.season.status}</span>}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-5">
          {[
            [t("growTab.receipts"), data?.pioneer?.verifiedContributions || 0],
            [t("growTab.points"), data?.pioneer?.verifiedPoints || 0],
            [t("growTab.contributors"), data?.pioneer?.contributors || 0],
            [t("growTab.pending"), data?.pioneer?.pendingReviews || 0],
            [t("growTab.fraud"), data?.pioneer?.fraudFlags || 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border bg-background p-4">
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        {!!data?.pioneer?.byRole?.length && (
          <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {data.pioneer.byRole.map((role: any) => (
              <div key={role.contributorType} className="rounded-xl bg-background/70 p-3">
                <p className="text-xs font-black uppercase tracking-wider text-primary">{role.contributorType.replaceAll("_", " ")}</p>
                <p className="mt-2 text-lg font-bold">{t("growTab.pts", { count: role.verifiedPoints })}</p>
                <p className="text-[11px] text-muted-foreground">{t("growTab.roleMeta", { people: role.contributors, receipts: role.verifiedContributions })}</p>
              </div>
            ))}
          </div>
        )}
        {data?.pioneer?.unavailable && <p className="mt-4 text-sm text-amber-600">{t("growTab.pioneerOff")}</p>}
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" /><h3 className="font-bold">{t("growTab.registry")}</h3></div>
        <GuidanceDisclosure
          id="admin-growth:experiment-registry"
          eyebrow={t("growTab.expEyebrow")}
          title={t("growTab.expTitle")}
          summary={t("growTab.expSum")}
          className="mt-3"
          tone="light"
        >
          <p className="text-sm text-muted-foreground">{t("growTab.expBody")}</p>
        </GuidanceDisclosure>
        <div className="mt-5 grid gap-3 lg:grid-cols-[180px_220px_1fr_auto]">
          <Input placeholder={t("growTab.keyPh")} value={experiment.key} onChange={(event) => setExperiment({ ...experiment, key: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
          <Input placeholder={t("growTab.namePh")} value={experiment.name} onChange={(event) => setExperiment({ ...experiment, name: event.target.value })} />
          <Input placeholder={t("growTab.hypPh")} value={experiment.hypothesis} onChange={(event) => setExperiment({ ...experiment, hypothesis: event.target.value })} />
          <Button disabled={!experiment.key || !experiment.name || !experiment.hypothesis || createExperiment.isPending} onClick={() => createExperiment.mutate()}>{t("growTab.register")}</Button>
        </div>
        {createExperiment.error && <p className="mt-2 text-sm text-destructive">{(createExperiment.error as Error).message}</p>}
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(experiments.data || []).map((item: any) => (
            <article key={item.experiment_key} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{item.name}</p>
                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase">{item.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.hypothesis}</p>
              <p className="mt-3 text-xs">{t("growTab.primary", { event: item.primary_event, pct: item.allocation_percent })}</p>
              <div className="mt-4 flex gap-2">
                {item.status !== "running" && item.status !== "completed" && (
                  <Button size="sm" variant="outline" onClick={() => updateExperiment.mutate({ key: item.experiment_key, status: "running" })}>{t("growTab.start")}</Button>
                )}
                {item.status === "running" && (
                  <Button size="sm" variant="outline" onClick={() => updateExperiment.mutate({ key: item.experiment_key, status: "paused" })}>{t("growTab.pause")}</Button>
                )}
                {item.status !== "completed" && (
                  <Button size="sm" variant="ghost" onClick={() => updateExperiment.mutate({ key: item.experiment_key, status: "completed" })}>{t("growTab.complete")}</Button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
