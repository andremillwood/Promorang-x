import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Share2, Users, CheckCircle2, Ticket, Sparkles } from "lucide-react";
import ConsumerShell from "@/components/consumer/ConsumerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckIn, useJoinedMoments } from "@/hooks/useMoments";
import { useReferralCodes } from "@/hooks/useReferrals";
import { useI18n } from "@/i18n/I18nContext";

export default function ConsumerMomentPreview() {
  const { t, formatDate } = useI18n();
  const id = new URLSearchParams(window.location.search).get("moment") || undefined;
  const { user, profile } = useAuth();
  const joined = useJoinedMoments();
  const checkIn = useCheckIn();
  const referrals = useReferralCodes();
  const [localPlanned, setLocalPlanned] = useState(false);

  const momentQuery = useQuery({
    queryKey: ["consumer-moment-preview", id],
    enabled: Boolean(id),
    queryFn: async () => {
      let query = supabase.from("moments").select("*");
      const isUuid = /^[0-9a-f-]{36}$/i.test(id || "");
      query = isUuid ? query.eq("id", id!) : query.eq("slug", id!);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const moment = momentQuery.data;
  const isJoined = useMemo(() => (joined.data || []).some((m: any) => m.id === moment?.id), [joined.data, moment?.id]);
  const planned = isJoined || localPlanned;
  const displayName = (profile as any)?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || t("consMom.fallbackName");
  const initial = displayName.charAt(0).toUpperCase();
  const referralCode = referrals.data?.[0]?.code;

  const when = moment?.starts_at
    ? formatDate(moment.starts_at, { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : t("consMom.timeTba");

  const shareMoment = async () => {
    const url = `${window.location.origin}/moments/${moment?.slug || moment?.id}${referralCode ? `?ref=${encodeURIComponent(referralCode)}` : ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: moment?.title || t("consMom.shareTitle"), text: t("consMom.shareText"), url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
  };

  if (momentQuery.isLoading) {
    return <ConsumerShell locationLabel="Kingston"><div className="py-20 text-sm text-muted-foreground">{t("consMom.loading")}</div></ConsumerShell>;
  }

  if (!moment) {
    return <ConsumerShell locationLabel="Kingston"><div className="py-20"><h1 className="font-serif text-4xl">{t("consMom.unavailable")}</h1><a href="/?preview=consumer" className="mt-4 inline-flex text-primary font-black">{t("consMom.backHome")}</a></div></ConsumerShell>;
  }

  const loopSteps = [t("consMom.loop1"), t("consMom.loop2"), t("consMom.loop3"), t("consMom.loop4")];

  return (
    <ConsumerShell locationLabel="Kingston" actions={<div className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-xs font-black text-background">{initial}</div>}>
      <article className="pb-24 md:pb-12">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)] lg:gap-12">
          <div>
            <div className="overflow-hidden bg-muted aspect-[16/10] md:aspect-[16/9]">
              {moment.image_url ? <img src={moment.image_url} alt={moment.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground">{t("consMom.fallbackImage")}</div>}
            </div>

            <div className="py-7 md:py-9">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">{t("consMom.kicker", { category: moment.category || t("consMom.fallbackCategory") })}</p>
              <h1 className="mt-2 max-w-4xl font-serif text-5xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-7xl">{moment.title}</h1>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />{when}</span>
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{moment.venue_name || moment.location || t("consPrev.locationTba")}</span>
              </div>
              {moment.description ? <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{moment.description}</p> : null}
            </div>

            <section className="border-y border-border py-7">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{t("consMom.why")}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div><strong className="block text-lg">{t("consMom.relevant")}</strong><span className="text-sm text-muted-foreground">{t("consMom.relevantText")}</span></div>
                <div><strong className="block text-lg">{t("consMom.timely")}</strong><span className="text-sm text-muted-foreground">{t("consMom.timelyText")}</span></div>
                <div><strong className="block text-lg">{t("consMom.participatory")}</strong><span className="text-sm text-muted-foreground">{t("consMom.participatoryText")}</span></div>
              </div>
            </section>

            <section className="mt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{t("consMom.loop")}</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{t("consMom.loopTitle")}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                {loopSteps.map((label, index) => (
                  <div key={label} className="border-t border-border pt-4"><span className="text-[10px] font-black text-primary">0{index + 1}</span><strong className="mt-5 block text-sm">{label}</strong></div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section className="border border-border bg-card p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{t("consMom.yourMove")}</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em]">{planned ? t("consMom.plannedTitle") : t("consMom.unplannedTitle")}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{planned ? t("consMom.plannedCopy") : t("consMom.unplannedCopy")}</p>
              <div className="mt-5 grid gap-2">
                <button onClick={() => setLocalPlanned(true)} className="w-full bg-primary px-4 py-3 text-sm font-black text-primary-foreground">{planned ? t("consMom.inPlan") : t("consMom.interested")}</button>
                <button onClick={shareMoment} className="inline-flex w-full items-center justify-center gap-2 border border-border bg-background px-4 py-3 text-sm font-black"><Share2 className="h-4 w-4" /> {t("consMom.inviteCrew")}</button>
              </div>
            </section>

            <section className="border-t border-border pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{t("consMom.access")}</p>
              <div className="mt-3 flex items-start gap-3"><Ticket className="mt-1 h-5 w-5 text-primary" /><div><strong className="block">{t("consMom.accessTitle")}</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("consMom.accessCopy")}</p></div></div>
            </section>

            <section className="border-t border-border pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{t("consMom.eventDay")}</p>
              <div className="mt-3 flex items-start gap-3"><Users className="mt-1 h-5 w-5 text-primary" /><div><strong className="block">{t("consMom.eventTitle")}</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("consMom.eventCopy")}</p></div></div>
              {isJoined && user ? <button onClick={() => checkIn.mutate(moment.id)} disabled={checkIn.isPending} className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-border bg-background px-4 py-3 text-sm font-black"><CheckCircle2 className="h-4 w-4" />{checkIn.isPending ? t("consMom.checkingIn") : t("consMom.checkIn")}</button> : null}
            </section>

            <section className="border-t border-border pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{t("consMom.proof")}</p>
              <div className="mt-3 flex items-start gap-3"><Sparkles className="mt-1 h-5 w-5 text-primary" /><div><strong className="block">{t("consMom.proofTitle")}</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("consMom.proofCopy")}</p></div></div>
            </section>
          </aside>
        </section>
      </article>
    </ConsumerShell>
  );
}
