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
import "./PromorangPresents.css";

const FOUNDING_CODES = ["PRESENTS", "ILHH", "ENCORE", "FIRST100"];
const ACCESS_KEY = "promorang_presents_access";

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

function cleanCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function makeInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `PR-${suffix}`;
}

export default function PromorangPresents() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(() => cleanCode(params.get("code") || params.get("invite") || ""));
  const [access, setAccess] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [inviteCodes, setInviteCodes] = useState<string[]>([]);

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

  const spots = useMemo(() => Math.max(17, 100 - 63 - inviteCodes.length), [inviteCodes.length]);

  const redeem = (event: FormEvent) => {
    event.preventDefault();
    setChecking(true);
    setMessage("");
    window.setTimeout(() => {
      const normalized = cleanCode(code);
      const valid = FOUNDING_CODES.includes(normalized) || /^PR-[A-Z2-9]{6}$/.test(normalized);
      setChecking(false);
      if (!valid) {
        setMessage("That code isn’t on the list. Ask the person who invited you for a fresh one.");
        return;
      }
      const created = [makeInviteCode(), makeInviteCode(), makeInviteCode()];
      localStorage.setItem(ACCESS_KEY, JSON.stringify({ accepted: true, code: normalized, inviteCodes: created }));
      setInviteCodes(created);
      setAccess(true);
      setMessage("");
      toast.success("You’re on the inside.");
      document.getElementById("inside")?.scrollIntoView({ behavior: "smooth" });
    }, 480);
  };

  const copyInvite = async (invite: string) => {
    const url = `${window.location.origin}/presents?invite=${invite}`;
    await navigator.clipboard.writeText(url);
    toast.success("Invite link copied");
  };

  return (
    <main className="presents-shell">
      <section className="presents-hero" aria-labelledby="presents-title">
        <div className="presents-noise" />
        <nav className="presents-nav" aria-label="Promorang Presents">
          <Link to="/" className="presents-mark" aria-label="Promorang home">
            <span className="presents-mark-dot" />
            PROMORANG <em>PRESENTS</em>
          </Link>
          <a href="#access" className="presents-nav-link">Have a code? <ChevronRight size={15} /></a>
        </nav>

        <div className="presents-hero-grid">
          <div className="presents-hero-copy">
            <p className="presents-kicker"><span /> KINGSTON, BY INVITATION</p>
            <h1 id="presents-title">The night has<br />a <i>guest list.</i></h1>
            <p className="presents-lede">
              Promorang Presents is a private way into the rooms, tables, sounds and moments that money can’t always buy.
            </p>
            <a href="#access" className="presents-primary">Enter your access code <ArrowRight size={18} /></a>
            <div className="presents-proof">
              <div className="presents-avatars" aria-hidden="true"><span>KM</span><span>J</span><span>AE</span><span>+</span></div>
              <p><strong>63 founding insiders</strong><br />already have access</p>
            </div>
          </div>

          <div className="presents-ticket" aria-label="Founding season invitation">
            <div className="presents-ticket-top">
              <span>FOUNDING SEASON / 001</span><Sparkles size={17} />
            </div>
            <div className="presents-ticket-stage">
              <p>THIS WEEK</p>
              <strong>2</strong>
              <span>private drops</span>
            </div>
            <div className="presents-ticket-meta">
              <div><span>WED</span><strong>ENCORE</strong></div>
              <div><span>THU</span><strong>I LUV HIP HOP</strong></div>
            </div>
            <p className="presents-ticket-foot"><LockKeyhole size={14} /> Details unlock after entry</p>
          </div>
        </div>
      </section>

      <section className="presents-manifesto">
        <p>PROMORANG PRESENTS / PRIVATE EDITIONS</p>
        <h2>Not another event list.<br />A way <i>into</i> the night.</h2>
        <div className="presents-principles">
          <article><span>01</span><h3>Discover</h3><p>Find the rooms and moments actually worth showing up for.</p></article>
          <article><span>02</span><h3>Earn access</h3><p>Vote, participate and bring the right people. Your presence has value.</p></article>
          <article><span>03</span><h3>Pass it on</h3><p>Every insider gets a small number of invitations. Choose your crew well.</p></article>
        </div>
      </section>

      <section className="presents-editions" aria-labelledby="editions-title">
        <header><p>THE FIRST EDITIONS</p><h2 id="editions-title">Two nights. Two energies.</h2></header>
        <div className="presents-edition-grid">
          {editions.map((edition) => (
            <article className={`presents-edition presents-edition-${edition.tone}`} key={edition.id}>
              <div className="presents-edition-number">{edition.id === "encore" ? "01" : "02"}</div>
              <p className="presents-edition-eyebrow">{edition.eyebrow}</p>
              <h3>{edition.title}</h3>
              <p className="presents-edition-description">{edition.description}</p>
              <div className="presents-edition-meta"><span><Clock3 size={15} /> {edition.date}</span><span><MapPin size={15} /> {edition.location}</span></div>
              <div className="presents-unlock"><KeyRound size={19} /><div><span>CURRENT UNLOCK</span><strong>{edition.unlock}</strong><small>{edition.requirement}</small></div></div>
              <a href="#access">Request access <ArrowRight size={17} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="presents-gate" id="access" aria-labelledby="gate-title">
        <div className="presents-gate-copy">
          <p>PRIVATE BETA / FOUNDING 100</p>
          <h2 id="gate-title">Your invitation is the key.</h2>
          <p>Access is moving person to person. Enter a code from a Promorang insider, event host or partner to see this week’s private drops.</p>
          <div className="presents-capacity"><span style={{ width: `${100 - spots}%` }} /><p><strong>{spots} invitations remain</strong> in the founding release</p></div>
        </div>

        {!access ? (
          <form className="presents-code-card" onSubmit={redeem}>
            <div className="presents-code-icon"><KeyRound size={24} /></div>
            <label htmlFor="presents-code">ACCESS CODE</label>
            <div className="presents-code-row">
              <input id="presents-code" value={code} onChange={(e) => setCode(cleanCode(e.target.value))} placeholder="PR-XXXXXX" autoComplete="one-time-code" aria-describedby="code-message" />
              <button type="submit" disabled={!code || checking}>{checking ? "Checking…" : "Enter"}</button>
            </div>
            <p id="code-message" className={message ? "presents-code-error" : ""} aria-live="polite">{message || "Codes are single-purpose and may be withdrawn after use."}</p>
            <div className="presents-divider"><span />OR<span /></div>
            <Link to="/auth?mode=signup&source=presents" className="presents-request">Request founding access <ArrowRight size={16} /></Link>
          </form>
        ) : (
          <div className="presents-code-card presents-welcome" id="inside">
            <div className="presents-success"><Check size={25} /></div>
            <p className="presents-welcome-label">ACCESS CONFIRMED</p>
            <h3>You’re on the inside.</h3>
            <p>Your private drops are now visible. You also have three invitations—send them to people who make the room better.</p>
            <Link to="/discover/moments?collection=presents" className="presents-inside-cta">See this week’s drops <ArrowRight size={17} /></Link>
            <div className="presents-invites">
              <span><Users size={15} /> YOUR 3 INVITES</span>
              {inviteCodes.map((invite) => (
                <button key={invite} onClick={() => copyInvite(invite)} type="button"><code>{invite}</code><Copy size={15} /></button>
              ))}
            </div>
            <button className="presents-share" type="button" onClick={() => copyInvite(inviteCodes[0])}><Share2 size={16} /> Share your first invitation</button>
          </div>
        )}
      </section>

      <footer className="presents-footer"><span>PROMORANG PRESENTS</span><p>Show up. Stand out. Unlock more.</p><Link to="/privacy">Privacy</Link></footer>
    </main>
  );
}
