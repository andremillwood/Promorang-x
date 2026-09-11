import { useState } from "react";
import { Link } from "react-router-dom";
import { useExperienceNetwork, useExperienceActions } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty, StatPile } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";

export default function MyPeople() {
  const { t } = useI18n();
  const network = useExperienceNetwork();
  const { invite } = useExperienceActions();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const data = network.data;

  const handleInvite = async () => {
    try {
      const firstScene = data?.sceneSlug;
      const result = firstScene
        ? await invite.mutateAsync(firstScene)
        : { shareUrl: `${window.location.origin}/auth?mode=signup` };
      await navigator.clipboard.writeText(result.shareUrl);
      setCopied(true);
      toast({ title: t("peopleNet.inviteReady"), description: t("peopleNet.inviteReadyCopy") });
    } catch (error) {
      toast({ title: t("peopleNet.copyFailed"), description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <ExperienceShell
      eyebrow={t("peopleNet.eyebrow")}
      title={t("peopleNet.title")}
      description={t("peopleNet.copy")}
    >
      <section className="grid grid-cols-2 gap-3">
        <StatPile label={t("people.people")} value={data?.people || 0} hint={data?.thisMonth ? t("peopleNet.hintMonth", { count: data.thisMonth }) : t("peopleNet.hintStart")} />
        <StatPile label={t("peopleNet.broughtByYou")} value={data?.direct || 0} hint={t("peopleNet.throughNetwork", { count: data?.throughNetwork || 0 })} />
      </section>

      <button
        type="button"
        onClick={handleInvite}
        className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black"
      >
        {copied ? t("peopleNet.inviteCopied") : t("peopleNet.inviteFriend")}
      </button>

      <section>
        <h2 className="font-serif text-2xl font-bold">{t("peopleNet.topContributors")}</h2>
        <p className="mt-1 text-sm text-white/50">{t("peopleNet.topCopy")}</p>
        {network.isLoading ? (
          <div className="mt-4 h-32 animate-pulse rounded-[1.5rem] bg-white/5" />
        ) : data?.topContributors?.length ? (
          <div className="mt-4 space-y-3">
            {data.topContributors.map((person: any) => (
              <article key={person.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-2xl font-bold">{person.name}</h3>
                    <p className="mt-1 text-sm text-white/55">{t("peopleNet.peopleActive", { people: person.people, active: person.active })}</p>
                  </div>
                  <p className="text-xs text-white/40">{t("peopleNet.verified", { count: person.verifiedActions })}</p>
                </div>
                {person.attributedValue ? (
                  <p className="mt-2 text-sm text-primary">{t("peopleNet.attributed", { amount: Math.round(person.attributedValue).toLocaleString() })}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <QuietEmpty
              title={t("peopleNet.emptyTitle")}
              copy={t("peopleNet.emptyCopy")}
              action={<Link to="/give" className="text-sm font-bold text-primary">{t("peopleNet.giveReason")}</Link>}
            />
          </div>
        )}
      </section>
    </ExperienceShell>
  );
}
