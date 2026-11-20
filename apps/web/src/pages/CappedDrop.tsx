import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isProfileGateCode, profileCompletionHref, signInHref, type ProfileGateCode } from "@promorang/shared";
import SEO from "@/components/SEO";
import { CappedDropTicket } from "@/components/capped-drop/CappedDropTicket";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { cappedDropPollInterval, cappedDropView } from "@/lib/cappedDrop";
import { claimCappedDrop, fetchCappedDrop, notifyNextCappedDrop } from "@/services/cappedDrops";

export default function CappedDrop() {
  const { slug = "" } = useParams();
  const { t, formatNumber, formatDate } = useI18n();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(() => typeof document === "undefined" || document.visibilityState !== "hidden");
  const [notified, setNotified] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [profileGate, setProfileGate] = useState<ProfileGateCode | null>(null);
  const dropPath = `/capped-drop/${slug}`;

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  const dropQuery = useQuery({
    queryKey: ["capped-drop", slug],
    queryFn: () => fetchCappedDrop(slug, session?.access_token),
    enabled: Boolean(slug),
    refetchInterval: cappedDropPollInterval(visible),
    refetchIntervalInBackground: false,
  });

  const drop = dropQuery.data;
  const view = drop ? cappedDropView(drop) : null;
  const full = Boolean(view?.full || drop?.status === "closed");

  const claim = async () => {
    if (!user || !session?.access_token) {
      navigate(signInHref(dropPath));
      return;
    }
    setClaiming(true);
    try {
      const result = await claimCappedDrop(slug, session.access_token);
      setProfileGate(null);
      await queryClient.invalidateQueries({ queryKey: ["capped-drop", slug] });
      toast({ title: result?.already_claimed ? t("cappedDrop.alreadyYours") : t("cappedDrop.claimed") });
    } catch (error) {
      const coded = error as Error & { code?: string };
      if (isProfileGateCode(coded.code)) {
        setProfileGate(coded.code);
        return;
      }
      const message = coded.message || t("cappedDrop.couldNot");
      toast({ title: t("cappedDrop.couldNot"), description: message, variant: "destructive" });
      await queryClient.invalidateQueries({ queryKey: ["capped-drop", slug] });
    } finally {
      setClaiming(false);
    }
  };

  const notify = async () => {
    if (!user || !session?.access_token) {
      navigate(signInHref(dropPath));
      return;
    }
    try {
      await notifyNextCappedDrop(session.access_token);
      setNotified(true);
    } catch (error) {
      toast({ title: t("cappedDrop.couldNot"), description: (error as Error).message, variant: "destructive" });
    }
  };

  if (dropQuery.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-black text-white">{t("cappedDrop.loading")}</main>;
  }

  if (dropQuery.isError) {
    return (
      <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
        <div>
          <h1 className="font-serif text-4xl">{t("cappedDrop.couldNot")}</h1>
          <p className="mt-3 text-sm text-white/60">{(dropQuery.error as Error).message}</p>
        </div>
      </main>
    );
  }

  if (!drop || !view) {
    return (
      <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
        <div>
          <h1 className="font-serif text-4xl">{t("cappedDrop.missing")}</h1>
          <Link to="/discover" className="mt-6 inline-block text-primary">{t("cappedDrop.seeDiscover")}</Link>
        </div>
      </main>
    );
  }

  const detail = view.full
    ? t("cappedDrop.soldOut", { cap: formatNumber(view.cap) })
    : t("cappedDrop.left", { remaining: formatNumber(view.remaining), cap: formatNumber(view.cap) });
  const soldOutDetail = view.full && drop.sold_out_at
    ? t("cappedDrop.soldOutAt", { time: formatDate(drop.sold_out_at, { hour: "numeric", minute: "2-digit" }) })
    : null;

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <SEO title={drop.title} description={detail} />
      <CappedDropTicket
        kicker={t("cappedDrop.kicker", { cap: formatNumber(view.cap) })}
        title={drop.title}
        detail={detail}
        stub={formatNumber(view.remaining)}
        stubLabel={view.full ? t("cappedDrop.stubFull") : t("cappedDrop.stubLeft")}
        almostGoneLabel={view.almostGone ? t("cappedDrop.almostGone") : null}
        soldOutDetail={soldOutDetail}
      />
      <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3">
        {drop.status === "scheduled" && drop.opens_at ? (
          <p className="text-center text-sm text-white/60">{t("cappedDrop.scheduled", { time: formatDate(drop.opens_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) })}</p>
        ) : null}
        {profileGate ? (
          <div className="rounded-2xl border border-white/15 px-4 py-4 text-center" role="status">
            <p className="text-sm text-white/80">
              {profileGate === "AGE_REQUIRED" ? t("cappedDrop.ageRequired") : t("cappedDrop.countryRequired")}
            </p>
            <Link
              to={profileCompletionHref(dropPath)}
              className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-black text-black"
            >
              {t("cappedDrop.completeProfile")}
            </Link>
          </div>
        ) : (
          <button
            type="button"
            disabled={claiming || full || drop.status === "scheduled" || drop.already_claimed}
            onClick={claim}
            className="min-h-14 rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
          >
            {drop.already_claimed
              ? t("cappedDrop.alreadyYours")
              : view.full
                ? t("cappedDrop.soldOut", { cap: formatNumber(view.cap) })
                : user
                  ? t("cappedDrop.claim")
                  : t("cappedDrop.signIn")}
          </button>
        )}
        {full ? (
          <div className="text-center">
            <p className="text-sm text-white/70">{t("cappedDrop.notifyPrompt")}</p>
            <button type="button" onClick={notify} disabled={notified} className="mt-3 text-sm font-semibold text-primary disabled:opacity-60">
              {notified ? t("cappedDrop.notifySaved") : t("cappedDrop.notify")}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
