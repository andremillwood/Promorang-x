import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { aftrHrsDigitalReleaseView, authPathForAftrHrsClaim, AFTRHRS_COPY, AFTRHRS_PATHS, isAftrHrsClaimReturn } from "@promorang/shared";
import { useAftrHrs } from "@/hooks/useAftrHrs";
import { captureGrowthAttribution } from "@/lib/marketing-attribution";
import { persistPostAuthNext } from "@/lib/post-auth-next";
import { toast } from "sonner";

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
  const { data, remaining, soldOut, user, claim, join, ambassadorRequest, follow, track } = useAftrHrs();
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

  const schema = useMemo(
    () =>
      generateEventSchema({
        id: edition.moment_id,
        title: "AftrHrs at Sea Deck",
        description: AFTRHRS_COPY.metaDescription,
        location: venue?.address,
        venue_name: "Sea Deck",
        starts_at: edition.moments?.starts_at || "2026-09-11T22:00:00-05:00",
        image_url: edition.artwork.flyer,
        latitude: venue?.latitude,
        longitude: venue?.longitude,
        entry_fee_jmd: 0,
        city: "Kingston",
        country: "Jamaica",
        slug: "aftrhrs",
      }),
    [edition, venue],
  );

  const share = async () => {
    const url = getSiteUrl(AFTRHRS_PATHS.landing);
    const text = `${AFTRHRS_COPY.headline} ${AFTRHRS_COPY.metaDescription}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: AFTRHRS_COPY.metaTitle, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied for Instagram or WhatsApp.");
      }
      track.mutate("share");
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    }
  };

  const startClaim = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!user) {
      persistPostAuthNext(AFTRHRS_PATHS.claimReturn);
      window.location.assign(authPathForAftrHrsClaim());
      return;
    }
    if (!termsAccepted) {
      toast.error("Confirm the event terms to claim a pass.");
      return;
    }
    setClaiming(true);
    try {
      await claim.mutateAsync(true);
      toast.success("Your AftrHrs Digital Free Pass is secured.");
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "sold_out") {
        toast.message("The last Digital Free Pass was just claimed.");
        document.getElementById("ambassadors")?.scrollIntoView({ behavior: "smooth" });
      } else {
        toast.error(error instanceof Error ? error.message : "Could not claim this pass.");
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
      toast.success("You joined the AftrHrs Moment.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not join the Moment.");
    }
  };

  const mapsUrl = venue?.latitude && venue?.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue?.address || "Sea Deck Orchid Village Kingston")}`;

  const heroCta =
    release.kind === "pass" ? (
      <Link to={AFTRHRS_PATHS.pass} className="rounded-full bg-white px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-black">
        {release.primaryCta}
      </Link>
    ) : release.kind === "sold_out" ? (
      <a href="#ambassadors" className="rounded-full bg-white px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-black">
        {release.primaryCta}
      </a>
    ) : (
      <a href="#digital-pass" className="rounded-full bg-white px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-black">
        {release.primaryCta}
      </a>
    );

  return (
    <main className="min-h-screen bg-black text-white">
      <SEO
        title={AFTRHRS_COPY.metaTitle}
        description={AFTRHRS_COPY.metaDescription}
        image={getSiteUrl(edition.artwork.og || edition.artwork.flyer)}
        url={getSiteUrl(AFTRHRS_PATHS.landing)}
        type="website"
        schema={schema}
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to={AFTRHRS_PATHS.landing} className="flex items-center gap-3">
            <img src={edition.artwork.logo} alt="AftrHrs House Music" className="h-10 w-auto object-contain sm:h-12" />
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.32em] text-white/55 sm:block">House Music</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to={AFTRHRS_PATHS.venue} className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/80">
              Sea Deck
            </Link>
            <button type="button" onClick={share} className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/80">
              Share
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
                Good music · Good people · After hours
              </p>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
                Powered by Origin: Alric & Boyd
              </p>
              <h1 className="mt-4 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.86] tracking-[-0.07em] sm:text-7xl">
                After hours is where <GradientText>house</GradientText> lives.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">{edition.supporting_copy}</p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                <span className="rounded-full border border-white/15 px-3 py-1.5">Sea Deck</span>
                <span className="rounded-full border border-white/15 px-3 py-1.5">September 11</span>
                <span className="rounded-full border border-white/15 px-3 py-1.5">10:00 PM until</span>
                <span className="rounded-full border border-white/15 px-3 py-1.5">Afro House • Classic House • House Fusion</span>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {heroCta}
                <Link to={AFTRHRS_PATHS.venue} className="rounded-full border border-white/20 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">
                  View Sea Deck
                </Link>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                  {soldOut ? "20 / 20 claimed" : `${remaining} of ${edition.digital_allocation} digital passes left`}
                </p>
              </div>
            </div>
            <figure className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-fuchsia-500/25 via-transparent to-cyan-400/20 blur-2xl" />
              <img
                src={edition.artwork.invite}
                alt="You are invited to AftrHrs at Sea Deck"
                className="relative z-10 w-full rounded-[1.75rem] border border-white/15 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              />
              <figcaption className="relative z-10 mt-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
                Invitation only · Limited digital release
              </figcaption>
            </figure>
          </div>
        </Section>
      </div>

      {postEvent ? (
        <Section>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-fuchsia-300">After the night</p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">The recap stays. The next edition opens.</h2>
          <p className="mt-4 max-w-2xl text-white/65">Historical event details remain. Register interest for the next AftrHrs so Promorang can bring you back first.</p>
          <button type="button" onClick={joinMoment} className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">
            Stay in the AftrHrs Moment
          </button>
        </Section>
      ) : null}

      <Section id="digital-pass">
        {data.pass ? (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Pass secured</p>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">Your Digital Free Pass</h2>
              <p className="mt-4 max-w-xl text-white/68">{AFTRHRS_COPY.confirmation}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={AFTRHRS_PATHS.pass} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">Present pass</Link>
                <Link to="/wallet" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.16em]">Wallet</Link>
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
            <h2 className="text-4xl font-black uppercase tracking-[-0.05em]">{release.headline}</h2>
            <p className="mt-4 max-w-2xl text-white/70">{release.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#ambassadors" className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">{release.primaryCta}</a>
              <button
                type="button"
                onClick={() => ambassadorRequest.mutate({ waitlist: true })}
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.16em]"
              >
                {release.secondaryCta}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-fuchsia-300">Limited Digital Free Pass</p>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">Only 20 available</h2>
              <p className="mt-4 text-white/68">
                This pass is free admission to this AftrHrs edition. One pass per authenticated person. Inventory is held on the server — the counter here is only a live reading.
              </p>
              <p className="mt-3 text-sm text-white/50">Claims close at event start unless an administrator opens a different window.</p>
              <form onSubmit={startClaim} className="mt-6 space-y-4">
                <label className="flex items-start gap-3 text-sm text-white/75">
                  <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1" />
                  I understand admission is subject to Sea Deck capacity, entry policies, and successful pass verification.
                </label>
                <button
                  type="submit"
                  disabled={claiming}
                  className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-60"
                >
                  {claiming ? "Securing…" : user ? "Claim My Free Pass" : "Sign in to claim"}
                </button>
              </form>
            </div>
            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Live inventory</p>
              <p className="mt-4 text-6xl font-black tracking-[-0.06em]">{remaining}</p>
              <p className="text-sm text-white/55">Digital Free Passes remaining</p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-fuchsia-400 to-cyan-300" style={{ width: `${(remaining / edition.digital_allocation) * 100}%` }} />
              </div>
            </aside>
          </div>
        )}
      </Section>

      <Section id="ambassadors" className="border-y border-white/10 bg-white/[0.02]">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Physical invitations</p>
        <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">AftrHrs Ambassadors</h2>
        <p className="mt-4 max-w-2xl text-white/68">{AFTRHRS_COPY.ambassador}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {data.ambassadors.map((ambassador) => {
            const whatsapp = ambassador.publicContactHandle
              ? `https://wa.me/?text=${encodeURIComponent(`Hello ${ambassador.name}, I would like a physical AftrHrs invitation for September 11 at Sea Deck.`)}`
              : null;
            return (
              <article key={ambassador.id} className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <div className="flex items-center gap-3">
                  <img src={ambassador.profileImage || edition.artwork.logo} alt="" className="h-14 w-14 rounded-full object-cover" />
                  <div>
                    <h3 className="text-lg font-black">{ambassador.name}</h3>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">Approved · {ambassador.remaining} remaining</p>
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
                      toast.success("Request sent to this ambassador.");
                    }}
                    className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black"
                  >
                    Request invitation
                  </button>
                  {whatsapp ? (
                    <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  ) : (
                    <Link to={ambassador.profilePath} className="rounded-full border border-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                      Promorang profile
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
            toast.success(selectedAmbassador ? "Ambassador request submitted." : "You are on the request list.");
          }}
        >
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">If no ambassador is free, join the request list</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              value={requestNote}
              onChange={(event) => setRequestNote(event.target.value)}
              placeholder="Name or how we can find you at Sea Deck"
              className="h-12 flex-1 rounded-2xl border border-white/15 bg-black px-4 text-sm"
            />
            <button type="submit" className="h-12 rounded-2xl border border-white/20 px-5 text-xs font-black uppercase tracking-[0.16em]">
              Join request list
            </button>
          </div>
        </form>
      </Section>

      <Section id="moment">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-fuchsia-300">Promorang Moment</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">Join the AftrHrs Moment</h2>
            <p className="mt-4 max-w-xl text-white/68">{AFTRHRS_COPY.moment}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={joinMoment} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">
                {data.participation ? `You're ${data.participation.state.replaceAll("_", " ")}` : "I'm interested"}
              </button>
              <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.16em]">
                <Share2 className="h-4 w-4" /> Invite friends
              </button>
              <span className="inline-flex items-center gap-2 text-sm text-white/55">
                <Users className="h-4 w-4 text-cyan-300" /> {data.communityCount} in the Moment
              </span>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Lifecycle</p>
            <ol className="mt-4 space-y-2 text-sm text-white/70">
              {["Discovered", "Interested", "Pass requested", "Digital pass claimed", "Ambassador request", "Physical invitation", "Checked in", "Attended"].map((step) => (
                <li key={step} className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-fuchsia-300" /> {step}</li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section id="experience" className="border-y border-white/10">
        <h2 className="text-4xl font-black uppercase tracking-[-0.05em]">The night</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Music2, title: "House direction", body: "Afro House, Classic House and House Fusion, selected by Origin: Alric & Boyd." },
            { icon: MapPin, title: "Sea Deck", body: venue?.description || AFTRHRS_COPY.venue },
            { icon: Ticket, title: "How you get in", body: `Free with a valid invitation or RSVP. Without one, JMD $${edition.paid_admission_jmd}. Paid patrons receive ${edition.paid_patron_benefit}.` },
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
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Venue</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">Sea Deck</h2>
            <p className="mt-4 text-white/68">{venue?.description}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/70"><MapPin className="h-4 w-4" /> {venue?.address}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/70"><Calendar className="h-4 w-4" /> September 11</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/70"><Clock className="h-4 w-4" /> 10:00 PM until</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={AFTRHRS_PATHS.venue} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">Open venue profile</Link>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.16em]">Directions</a>
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
                {data.followingVenue ? "Following Sea Deck" : "Follow Sea Deck"}
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
        <h2 className="text-4xl font-black uppercase tracking-[-0.05em]">{postEvent ? "What the night kept" : "Proof before the room fills"}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <figure className="overflow-hidden rounded-3xl border border-white/10">
            <img src={edition.artwork.flyer} alt="AftrHrs flyer" className="h-64 w-full object-cover" />
            <figcaption className="p-4 text-sm text-white/60">AftrHrs promotional artwork. Video can be added by an administrator when supplied.</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-3xl border border-white/10">
            <img src={edition.artwork.invite} alt="AftrHrs invitation" className="h-64 w-full object-cover" />
            <figcaption className="p-4 text-sm text-white/60">Physical invitation language. Ambassadors carry the remaining free access.</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-3xl border border-white/10 bg-black p-6">
            <img src={edition.artwork.logo} alt="AftrHrs logo" className="mx-auto h-40 object-contain" />
            <figcaption className="mt-4 text-sm text-white/60">Origin: Alric & Boyd. Partner acknowledgements stay here without inventing extra credits.</figcaption>
          </figure>
        </div>
      </Section>

      <Section id="faq">
        <h2 className="text-4xl font-black uppercase tracking-[-0.05em]">Questions</h2>
        <div className="mt-8 space-y-3">
          {edition.faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.08em]">{faq.question}</summary>
              <p className="mt-3 text-sm leading-6 text-white/65">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <footer className="border-t border-white/10 px-4 py-10 pb-28 text-center text-xs uppercase tracking-[0.18em] text-white/40 sm:pb-10">
        Sea Deck, Orchid Village · 20 Barbican Road · A Promorang Moment
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 p-3 backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
              {soldOut ? "Digital passes claimed" : `${remaining} digital passes left`}
            </p>
            <p className="truncate text-xs text-white/55">September 11 · Sea Deck</p>
          </div>
          {heroCta}
        </div>
      </div>
    </main>
  );
}
