import { useSearchParams } from "react-router-dom";
import { getStakeholderLens, humanActionLabel } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatHappened } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty, StatPile } from "@/components/people/ExperienceShell";
import { useI18n } from "@/i18n/I18nContext";
import { localizeLens } from "@/i18n/localize";

export default function WhatHappened() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const { activeRole } = useAuth();
  const lens = localizeLens(getStakeholderLens(activeRole), t);
  const happened = useWhatHappened(params.get("hub") || undefined);
  const data = happened.data;
  const buckets = data?.buckets || {};

  return (
    <ExperienceShell
      eyebrow={lens.activity.label}
      title={t("happened.title")}
      description={lens.activity.meaning}
      backTo="/dashboard"
    >
      <StatPile
        label={t("happened.participated")}
        value={data?.participated || 0}
        hint={data?.earned ? t("happened.generated", { amount: Math.round(data.earned).toLocaleString() }) : t("happened.verifiedOnly")}
      />

      <section className="grid grid-cols-2 gap-3">
        {[
          [t("happened.went"), buckets.went],
          [t("happened.bought"), buckets.bought],
          [t("happened.answered"), buckets.answered],
          [t("happened.shared"), buckets.shared],
          [t("happened.brought"), buckets.brought],
          [t("happened.claimed"), buckets.claimed],
          [t("happened.used"), buckets.used],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="font-serif text-3xl font-bold">{value || 0}</p>
            <p className="mt-1 text-xs text-white/50">{label}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">{t("happened.interests")}</h2>
        {data?.topInterests?.length ? (
          <ol className="mt-3 space-y-2">
            {data.topInterests.map((interest: string, index: number) => (
              <li key={interest} className="rounded-[1.3rem] border border-white/10 px-4 py-3 text-sm">
                {index + 1}. {interest}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-white/45">{t("happened.interestsEmpty")}</p>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">{t("happened.recent")}</h2>
        {data?.recent?.length ? (
          <div className="mt-3 space-y-2">
            {data.recent.map((row: any) => (
              <p key={row.id} className="rounded-[1.2rem] border border-white/10 px-4 py-3 text-sm text-white/70">
                {row.actorName || t("happened.someone")} {humanActionLabel(row.action_type)}
              </p>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <QuietEmpty title={t("happened.quietTitle")} copy={t("happened.quietCopy")} />
          </div>
        )}
      </section>
    </ExperienceShell>
  );
}
