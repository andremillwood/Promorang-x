import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  Clock,
  MapPin,
  Music2,
  Share2,
  Sparkles,
  Ticket,
  Users,
  MessageCircle,
} from "lucide-react";
import SEO from "@/components/SEO";
import { generateEventSchema } from "@/lib/seo-schemas";
import { getSiteUrl } from "@/lib/discovery";
import { aftrHrsDigitalReleaseView, authPathForAftrHrsClaim, AFTRHRS_COPY, AFTRHRS_EVENT_SCHEDULE, AFTRHRS_OG_IMAGE, AFTRHRS_PATHS, AFTRHRS_START_ISO, isAftrHrsClaimReturn } from "@promorang/shared";
import { useAftrHrs, useAftrHrsAutoClaim } from "@/hooks/useAftrHrs";
import { useI18n } from "@/i18n/I18nContext";
import { localizedRemainingLabel } from "@/i18n/localize";
import type { TranslationKey } from "@/i18n/translations";
import { captureGrowthAttribution } from "@/lib/marketing-attribution";
import { markAftrHrsClaimPending } from "@/lib/aftrhrs-claim";
import { persistPostAuthNext } from "@/lib/post-auth-next";
import { toast } from "sonner";
import promorangLogo from "@/assets/promorang-logo-full.png";

function GradientText({ children }: { children: string }) {
  return (
    <span className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 ${className}`}>
      {children}
    </section>
  );
}

export default function AftrHrsExperience() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data, remainingPercent, soldOut, user, claim, join, ambassadorRequest, follow, track } = useAftrHrs();
  const { autoClaiming } = useAftrHrsAutoClaim();
  const [searchParams] = useSearchParams();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [selectedAmbassador, setSelectedAmbassador] = useState<string>("");
  const edition = data.edition;
  const venue = edition.venue_profiles;
  const postEvent = edition.page_mode === "post-event";
  const release = aftrHrsDigitalReleaseView({ soldOut, hasPass: Boolean(data.pass) });
  const shouldAutoClaim = Boolean(user) && (
    searchParams.get("claim") === "1" ||
    isAftrHrsClaimReturn(`${AFTRHRS_PATHS.landing}?${searchParams.toString()}`) ||
    isAftrHrsClaimReturn(`${AFTRHRS_PATHS.moment}?${searchParams.toString()}`)
  );

  useEffect(() => {
    captureGrowthAttribution();
    track.mutate("landing_view");
    // Fire once on first paint; the mutation identity is not part of the funnel contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (shouldAutoClaim && !data.pass && !soldOut) {
      document.getElementById("digital-pass")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [shouldAutoClaim, data.pass, soldOut]);

  const schema = useMemo(() => {
    const base = generateEventSchema({
      id: edition.moment_id,
      title: "AftrHrs at Sea Deck",
      description: t("aftrhrs.metaDescription"),
      location: venue?.address,
      venue_name: "Sea Deck",
      starts_at: edition.moments?.starts_at || AFTRHRS_START_ISO,
      image_url: getSiteUrl(edition.artwork.og || edition.artwork.flyer || AFTRHRS_OG_IMAGE.path),
      latitude: venue?.latitude,
      longitude: venue?.longitude,
      entry_fee_jmd: 0,
      city: "Kingston",
      country: "Jamaica",
      slug: "aftrhrs",
    });
    const { offers, ...rest } = base;
    const offer = offers && typeof offers === "object" ? { ...offers } : null;
    if (offer && "validThrough" in offer) delete offer.validThrough;
    return {
      ...rest,
      eventSchedule: AFTRHRS_EVENT_SCHEDULE,
      ...(offer ? { offers: offer } : {}),
    };
  }, [edition, venue]);

  const share = async () => {
    const url = getSiteUrl(AFTRHRS_PATHS.landing);
    const text = `${AFTRHRS_COPY.headline} ${AFTRHRS_COPY.metaDescription}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: AFTRHRS_COPY.metaTitle, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("aftrhrs.linkCopied"));
      }
      track.mutate("share");
    } catch {
      await navigator.clipboard.writeText(url);
        toast.success(t("aftrhrs.linkCopiedShort"));
    }
  };

  const startClaim = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!termsAccepted) {
      toast.error(t("aftrhrs.confirmTerms"));
      return;
    }
    if (!user) {
      markAftrHrsClaimPending();
      window.location.assign(authPathForAftrHrsClaim());
      return;
    }
    if (!termsAccepted) {
      toast.error(t("aftrhrs.confirmTerms"));
      return;
    }
    setClaiming(true);
    try {
      await claim.mutateAsync(true);
      toast.success(t("aftrhrs.passSecuredToast"));
      navigate(AFTRHRS_PATHS.passAlias, { replace: true });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "sold_out") {
        toast.message(t("aftrhrs.lastClaimed"));
        document.getElementById("ambassadors")?.scrollIntoView({ behavior: "smooth" });
      } else {
        toast.error(error instanceof Error ? error.message : t("aftrhrs.claimFailed"));
      }
    } finally {
      setClaiming(false);
    }
  };

  const joinMoment = async () => {
    if (!user) {
      persistPostAuthNext(AFTRHRS_PATHS.landing);
      window.location.assign(authPathForAftrHrsClaim(AFTRHRS_PATHS.landing));
      return;
    }
    try {
      await join.mutateAsync();
      toast.success(t("aftrhrs.joinedToast"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("aftrhrs.joinFailed"));
    }
  };

  const remainingLabel = localizedRemainingLabel(remainingPercent, soldOut, t);
  const releaseCta =
    release.kind === "pass"
      ? t("aftrhrs.ctaPass")
      : release.kind === "sold_out"
        ? t("aftrhrs.ctaAmbassador")
        : t("aftrhrs.ctaClaim");

  const mapsUrl = venue?.latitude && venue?.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue?.address || "Sea Deck Orchid Village Kingston")}`;

  const heroCta =
    release.kind === "pass" ? (
      <Link to={AFTRHRS_PATHS.passAlias} className="rounded-full bg-white px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-black">
        {releaseCta}
      </Link>
    ) : release.kind === "sold_out" ? (
      <a href="#ambassadors" className="rounded-full bg-white px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-black">
        {releaseCta}
      </a>
    ) : (
      <a href="#digital-pass" className="rounded-full bg-white px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-black">
        {releaseCta}
      </a>
    );

  return (
    <main className="min-h-screen bg-black text-white">
      <SEO
        title={t("aftrhrs.metaTitle")}
        description={t("aftrhrs.metaDescription")}
        image={getSiteUrl(edition.artwork.og || edition.artwork.flyer || AFTRHRS_OG_IMAGE.path)}
        imageAlt={AFTRHRS_OG_IMAGE.alt}
        imageType={AFTRHRS_OG_IMAGE.type}
        imageWidth={AFTRHRS_OG_IMAGE.width}
        imageHeight={AFTRHRS_OG_IMAGE.height}
        url={getSiteUrl(AFTRHRS_PATHS.landing)}
        type="website"
        schema={schema}
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to={AFTRHRS_PATHS.landing} className="flex items-center gap-3">
            <img src={edition.artwork.logo} alt="AftrHrs House Music" className="h-10 w-auto object-contain sm:h-12" />
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.32em] text-white/55 sm:block">{t("aftrhrs.houseMusic")}</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="https://promorang.co" className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 sm:flex" aria-label="Powered by PROMORANG">
              <img src={promorangLogo} alt="" className="h-4 w-auto object-contain" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/80">{t("aftrhrs.powered")}</span>
            </a>
            <Link to={AFTRHRS_PATHS.venue} className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/80">
              {t("aftrhrs.seaDeck")}
            </Link>
            <button type="button" onClick={share} className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/80">
              {t("aftrhrs.share")}
            </button>
          </div>
        </div>
      </header>

      <div className="relative overflow-hidden border-b border-white/10">
        <img src={edition.artwork.flyer} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(192,38,211,0.32),transparent_42%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.2),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.15),#000)]" />
        <div className="absolute left-1/2 top-[46%] h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 shadow-[0_0_120px_rgba(255,255,255,0.12)] sm:h-[34rem] sm:w-[34rem]" />
        <Section className="relative z-10 pb-20 pt-12 sm:pb-24 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">
                {t("aftrhrs.tagline")}
              </p>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
                {t("aftrhrs.poweredByOrigin")}
              </p>
              <h1 className="mt-4 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.86] tracking-[-0.07em] sm:text-7xl">
                {(() => {
                  const [before, after] = t("aftrhrs.headline", { house: "|||HOUSE|||" }).split("|||HOUSE|||");
                  return <>{before}<GradientText>{t("aftrhrs.house")}</GradientText>{after}</>;
                })()}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">{edition.supporting_copy}</p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                <span className="rounded-full border border-white/15 px-3 py-1.5">{t("aftrhrs.seaDeck")}</span>
                <span className="rounded-full border border-white/15 px-3 py-1.5">{t("aftrhrs.when")}</span>
                <span className="rounded-full border border-white/15 px-3 py-1.5">{t("aftrhrs.doors")}</span>
                <span className="rounded-full border border-white/15 px-3 py-1.5">{t("aftrhrs.genres")}</span>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {heroCta}
                <Link to={AFTRHRS_PATHS.venue} className="rounded-full border border-white/20 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">
                  {t("aftrhrs.viewVenue")}
                </Link>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                  {remainingLabel}
                </p>
              </div>
            </div>
            <figure className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-fuchsia-500/25 via-transparent to-cyan-400/20 blur-2xl" />
              <img
                src={edition.artwork.invite}
                alt={t("aftrhrs.inviteAlt")}
                className="relative z-10 w-full rounded-[1.75rem] border border-white/15 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              />
              <figcaption className="relative z-10 mt-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
                {t("aftrhrs.inviteOnly")}
              </figcaption>
            </figure>
          </div>
        </Section>
      </div>

      {postEvent ? (
        <Section>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-fuchsia-300">{t("aftrhrs.afterNight")}</p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">{t("aftrhrs.recapTitle")}</h2>
          <p className="mt-4 max-w-2xl text-white/65">{t("aftrhrs.recapCopy")}</p>
          <button type="button" onClick={joinMoment} className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">
            {t("aftrhrs.stayIn")}
          </button>
        </Section>
      ) : null}

      <Section id="digital-pass">
        {data.pass ? (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">{t("aftrhrs.passSecured")}</p>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">{t("aftrhrs.yourPass")}</h2>
              <p className="mt-4 max-w-xl text-white/68">{t("aftrhrs.confirmation")}</p>
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em] text-fuchsia-300">{t("aftrhrs.arrivalRule")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={AFTRHRS_PATHS.passAlias} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">{t("aftrhrs.presentPass")}</Link>
                <Link to="/wallet" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.16em]">{t("common.wallet")}</Link>
              </div>
            </div>
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex justify-center rounded-2xl bg-white p-4">
                <QRCodeSVG value={data.pass.qr_payload} size={180} />
              </div>
              <p className="mt-4 text-center font-mono text-lg font-black tracking-[0.18em]">{data.pass.unique_code}</p>
            </article>
          </div>
        ) : release.kind === "sold_out" ? (
          <div className="rounded-[2rem] border border-cyan-300/30 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_50%)] p-6 sm:p-10">
            <h2 className="text-4xl font-black uppercase tracking-[-0.05em]">{t("aftrhrs.soldOutHeadline")}</h2>
            <p className="mt-4 max-w-2xl text-white/70">{t("aftrhrs.soldOutBody")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#ambassadors" className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">{t("aftrhrs.ctaAmbassador")}</a>
              <button
                type="button"
                onClick={() => ambassadorRequest.mutate({ waitlist: true })}
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.16em]"
              >
                {t("aftrhrs.ctaWaitlist")}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-fuchsia-300">{t("aftrhrs.limitedPass")}</p>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">{t("aftrhrs.limitedTitle")}</h2>
              <p className="mt-4 text-white/68">
                {t("aftrhrs.limitedCopy")}
              </p>
              <p className="mt-3 text-sm font-bold text-fuchsia-200">{t("aftrhrs.arrivalRule")}</p>
              {shouldAutoClaim && user ? (
                <p className="mt-3 text-sm font-bold text-cyan-200">{t("aftrhrs.lastStep")}</p>
              ) : (
                <p className="mt-3 text-sm text-white/55">{t("aftrhrs.findPass")}</p>
              )}
              <form onSubmit={startClaim} className="mt-6 space-y-4">
                <label className="flex items-start gap-3 text-sm text-white/75">
                  <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1" />
                  {t("aftrhrs.terms")}
                </label>
                <button
                  type="submit"
                  disabled={claiming || autoClaiming}
                  className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-60"
                >
                  {claiming || autoClaiming ? t("aftrhrs.securing") : user ? t("aftrhrs.claimCta") : t("aftrhrs.signInClaim")}
                </button>
              </form>
            </div>
            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">{t("aftrhrs.freePasses")}</p>
              <p className="mt-4 text-6xl font-black tracking-[-0.06em]">{remainingPercent}%</p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-fuchsia-400 to-cyan-300" style={{ width: `${remainingPercent}%` }} />
              </div>
            </aside>
          </div>
        )}
      </Section>

      <Section id="ambassadors" className="border-y border-white/10 bg-white/[0.02]">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">{t("aftrhrs.physical")}</p>
        <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">{t("aftrhrs.ambassadors")}</h2>
        <p className="mt-4 max-w-2xl text-white/68">{t("aftrhrs.ambassadorCopy")}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {data.ambassadors.map((ambassador) => {
            const whatsapp = ambassador.publicContactHandle
              ? `https://wa.me/?text=${encodeURIComponent(t("aftrhrs.whatsappText", { name: ambassador.name }))}`
              : null;
            return (
              <article key={ambassador.id} className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <div className="flex items-center gap-3">
                  <img src={ambassador.profileImage || edition.artwork.logo} alt="" className="h-14 w-14 rounded-full object-cover" />
                  <div>
                    <h3 className="text-lg font-black">{ambassador.name}</h3>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">{t("aftrhrs.ambassadorRole")}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-white/65">
                  {ambassador.distributionLocations.map((place) => (
                    <li key={place.label}><strong className="text-white">{place.label}.</strong> {place.detail}</li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAmbassador(ambassador.id);
                      ambassadorRequest.mutate({ ambassadorId: ambassador.id, note: requestNote });
                      toast.success(t("aftrhrs.requestSent"));
                    }}
                    className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black"
                  >
                    {t("aftrhrs.requestInvite")}
                  </button>
                  {whatsapp ? (
                    <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  ) : (
                    <Link to={ambassador.profilePath} className="rounded-full border border-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                      {t("aftrhrs.profile")}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            ambassadorRequest.mutate({ ambassadorId: selectedAmbassador || undefined, note: requestNote, waitlist: !selectedAmbassador });
            toast.success(selectedAmbassador ? t("aftrhrs.requestSubmitted") : t("aftrhrs.onRequestList"));
          }}
        >
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">{t("aftrhrs.requestListLabel")}</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              value={requestNote}
              onChange={(event) => setRequestNote(event.target.value)}
              placeholder={t("aftrhrs.requestPh")}
              className="h-12 flex-1 rounded-2xl border border-white/15 bg-black px-4 text-sm"
            />
            <button type="submit" className="h-12 rounded-2xl border border-white/20 px-5 text-xs font-black uppercase tracking-[0.16em]">
              {t("aftrhrs.joinList")}
            </button>
          </div>
        </form>
      </Section>

      <Section id="moment">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-fuchsia-300">{t("aftrhrs.momentEyebrow")}</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">{t("aftrhrs.joinMoment")}</h2>
            <p className="mt-4 max-w-xl text-white/68">{t("aftrhrs.momentCopy")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={joinMoment} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">
                {data.participation ? t("aftrhrs.youreIn") : t("aftrhrs.interested")}
              </button>
              <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.16em]">
                <Share2 className="h-4 w-4" /> {t("aftrhrs.inviteFriends")}
              </button>
              <span className="inline-flex items-center gap-2 text-sm text-white/55">
                <Users className="h-4 w-4 text-cyan-300" /> {t("aftrhrs.going", { count: data.communityCount })}
              </span>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">{t("aftrhrs.theNight")}</p>
            <ol className="mt-4 space-y-2 text-sm text-white/70">
              {[t("aftrhrs.stepClaim"), t("aftrhrs.stepArrive"), t("aftrhrs.stepPresent")].map((step) => (
                <li key={step} className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-fuchsia-300" /> {step}</li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section id="experience" className="border-y border-white/10">
        <h2 className="text-4xl font-black uppercase tracking-[-0.05em]">{t("aftrhrs.theNight")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Music2, title: t("aftrhrs.houseDirection"), body: t("aftrhrs.houseDirectionCopy") },
            { icon: MapPin, title: t("aftrhrs.seaDeck"), body: venue?.description || t("aftrhrs.venueCopy") },
            { icon: Ticket, title: t("aftrhrs.howIn"), body: t("aftrhrs.howInCopy", { price: edition.paid_admission_jmd, benefit: edition.paid_patron_benefit }) },
          ].map((card) => (
            <article key={card.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <card.icon className="h-5 w-5 text-cyan-300" />
              <h3 className="mt-4 text-xl font-black">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{card.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-white/45">{edition.venue_policies?.entry_policy}</p>
      </Section>

      <Section id="sea-deck">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">{t("aftrhrs.venue")}</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">Sea Deck</h2>
            <p className="mt-4 text-white/68">{venue?.description}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/70"><MapPin className="h-4 w-4" /> {venue?.address}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/70"><Calendar className="h-4 w-4" /> {t("aftrhrs.when")}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/70"><Clock className="h-4 w-4" /> {t("aftrhrs.doors")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={AFTRHRS_PATHS.venue} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">{t("aftrhrs.openVenue")}</Link>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.16em]">{t("common.directions")}</a>
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    persistPostAuthNext(AFTRHRS_PATHS.landing);
                    window.location.assign(authPathForAftrHrsClaim(AFTRHRS_PATHS.landing));
                    return;
                  }
                  follow.mutate(!data.followingVenue);
                }}
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.16em]"
              >
                {data.followingVenue ? t("aftrhrs.following") : t("aftrhrs.follow")}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(venue?.images || []).slice(0, 4).map((image) => (
              <img key={image.url} src={image.url} alt={image.alt || "Sea Deck"} className="h-40 w-full rounded-2xl object-cover sm:h-52" />
            ))}
          </div>
        </div>
      </Section>

      <Section id="proof" className="border-y border-white/10 bg-white/[0.02]">
        <h2 className="text-4xl font-black uppercase tracking-[-0.05em]">{postEvent ? t("aftrhrs.whatKept") : t("aftrhrs.atSeaDeck")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <figure className="overflow-hidden rounded-3xl border border-white/10">
            <img src={edition.artwork.flyer} alt="AftrHrs flyer" className="h-64 w-full object-cover" />
            <figcaption className="p-4 text-sm text-white/60">{t("aftrhrs.when")} · {t("aftrhrs.seaDeck")}</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-3xl border border-white/10">
            <img src={edition.artwork.invite} alt="AftrHrs invitation" className="h-64 w-full object-cover" />
            <figcaption className="p-4 text-sm text-white/60">{t("aftrhrs.youInvited")}</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-3xl border border-white/10 bg-black p-6">
            <img src={edition.artwork.logo} alt="AftrHrs logo" className="mx-auto h-40 object-contain" />
            <figcaption className="mt-4 text-sm text-white/60">Origin: Alric & Boyd</figcaption>
          </figure>
        </div>
      </Section>

      <Section id="faq">
        <h2 className="text-4xl font-black uppercase tracking-[-0.05em]">{t("common.questions")}</h2>
        <div className="mt-8 space-y-3">
          {edition.faqs.map((faq, index) => {
            const localized = index <= 5;
            return (
            <details key={faq.question} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.08em]">{localized ? t(`aftrhrs.faq${index}q` as TranslationKey) : faq.question}</summary>
              <p className="mt-3 text-sm leading-6 text-white/65">{localized ? t(`aftrhrs.faq${index}a` as TranslationKey) : faq.answer}</p>
            </details>
            );
          })}
        </div>
      </Section>

      <footer className="border-t border-white/10 px-4 py-10 pb-28 text-center sm:pb-10">
        <a href="https://promorang.co" className="inline-flex flex-col items-center gap-3">
          <img src={promorangLogo} alt="PROMORANG" className="h-9 w-auto object-contain" />
          <span className="text-[11px] font-black uppercase tracking-[0.32em] text-white">{t("aftrhrs.powered")}</span>
        </a>
        <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/40">
          {t("aftrhrs.footerPlace")}
        </p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 p-3 backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
              {remainingLabel}
            </p>
            <p className="truncate text-xs text-white/55">{t("aftrhrs.when")} · {t("aftrhrs.doors")} · {t("aftrhrs.seaDeck")}</p>
          </div>
          {heroCta}
        </div>
      </div>
    </main>
  );
}
