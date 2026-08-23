import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  KeyRound,
  LockKeyhole,
  MapPin,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { getPresentsCatalog, redeemPresentsInvite } from "@/lib/presents";
import { trackGrowthEvent } from "@/lib/marketing-attribution";
import { useI18n } from "@/i18n/I18nContext";
import "./PromorangPresents.css";

const ACCESS_KEY = "promorang_presents_access";

function cleanCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export default function PromorangPresents() {
  const { t, formatNumber } = useI18n();
  const [params] = useSearchParams();
  const [code, setCode] = useState(() => cleanCode(params.get("code") || params.get("invite") || ""));
  const [access, setAccess] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [inviteCodes, setInviteCodes] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(37);

  const editions = [
    {
      id: "encore",
      eyebrow: "WEDNESDAY / SOCIAL + VIP",
      title: "Encore",
      date: "Every Wednesday",
      location: "Kingston",
      description: "A room built for crews. Unlock priority entry, secret tables and the people worth knowing.",
      unlock: "Secret table",
      requirement: "Bring 3 verified friends",
      tone: "amber",
    },
    {
      id: "ilhh",
      eyebrow: "THURSDAY / CULTURE LAB",
      title: "I Luv Hip Hop",
      date: "Every Thursday",
      location: "Kingston",
      description: "Vote on the sound of the night, find the next selector and earn your way inside the DJ booth.",
      unlock: "DJ booth access",
      requirement: "Vote + bring your crew",
      tone: "orange",
    },
  ];

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ACCESS_KEY) || "null");
      if (saved?.accepted) {
        setAccess(true);
        setInviteCodes(saved.inviteCodes || []);
      }
    } catch {
      localStorage.removeItem(ACCESS_KEY);
    }
  }, []);

  useEffect(() => {
    getPresentsCatalog().then(({ program }) => {
      if (typeof program.remaining === "number") setRemaining(program.remaining);
    }).catch(() => undefined);
    trackGrowthEvent({ eventName: "presents_viewed", journey: "participant", stage: "acquired", entityType: "presents_program", entityId: "founding-season", experimentKey: "presents-hero", experimentVariant: "guest-list" }).catch(() => undefined);
  }, []);

  const spots = useMemo(() => Math.max(0, remaining), [remaining]);

  const redeem = async (event: FormEvent) => {
    event.preventDefault();
    setChecking(true);
    setMessage("");
    try {
      const normalized = cleanCode(code);
      const result = await redeemPresentsInvite(normalized);
      localStorage.setItem(ACCESS_KEY, JSON.stringify({ accepted: true, code: normalized, membershipId: result.membership_id, inviteCodes: result.invite_codes }));
      setInviteCodes(result.invite_codes);
      setAccess(true);
      setRemaining((value) => Math.max(0, value - (result.already_member ? 0 : 1)));
      toast.success(t("promorangPresentsPage.onTheInsideTitle"));
      trackGrowthEvent({ eventName: "presents_invite_redeemed", journey: "participant", stage: "activated", entityType: "presents_membership", entityId: result.membership_id, properties: { program: result.program_slug, already_member: result.already_member } }).catch(() => undefined);
      document.getElementById("inside")?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("promorangPresentsPage.invalidCode"));
    } finally {
      setChecking(false);
    }
  };

  const copyInvite = async (invite: string) => {
    const url = `${window.location.origin}/presents?invite=${invite}`;
    await navigator.clipboard.writeText(url);
    toast.success(t("promorangPresentsPage.inviteCopied"));
  };

  return (
    <main className="presents-shell">
      <section className="presents-hero" aria-labelledby="presents-title">
        <div className="presents-noise" />
        <nav className="presents-nav" aria-label="Promorang Presents">
          <Link to="/" className="presents-mark" aria-label="Promorang home">
            <span className="presents-mark-dot" />
            {t("promorangPresentsPage.presentsMark")}
          </Link>
          <a href="#access" className="presents-nav-link">{t("promorangPresentsPage.haveCode")} <ChevronRight size={15} /></a>
        </nav>

        <div className="presents-hero-grid">
          <div className="presents-hero-copy">
            <p className="presents-kicker"><span /> {t("promorangPresentsPage.heroKicker")}</p>
            <h1 id="presents-title">{t("promorangPresentsPage.heroTitle1")}<br /><i>{t("promorangPresentsPage.heroTitle2")}</i></h1>
            <p className="presents-lede">
              {t("promorangPresentsPage.heroLede")}
            </p>
            <a href="#access" className="presents-primary">{t("promorangPresentsPage.enterAccessCode")} <ArrowRight size={18} /></a>
            <div className="presents-proof">
              <div className="presents-avatars" aria-hidden="true"><span>KM</span><span>J</span><span>AE</span><span>+</span></div>
              <p><strong>{formatNumber(100 - spots)} {t("promorangPresentsPage.foundingInsiders")}</strong><br />{t("promorangPresentsPage.alreadyHaveAccess")}</p>
            </div>
          </div>

          <div className="presents-ticket" aria-label="Founding season invitation">
            <div className="presents-ticket-top">
              <span>{t("promorangPresentsPage.ticketTop")}</span><Sparkles size={17} />
            </div>
            <div className="presents-ticket-stage">
              <p>{t("promorangPresentsPage.thisWeek")}</p>
              <strong>2</strong>
              <span>{t("promorangPresentsPage.privateDrops")}</span>
            </div>
            <div className="presents-ticket-meta">
              <div><span>{t("promorangPresentsPage.ticketWed")}</span><strong>ENCORE</strong></div>
              <div><span>{t("promorangPresentsPage.ticketThu")}</span><strong>I LUV HIP HOP</strong></div>
            </div>
            <p className="presents-ticket-foot"><LockKeyhole size={14} /> {t("promorangPresentsPage.detailsUnlock")}</p>
          </div>
        </div>
      </section>

      <section className="presents-manifesto">
        <p>{t("promorangPresentsPage.manifestoKicker")}</p>
        <h2>{t("promorangPresentsPage.manifestoTitle")}</h2>
        <div className="presents-principles">
          <article><span>01</span><h3>{t("promorangPresentsPage.prin1Title")}</h3><p>{t("promorangPresentsPage.prin1Desc")}</p></article>
          <article><span>02</span><h3>{t("promorangPresentsPage.prin2Title")}</h3><p>{t("promorangPresentsPage.prin2Desc")}</p></article>
          <article><span>03</span><h3>{t("promorangPresentsPage.prin3Title")}</h3><p>{t("promorangPresentsPage.prin3Desc")}</p></article>
        </div>
      </section>

      <section className="presents-editions" aria-labelledby="editions-title">
        <header><p>{t("promorangPresentsPage.firstEditions")}</p><h2 id="editions-title">{t("promorangPresentsPage.twoNights")}</h2></header>
        <div className="presents-edition-grid">
          {editions.map((edition) => (
            <article className={`presents-edition presents-edition-${edition.tone}`} key={edition.id}>
              <div className="presents-edition-number">{edition.id === "encore" ? "01" : "02"}</div>
              <p className="presents-edition-eyebrow">{edition.eyebrow}</p>
              <h3>{edition.title}</h3>
              <p className="presents-edition-description">{edition.description}</p>
              <div className="presents-edition-meta"><span><Clock3 size={15} /> {edition.date}</span><span><MapPin size={15} /> {edition.location}</span></div>
              <div className="presents-unlock"><KeyRound size={19} /><div><span>{t("promorangPresentsPage.currentUnlock")}</span><strong>{edition.unlock}</strong><small>{edition.requirement}</small></div></div>
              <a href="#access">{t("promorangPresentsPage.requestAccess")} <ArrowRight size={17} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="presents-gate" id="access" aria-labelledby="gate-title">
        <div className="presents-gate-copy">
          <p>{t("promorangPresentsPage.privateBeta")}</p>
          <h2 id="gate-title">{t("promorangPresentsPage.gateTitle")}</h2>
          <p>{t("promorangPresentsPage.gateDesc")}</p>
          <div className="presents-capacity"><span style={{ width: `${100 - spots}%` }} /><p><strong>{t("promorangPresentsPage.invitationsRemain", { count: formatNumber(spots) })}</strong> {t("promorangPresentsPage.inFoundingRelease")}</p></div>
        </div>

        {!access ? (
          <form className="presents-code-card" onSubmit={redeem}>
            <div className="presents-code-icon"><KeyRound size={24} /></div>
            <label htmlFor="presents-code">{t("promorangPresentsPage.accessCodeLabel")}</label>
            <div className="presents-code-row">
              <input id="presents-code" value={code} onChange={(e) => setCode(cleanCode(e.target.value))} placeholder="PR-XXXXXX" autoComplete="one-time-code" aria-describedby="code-message" />
              <button type="submit" disabled={!code || checking}>{checking ? t("promorangPresentsPage.checking") : t("promorangPresentsPage.enter")}</button>
            </div>
            <p id="code-message" className={message ? "presents-code-error" : ""} aria-live="polite">{message || t("promorangPresentsPage.singlePurposeNotice")}</p>
            <div className="presents-divider"><span />OR<span /></div>
            <Link to="/auth?mode=signup&source=presents" className="presents-request">{t("promorangPresentsPage.requestFoundingAccess")} <ArrowRight size={16} /></Link>
          </form>
        ) : (
          <div className="presents-code-card presents-welcome" id="inside">
            <div className="presents-success"><Check size={25} /></div>
            <p className="presents-welcome-label">{t("promorangPresentsPage.accessConfirmed")}</p>
            <h3>{t("promorangPresentsPage.onTheInsideTitle")}</h3>
            <p>{t("promorangPresentsPage.onTheInsideDesc")}</p>
            <Link to="/discover/moments?collection=presents" className="presents-inside-cta">{t("promorangPresentsPage.seeDrops")} <ArrowRight size={17} /></Link>
            <div className="presents-invites">
              <span><Users size={15} /> {t("promorangPresentsPage.yourThreeInvites")}</span>
              {inviteCodes.map((invite) => (
                <button key={invite} onClick={() => copyInvite(invite)} type="button"><code>{invite}</code><Copy size={15} /></button>
              ))}
            </div>
            <button className="presents-share" type="button" onClick={() => copyInvite(inviteCodes[0])}><Share2 size={16} /> {t("promorangPresentsPage.shareFirstInvite")}</button>
          </div>
        )}
      </section>

      <footer className="presents-footer"><span>{t("promorangPresentsPage.presentsMark")}</span><p>{t("promorangPresentsPage.footerTagline")}</p><Link to="/privacy">Privacy</Link></footer>
    </main>
  );
}

