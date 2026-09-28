import { trackGrowthEvent } from "@/lib/marketing-attribution";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CREATE_INTENTS, resolveCreateIntent } from "@promorang/shared";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { resolveDemandRole } from "@/lib/discovery-demand";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { localizedCreateIntent } from "@/i18n/localize";

export default function CreateSomething() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { ask } = useExperienceActions();
  const to = useExperiencePath();
  const { toast } = useToast();
  const { activeRole } = useAuth();
  const selected = resolveCreateIntent(params.get("intent"));
  const [question, setQuestion] = useState("");

  const submitAsk = async () => {
    try {
      const result = await ask.mutateAsync({
        question,
        sceneId: params.get("hub") || undefined,
        category: "community",
        kind: params.get("hub") ? "demand" : undefined,
      });
      if (params.get("hub") && result?.id) void trackGrowthEvent({ eventName: "cta_clicked", journey: "participant", stage: "outcome", entityType: "scene", entityId: params.get("hub")!, properties: { action: "scene_contribution_completed", kind: "want", contributionId: result.id } });
      toast({ title: t("create.asked"), description: t("create.askedCopy") });
      navigate(params.get("scene_slug") ? `/scenes/${encodeURIComponent(params.get("scene_slug")!)}` : to("/happened"));
    } catch (error) {
      toast({ title: t("create.askFailed"), description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <ExperienceShell
      eyebrow={t("create.eyebrow")}
      title={t("create.title")}
      description={t("create.copy")}
    >
      <DiscoveryDemandInbox role={resolveDemandRole(activeRole)} variant="peek" />

      <div className="grid gap-2">
        {CREATE_INTENTS.map((item) => (
          <Link
            key={item.intent}
            to={(() => {
              if (item.intent === "answer") return `${to("/create")}?intent=answer${params.get("hub") ? `&hub=${encodeURIComponent(params.get("hub")!)}&scene_slug=${encodeURIComponent(params.get("scene_slug") || "")}` : ""}`;
              const [path, qs] = item.href.split("?");
              const stayInPeople = ["/give", "/people", "/create", "/earn", "/happened", "/card", "/start"].some(
                (prefix) => path === prefix || path.startsWith(`${prefix}/`),
              );
              const dest = stayInPeople ? to(path) : path;
              return qs ? `${dest}?${qs}` : dest;
            })()}
            className={`rounded-[1.5rem] border px-4 py-4 ${selected.intent === item.intent ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04]"}`}
          >
            <p className="font-serif text-2xl font-bold">{localizedCreateIntent(item.intent, t).label}</p>
            <p className="mt-1 text-sm text-white/50">{localizedCreateIntent(item.intent, t).prompt}</p>
          </Link>
        ))}
      </div>

      {selected.intent === "answer" ? (
        <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
          <h2 className="font-serif text-2xl font-bold">{t("create.askTitle")}</h2>
          <textarea
            aria-label={t("create.askTitle")}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
            placeholder={t("create.askPh")}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
          />
          <button
            type="button"
            disabled={!question.trim() || ask.isPending}
            onClick={submitAsk}
            className="min-h-12 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
          >
            {t("create.askThem")}
          </button>
        </section>
      ) : null}
    </ExperienceShell>
  );
}
