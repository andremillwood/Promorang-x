import { useState } from "react";
import { ArrowRight, BadgeDollarSign, Route, Share2 } from "lucide-react";
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
      <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">How people move through you</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Share2, title: "Share", copy: "Send something useful because it fits the person." },
            { icon: Route, title: "Credit", copy: "Use a recorded route when you want later referral activity attributed to you." },
            { icon: BadgeDollarSign, title: "Earn — when configured", copy: "A reward or commission only exists when the qualifying action has a funded rule." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <item.icon className="h-4 w-4 text-primary" />
              <p className="mt-3 text-sm font-black">{item.title}</p>
              <p className="mt-1 text-[11px] leading-5 text-white/45">{item.copy}</p>
            </div>
          ))}
        </div>
        <Link to="/referrals" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-primary">
          See tracked referrals & rewards <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatPile label={t("people.people")} value={data?.people || 0} hint={data?.thisMonth ? t("peopleNet.hintMonth", { count: data.thisMonth }) : t("peopleNet.hintStart")} />
        <StatPile label={t("peopleNet.broughtByYou")} value={data?.direct || 0} hint={t("peopleNet.throughNetwork", { count: data?.throughNetwork || 0 })} />
      </section>

      <div>
        <button
          type="button"
          onClick={handleInvite}
          className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black"
        >
          {copied ? t("peopleNet.inviteCopied") : "Invite someone who would actually value this"}
        </button>
        <p className="mt-2 text-center text-[10px] leading-4 text-white/35">An invite can help someone join. Use your tracked referral route when you need attribution; rewards are never implied by the share alone.</p>
      </div>

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
