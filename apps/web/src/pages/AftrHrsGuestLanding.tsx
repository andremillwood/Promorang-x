import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { generateEventSchema } from "@/lib/seo-schemas";
import { getSiteUrl } from "@/lib/discovery";
import {
  AFTRHRS_COPY,
  AFTRHRS_EVENT_SCHEDULE,
  AFTRHRS_OG_IMAGE,
  AFTRHRS_PATHS,
  AFTRHRS_START_ISO,
  DEFAULT_AFTRHRS_GUEST_FAQS,
  guestLaneCopy,
  type AftrHrsGuestKind,
} from "@promorang/shared";
import { useAftrHrsGuest } from "@/hooks/useAftrHrs";
import { captureGrowthAttribution } from "@/lib/marketing-attribution";
import promorangLogo from "@/assets/promorang-logo-full.png";

function LaneMeter({
  kind,
  percent,
  soldOut,
  selected,
  onSelect,
}: {
  kind: AftrHrsGuestKind;
  percent: number;
  soldOut: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const copy = guestLaneCopy(kind, percent, soldOut);
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={copy.mood === "closed"}
      className={`rounded-[1.75rem] border p-5 text-left transition ${
        copy.mood === "closed"
          ? "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-70"
          : selected
            ? "border-fuchsia-300/50 bg-fuchsia-500/10"
            : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }`}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">{copy.eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em]">{copy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/65">{copy.body}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">{copy.label}</p>
        <p className="text-3xl font-black tracking-[-0.05em]">{copy.mood === "closed" ? "—" : `${percent}%`}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-gradient-to-r from-fuchsia-400 to-cyan-300" style={{ width: `${copy.mood === "closed" ? 0 : percent}%` }} />
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/45">{copy.detail}</p>
    </button>
  );
}

export default function AftrHrsGuestLanding() {
  const { edition, guest, rsvp } = useAftrHrsGuest();
  const [kind, setKind] = useState<AftrHrsGuestKind>("rsvp");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [done, setDone] = useState<{ kind: AftrHrsGuestKind; ticketPath?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rsvpCopy = guestLaneCopy("rsvp", guest.rsvp.remainingPercent, guest.rsvp.soldOut);
  const passCopy = guestLaneCopy("digital-pass", guest.digitalPass.remainingPercent, guest.digitalPass.soldOut);

  useEffect(() => {
    captureGrowthAttribution();
  }, []);

  useEffect(() => {
    if (kind === "rsvp" && rsvpCopy.mood === "closed" && passCopy.mood !== "closed") setKind("digital-pass");
    if (kind === "digital-pass" && passCopy.mood === "closed" && rsvpCopy.mood !== "closed") setKind("rsvp");
  }, [kind, rsvpCopy.mood, passCopy.mood]);

  const schema = useMemo(() => ({
    ...generateEventSchema({
      id: "aftrhrs",
      title: "AftrHrs at Sea Deck",
      description: AFTRHRS_COPY.metaDescription,
      location: "Orchid Village, 20 Barbican Road, Kingston",
      venue_name: "Sea Deck",
      starts_at: edition.moments?.starts_at || AFTRHRS_START_ISO,
      image_url: getSiteUrl(AFTRHRS_OG_IMAGE.path),
      city: "Kingston",
      country: "Jamaica",
      slug: "aftrhrs",
    }),
    eventSchedule: AFTRHRS_EVENT_SCHEDULE,
  }), [edition.moments?.starts_at]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const result = await rsvp.mutateAsync({ name, email, phone, kind, termsAccepted, website });
      if (result.silent) {
        setDone({ kind });
        return;
      }
      setDone({ kind: (result.kind as AftrHrsGuestKind) || kind, ticketPath: result.ticketPath });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save that. Try again.");
    }
  };

  const selectedCopy = kind === "rsvp" ? rsvpCopy : passCopy;
  const bothClosed = rsvpCopy.mood === "closed" && passCopy.mood === "closed";

  return (
    <main className="min-h-screen bg-black text-white">
      <SEO
        title={AFTRHRS_COPY.metaTitle}
        description={AFTRHRS_COPY.metaDescription}
        image={getSiteUrl(AFTRHRS_OG_IMAGE.path)}
        imageAlt={AFTRHRS_OG_IMAGE.alt}
        imageType={AFTRHRS_OG_IMAGE.type}
        imageWidth={AFTRHRS_OG_IMAGE.width}
        imageHeight={AFTRHRS_OG_IMAGE.height}
        url={getSiteUrl(AFTRHRS_PATHS.landing)}
        type="website"
        schema={schema}
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-3">
            <img src={edition.artwork.logo || "/campaigns/aftrhrs/logo.jpg"} alt="AftrHrs" className="h-10 w-auto object-contain" />
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/55">House music</span>
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Every Friday · Sea Deck</p>
        </div>
      </header>

      <div className="relative overflow-hidden">
        <img src={edition.artwork.flyer || "/campaigns/aftrhrs/flyer.jpg"} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(192,38,211,0.28),transparent_45%),linear-gradient(180deg,rgba(0,0,0,0.2),#000)]" />
        <section className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-fuchsia-200">Kingston After Dark</p>
          <h1 className="mt-4 max-w-xl font-sans text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-6xl">
            {AFTRHRS_COPY.guestLandingHeadline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70">{AFTRHRS_COPY.guestLandingLead}</p>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-cyan-200">{AFTRHRS_COPY.arrivalRule}</p>
        </section>
      </div>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        {done ? (
          <div className="rounded-[2rem] border border-cyan-300/30 bg-cyan-400/5 p-6 sm:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">You are in</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em]">
              {done.kind === "digital-pass" ? AFTRHRS_COPY.guestSuccessPass : AFTRHRS_COPY.guestSuccessRsvp}
            </h2>
            {done.ticketPath ? (
              <Link to={done.ticketPath} className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">
                Open my ticket
              </Link>
            ) : null}
            <p className="mt-6 text-sm leading-6 text-white/55">{AFTRHRS_COPY.guestUpsell}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <LaneMeter kind="rsvp" percent={guest.rsvp.remainingPercent} soldOut={guest.rsvp.soldOut} selected={kind === "rsvp"} onSelect={() => setKind("rsvp")} />
              <LaneMeter kind="digital-pass" percent={guest.digitalPass.remainingPercent} soldOut={guest.digitalPass.soldOut} selected={kind === "digital-pass"} onSelect={() => setKind("digital-pass")} />
            </div>

            <form onSubmit={submit} className="mt-8 space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-white/60">{selectedCopy.body}</p>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-white/50">{AFTRHRS_COPY.guestNameLabel}</span>
                <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-black px-3 text-base" />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-white/50">{AFTRHRS_COPY.guestEmailLabel}</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-black px-3 text-base" />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-white/50">{AFTRHRS_COPY.guestPhoneLabel}</span>
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" required className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-black px-3 text-base" />
              </label>
              <label className="hidden" aria-hidden="true">
                Company
                <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
              </label>
              <label className="flex items-start gap-3 text-sm text-white/75">
                <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1" />
                {AFTRHRS_COPY.guestTerms}
              </label>
              {error ? <p className="text-sm text-fuchsia-200">{error}</p> : null}
              <button
                type="submit"
                disabled={rsvp.isPending || bothClosed || selectedCopy.mood === "closed"}
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-50"
              >
                {rsvp.isPending ? "Saving…" : selectedCopy.cta}
              </button>
            </form>
          </>
        )}

        <dl className="mt-12 space-y-5">
          {DEFAULT_AFTRHRS_GUEST_FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="text-sm font-black uppercase tracking-[0.12em]">{faq.question}</dt>
              <dd className="mt-2 text-sm leading-6 text-white/60">{faq.answer}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
          <img src={promorangLogo} alt="" className="h-4 w-auto opacity-70" />
          {AFTRHRS_COPY.poweredBy}
        </p>
      </section>
    </main>
  );
}
